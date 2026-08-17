import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
        },
        title: { type: String, required: true },
        notes: { type: String },
        dueDate: { type: Date },
        amount: { type: Number },
        currency: { type: String },
        highlighted: { type: Boolean, default: false },
        completed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Todo || mongoose.model("Todo", TodoSchema);
