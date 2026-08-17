import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fileName: { type: String, required: true },
        fileType: { type: String, enum: ["contract", "invoice", "lease", "nda", "other"], default: "other" },

        cloudinaryUrl: { type: String, required: true },
        cloudinaryPublicId: { type: String, required: true },

        status: {
            type: String,
            enum: ["uploaded", "analyzing", "analyzed", "failed"],
            default: "uploaded",
        },

        fullText: { type: String },        // filled in after text extraction (next step)
        summary: { type: String },         // filled in after AI analysis
        riskScore: { type: Number },       // 0–100
        riskBreakdown: {
            financial: Number,
            legal: Number,
            missingProtections: Number,
        },

        obligations: [
            {
                title: String,        // e.g. "Contract renewal notice"
                date: Date,
                type: { type: String, enum: ["renewal", "expiry", "deadline", "review", "other"] },
            },
        ],
        payments: [
            {
                description: String,  // e.g. "Monthly service fee"
                amount: Number,
                currency: String,      // e.g. "USD", "EUR", "GBP" — documents can mix currencies
                dueDate: Date,
                recurring: Boolean,
                // extra context for documents containing multiple invoices/accounts,
                // where a single top-level invoiceDetails isn't enough
                invoiceNumber: String,
                vendor: String,
                accountNumber: String,
                billingPeriod: String,
            },
        ],
        flaggedClauses: [
            {
                title: String,
                explanation: String,
                severity: { type: String, enum: ["high", "medium", "low"] },
                category: { type: String, enum: ["financial", "legal", "missingProtections"] },
                quote: String,
            },
        ],

        // only populated when fileType is "invoice" — null/absent for contracts, leases, etc.
        invoiceDetails: {
            invoiceNumber: String,
            invoiceDate: Date,
            vendor: String,          // who issued the invoice, e.g. "Amazon Web Services EMEA SARL"
            accountNumber: String,
            billingPeriod: String,   // e.g. "July 1 - July 31, 2018"
            totalAmount: Number,
            currency: String,        // e.g. "USD", "EUR", "GBP"
        },
    },
    { timestamps: true } // adds createdAt / updatedAt automatically
);

export default mongoose.models.Document || mongoose.model("Document", DocumentSchema);