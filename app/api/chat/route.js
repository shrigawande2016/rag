import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Document from "@/models/document";
import Chat from "@/models/chat";
import openai from "@/lib/openai";
import { searchChunks } from "@/lib/searchChunks";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        await connectToDatabase();

        const { documentId, message } = await req.json();

        if (!documentId || !message) {
            return NextResponse.json({ error: "documentId and message are required" }, { status: 400 });
        }

        const doc = await Document.findById(documentId);
        if (!doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // 1. Save the user's message
        await Chat.create({ documentId, userId, role: "user", content: message });

        // 2. RAG retrieval — find the most relevant chunks of THIS document
        const relevantChunks = await searchChunks(message, userId, documentId);

        if (relevantChunks.length === 0) {
            const fallback = "I couldn't find anything relevant to that in this document.";
            await Chat.create({ documentId, userId, role: "assistant", content: fallback });
            return NextResponse.json({ reply: fallback });
        }

        const context = relevantChunks
            .map((c, i) => `[Excerpt ${i + 1}]\n${c.text}`)
            .join("\n\n");

        // 3. Pull recent conversation history for continuity
        const history = await Chat.find({ documentId })
            .sort({ createdAt: -1 })
            .limit(10);
        const orderedHistory = history.reverse(); // oldest first for the LLM

        // 4. Ask the LLM using ONLY the retrieved chunks, not the whole document
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are helping a user understand a document called "${doc.fileName}".
Answer clearly, in plain English, using ONLY the excerpts below. If the answer isn't
in these excerpts, say you don't have that information rather than guessing.

Relevant excerpts from the document:
${context}`,
                },
                ...orderedHistory.map((m) => ({ role: m.role, content: m.content })),
            ],
        });

        const reply = completion.choices[0].message.content;
        await Chat.create({ documentId, userId, role: "assistant", content: reply });

        return NextResponse.json({ reply });

    } catch (error) {
        console.error("Chat failed:", error);
        return NextResponse.json({ error: "Chat failed" }, { status: 500 });
    }
}