import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/user";

export async function POST(req) {
    try {
        const { email, password, name, phone, organization, role, photo } = await req.json();

        if (!email || !password || !name || !phone || !role) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 409 });
        }

        const user = await User.create({
            email,
            password,
            name,
            phone,
            organization,
            role,
            photo,
        });

        return NextResponse.json(
            { message: "User registered successfully", userId: user._id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Registration failed" }, { status: 500 });
    }
}
