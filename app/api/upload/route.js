import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import Document from '@/models/document'
import { connectToDatabase } from "@/lib/db";


export async function POST(req) {
    try {
        await connectToDatabase();

        const formData = await req.formData();
        const file = formData.get("file");
        const userId = formData.get("userId");

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
            return NextResponse.json({ error: "You must be signed in to upload" }, { status: 401 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "doc-intel", resource_type: "auto" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        const doc = await Document.create({
            userId,
            fileName: file.name,
            cloudinaryUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
            status: "uploaded",
        });

        return NextResponse.json(doc);

    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        return NextResponse.json(
            { error: "Upload failed. Please try again." },
            { status: 500 }
        );
    }
}