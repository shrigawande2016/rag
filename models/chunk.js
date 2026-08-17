import mongoose from "mongoose";

const ChunkSchema = new mongoose.Schema(
    {
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        embedding: { type: [Number], required: true }, // vector array
        chunkIndex: { type: Number, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Chunk || mongoose.model("Chunk", ChunkSchema);