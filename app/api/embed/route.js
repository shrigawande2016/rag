import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Document from "@/models/document";
import Chunk from "@/models/chunk";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {

    try {
        await connectToDatabase();

        const { documentId } = await req.json();
        const doc = await Document.findById(documentId);

        if (!doc || !doc.fullText) {
            return NextResponse.json({ error: "Document text not found" }, { status: 404 });
        }


        // 1. Split into overlapping chunks
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 800,      // ~roughly 150-200 tokens, good granularity for contract clauses
            chunkOverlap: 100,   // overlap so a clause split across a boundary isn't lost
        });
        const chunks = await splitter.splitText(doc.fullText);


        // 2. Embed all chunks in one batched API call (cheaper + faster than one-by-one)
        const embeddingRes = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: chunks,
        });

        // 3. Save each chunk + its vector
        const chunkDocs = chunks.map((text, i) => ({
            documentId: doc._id,
            userId: doc.userId,
            text,
            embedding: embeddingRes.data[i].embedding,
            chunkIndex: i,
        }));
        await Chunk.insertMany(chunkDocs);

        return NextResponse.json({ success: true, chunksCreated: chunkDocs.length });
    } catch (error) {
        console.error("Embedding failed:", error);
        return NextResponse.json({ error: "Embedding failed" }, { status: 500 });
    }
}
