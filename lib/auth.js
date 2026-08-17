import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/user";
import { connectToDatabase } from "@/lib/db";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: { prompt: "select_account" },
            },
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectToDatabase();

                const user = await User.findOne({ email: credentials.email });
                if (!user) return null;

                const valid = await bcrypt.compare(credentials.password, user.password);
                if (!valid) return null;

                return { id: user._id.toString(), email: user.email, name: user.name };
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: {
        signIn: "/",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account.provider !== "google") return true;

            await connectToDatabase();

            let dbUser = await User.findOne({ email: user.email });
            if (!dbUser) {
                dbUser = await User.create({
                    email: user.email,
                    name: user.name,
                    photo: user.image,
                    provider: "google",
                });
            }

            user.id = dbUser._id.toString();

            return true;
        },
        async jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
