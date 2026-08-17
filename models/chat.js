// src/models/chat.js
import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);