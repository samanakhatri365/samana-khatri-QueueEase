import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
      required: true,
      unique: true // Ensures one rating per appointment
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxLength: 500,
      trim: true
    }
  },
  { timestamps: true }
);

// Index for faster queries
feedbackSchema.index({ doctor: 1, createdAt: -1 });
feedbackSchema.index({ department: 1, createdAt: -1 });

export default mongoose.model("Feedback", feedbackSchema);
