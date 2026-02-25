import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["patient", "staff", "admin"],
      default: "patient"
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department"
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    verificationCode: String,
    resetPasswordOTP: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
