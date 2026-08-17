import mongoose from "mongoose";
import Chunk from "@/models/chunk";
import openai from "@/lib/openai";

export async function searchChunks(query, userId, documentId = null) {
    const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
    });
    const queryVector = embeddingRes.data[0].embedding;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const documentObjectId = documentId ? new mongoose.Types.ObjectId(documentId) : null;

    const filter = documentObjectId
        ? { userId: { $eq: userObjectId }, documentId: { $eq: documentObjectId } }
        : { userId: { $eq: userObjectId } };

    const results = await Chunk.aggregate([
        {
            $vectorSearch: {
                index: "vector_index",
                path: "embedding",
                queryVector,
                numCandidates: 100,
                limit: 5,
                filter,
            },
        },
        { $project: { text: 1, documentId: 1, chunkIndex: 1, _id: 0 } },
    ]);

    return results;
}