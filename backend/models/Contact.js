import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        required: [true, "Subject is required"],
        enum: ["technical", "billing", "partnership", "general"]
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "resolved"],
        default: "pending"
    },
    adminNotes: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
