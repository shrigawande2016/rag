import { NextResponse } from "next/server";
import Document from '@/models/document'
import { PDFParse } from "pdf-parse";
import { connectToDatabase } from "@/lib/db";


export async function POST(request) {

    try {
        await connectToDatabase();
        const { documentId } = await request.json();
        const doc = await Document.findById(documentId);

        if (!doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }
        doc.status = "analyzing";
        await doc.save();


        // Fetch the actual PDF bytes from Cloudinary
        const fileRes = await fetch(doc.cloudinaryUrl);
        if (!fileRes.ok) {
            throw new Error(`Failed to fetch file from Cloudinary (status ${fileRes.status})`);
        }
        const arrayBuffer = await fileRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text
        const parser = new PDFParse({ data: buffer });
        const parsed = await parser.getText();
        doc.fullText = parsed.text;
        doc.status = "analyzed"; // for now — later this'll flip to "analyzed" only after AI summary/risk score too
        await doc.save();
        
        return NextResponse.json({ success: true, textLength: parsed.text.length });

    } catch (error) {
        console.error("Extraction failed:", error);
        // if it fails, mark it so the UI can show an error state instead of spinning forever
        return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
    }
}