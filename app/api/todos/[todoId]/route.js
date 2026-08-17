import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Todo from "@/models/todo";

export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const { todoId } = await params;
        const updates = await req.json();

        const allowed = {};
        if (typeof updates.completed === "boolean") allowed.completed = updates.completed;
        if (typeof updates.highlighted === "boolean") allowed.highlighted = updates.highlighted;
        if (typeof updates.title === "string") allowed.title = updates.title;
        if (typeof updates.notes === "string") allowed.notes = updates.notes;
        if (updates.dueDate !== undefined) allowed.dueDate = updates.dueDate || null;

        const todo = await Todo.findOneAndUpdate(
            { _id: todoId, userId: session.user.id },
            allowed,
            { new: true }
        );

        if (!todo) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: todo });
    } catch (error) {
        console.error("Updating todo failed:", error);
        return NextResponse.json({ error: "Updating todo failed" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const { todoId } = await params;
        const todo = await Todo.findOneAndDelete({ _id: todoId, userId: session.user.id });

        if (!todo) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Deleting todo failed:", error);
        return NextResponse.json({ error: "Deleting todo failed" }, { status: 500 });
    }
}
