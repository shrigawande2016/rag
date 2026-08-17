import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    organization: {
        type: String,
        required: false
    },
    role: {
        type: String,  // this is the role in the oranization hr, ceo , employee ,student
        required: false,
        default: "member",
    },
    provider: {
        type: String,
        default: "credentials",
    },
    photo: {
        type: String,
        required: false
    },
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (!this.password || !this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;