import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true
    },
    displayNumber: {
      type: String,
      required: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["waiting", "serving", "completed", "skipped", "cancelled"],
      default: "waiting"
    },
    date: {
      type: String,
      required: true
    },
    calledAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Compound index for unique token per doctor per day
tokenSchema.index({ doctor: 1, date: 1, tokenNumber: 1 }, { unique: true });
// Optional index to quickly find patient's duplicate booking for a doctor
tokenSchema.index({ patient: 1, doctor: 1, date: 1, status: 1 });

export default mongoose.model("Token", tokenSchema);
