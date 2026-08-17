import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Todo from "@/models/todo";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const todos = await Todo.find({ userId: session.user.id }).sort({ dueDate: 1, createdAt: -1 });

        return NextResponse.json({ success: true, data: todos });
    } catch (error) {
        console.error("Fetching todos failed:", error);
        return NextResponse.json({ error: "Fetching todos failed" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const { title, notes, dueDate, amount, currency, documentId, highlighted } = await req.json();

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const todo = await Todo.create({
            userId: session.user.id,
            documentId: documentId || undefined,
            title,
            notes,
            dueDate: dueDate || undefined,
            amount,
            currency,
            highlighted: !!highlighted,
        });

        return NextResponse.json({ success: true, data: todo }, { status: 201 });
    } catch (error) {
        console.error("Creating todo failed:", error);
        return NextResponse.json({ error: "Creating todo failed" }, { status: 500 });
    }
}
