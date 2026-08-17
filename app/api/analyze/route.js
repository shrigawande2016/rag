import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Document from "@/models/document";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SEVERITY_WEIGHTS = { high: 30, medium: 15, low: 5 };

const OBLIGATION_TYPES = new Set(["renewal", "expiry", "deadline", "review", "other"]);

const isValidDate = (value) => {
    if (!value) return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
};

function sanitizeObligations(obligations) {
    return (obligations || [])
        .filter((ob) => isValidDate(ob.date))
        .map((ob) => ({
            ...ob,
            type: OBLIGATION_TYPES.has(ob.type) ? ob.type : "other",
        }));
}

function sanitizePayments(payments) {
    return (payments || []).map((p) => ({
        ...p,
        dueDate: isValidDate(p.dueDate) ? p.dueDate : null,
    }));
}

// blank legal templates fill in names/dates/amounts with placeholders like
// "....", "___", "20___" instead of real values — detect a high density of
// these before spending an LLM call analyzing a document with nothing real in it.
const PLACEHOLDER_PATTERN = /_{3,}|\.{4,}/g;

function isBlankTemplate(text) {
    const matches = text.match(PLACEHOLDER_PATTERN) || [];
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount === 0) return false;
    // a real document might have a handful of blanks (signature lines, etc.);
    // a genuinely blank template has these packed densely throughout.
    return matches.length >= 15 || matches.length / wordCount > 0.02;
}

function calculateRiskScore(flaggedClauses) {
    const breakdown = { financial: 0, legal: 0, missingProtections: 0 };

    for (const clause of flaggedClauses) {
        const points = SEVERITY_WEIGHTS[clause.severity] || 0;
        if (breakdown[clause.category] !== undefined) {
            breakdown[clause.category] += points;
        }
    }

    for (const key in breakdown) {
        breakdown[key] = Math.min(breakdown[key], 100);
    }

    const overall = Math.min(
        Math.round((breakdown.financial + breakdown.legal + breakdown.missingProtections) / 3),
        100
    );

    return { overall, breakdown };
}


export async function POST(req) {
    try {
        await connectToDatabase();
        const { documentId } = await req.json();
        const doc = await Document.findById(documentId);

        if (!doc || !doc.fullText) {
            return NextResponse.json({ error: "Document text not found" }, { status: 404 });
        }

        if (isBlankTemplate(doc.fullText)) {
            doc.status = "failed";
            await doc.save();
            return NextResponse.json(
                { error: "This looks like a blank template, not a filled-out document. Please add a valid document." },
                { status: 422 }
            );
        }

        const SYSTEM_PROMPT = `You are analyzing a business document (contract, invoice, or lease). Extract information carefully and return ONLY valid JSON in exactly this shape:

{
  "fileType": "contract" | "invoice" | "lease" | "nda" | "other",
  "summary": "2-3 sentence plain-English summary of what this document is and its key terms",
  "flaggedClauses": [
    {
      "title": "short title",
      "explanation": "plain-English explanation of the risk, written for someone with no legal background",
      "severity": "high" | "medium" | "low",
      "category": "financial" | "legal" | "missingProtections",
      "quote": "the exact sentence(s) from the document that this clause is based on, copied verbatim"
    }
  ],
  "obligations": [
    {
      "title": "short description, e.g. 'Contract renewal notice due'",
      "date": "YYYY-MM-DD",
      "type": "renewal" | "expiry" | "deadline" | "review" | "other"
    }
  ],
  "payments": [
    {
      "description": "short description, e.g. 'Monthly service fee' or 'Invoice EINFR18-211 charges'",
      "amount": <number, no currency symbols>,
      "currency": "the currency code for this amount, e.g. 'USD', 'EUR', 'GBP', or null if unknown",
      "dueDate": "YYYY-MM-DD" or null if not date-specific,
      "recurring": true | false,
      "invoiceNumber": "the invoice number this charge belongs to, or null",
      "vendor": "who issued this charge, or null",
      "accountNumber": "the account this charge was billed to, or null",
      "billingPeriod": "the billing period as stated, e.g. 'July 1 - July 31, 2018', or null"
    }
  ],
  "invoiceDetails": {
    "invoiceNumber": "the invoice/tax invoice number, or null if not present",
    "invoiceDate": "YYYY-MM-DD, or null if not present",
    "vendor": "the company or entity that issued the invoice, or null",
    "accountNumber": "the customer/account number the invoice was issued to, or null",
    "billingPeriod": "the billing period as stated, e.g. 'July 1 - July 31, 2018', or null",
    "totalAmount": <number, the total amount due, no currency symbol, or null>,
    "currency": "the currency code of the total amount, e.g. 'USD', 'EUR', 'GBP', or null"
  }
}

Example of a well-formed flaggedClauses entry, given a lease document:
{
  "title": "Personal guarantee",
  "explanation": "You're personally on the hook for unpaid rent, not just the business. If the business can't pay, creditors can come after your personal assets.",
  "severity": "high",
  "category": "legal",
  "quote": "Guarantor unconditionally and irrevocably guarantees to Landlord the full and prompt payment and performance of all obligations of Tenant under this Lease."
}

Notice how the explanation translates legal language into plain consequences for the
reader ("you're personally on the hook"), while the quote preserves the document's
exact original wording so the user can verify it themselves.

Rules:
- If a category has nothing found, return an empty array for it — never omit the field.
- Only extract dates and amounts that are explicitly stated in the document as real, complete values. Some documents (e.g. blank legal templates) use placeholder text instead of real dates/amounts, such as "....", "20___", or blank underscores — if a date or amount is a placeholder rather than a real value, DO NOT invent a fake date like "YYYY-MM-DD" or "20___-MM-DD" to fill it in. Instead, omit that entire obligation/payment entry from the array entirely.
- Every "type" value in obligations must be exactly one of: "renewal", "expiry", "deadline", "review", "other" — never invent a new type value.
- The "quote" field must be copied verbatim from the document text — do not paraphrase or summarize it.
- Keep quotes reasonably short (1-3 sentences) — pull the specific clause, not surrounding paragraphs.
- flaggedClauses should cover real risks: one-sided terms, missing protections, unusual liability, auto-renewals without opt-out, etc.
- Only populate "invoiceDetails" if fileType is "invoice". For any other fileType, set every field in invoiceDetails to null.
- If a document contains multiple separate invoices, use the FIRST invoice's details for the top-level "invoiceDetails", and create ONE entry in "payments" per invoice, each with its OWN invoiceNumber, vendor, accountNumber, billingPeriod, currency, and totalAmount — don't leave those per-payment fields null just because invoiceDetails already covers the first one.
        `

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: doc.fullText.slice(0, 15000),
                },
            ]


        })

        console.log("LLM raw response:", completion.choices[0].message.content);

        const analysis = JSON.parse(completion.choices[0].message.content);
        console.log("LLM parsed analysis:", analysis);

        const { overall, breakdown } = calculateRiskScore(analysis.flaggedClauses || []);

        doc.summary = analysis.summary;
        doc.flaggedClauses = analysis.flaggedClauses || [];
        doc.obligations = sanitizeObligations(analysis.obligations);
        doc.payments = sanitizePayments(analysis.payments);
        doc.riskScore = overall;
        doc.riskBreakdown = breakdown;
        if (analysis.fileType) {
            doc.fileType = analysis.fileType;
        }
        doc.invoiceDetails = analysis.fileType === "invoice" ? (analysis.invoiceDetails || {}) : undefined;
        doc.status = "analyzed";
        await doc.save();

        return NextResponse.json(doc);

    } catch (error) {
        console.error("Analysis failed:", error);
        return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
    }
}
