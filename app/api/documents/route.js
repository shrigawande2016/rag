import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";
import Document from "@/models/document";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const docs = await Document.find({ userId: session.user.id }).sort({ createdAt: -1 });

        if (!docs.length) {
            return NextResponse.json({ error: "No documents found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: docs });

    } catch (error) {
        console.error("Fetching documents failed:", error);
        return NextResponse.json({ error: "Fetching documents failed" }, { status: 500 });
    }
}
