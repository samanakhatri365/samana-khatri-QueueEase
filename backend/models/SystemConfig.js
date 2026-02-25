import mongoose from "mongoose";

const SystemConfigSchema = new mongoose.Schema({
  // 1. Hospital Info (For About Us)
  hospitalName: { type: String, default: "QueueEase Hospital" },
  email: { type: String, default: "contact@hospital.com" },
  phone: { type: String, default: "+1-XXX-XXX-XXXX" },
  address: { type: String, default: "" },

  // 2. Queue Settings
  tokenPrefix: { type: String, default: "Q-" },
  maxQueueSize: { type: Number, default: 50 },
  tokenTimeoutMins: { type: Number, default: 30 }, // Time to show up
  avgConsultationTime: { type: Number, default: 15 }, // For wait time calc

  // 3. Operating Hours
  weekdayOpen: { type: String, default: "09:00" }, // Store as 24h string
  weekdayClose: { type: String, default: "17:00" },
  weekendOpen: { type: String, default: "10:00" },
  weekendClose: { type: String, default: "14:00" }
}, { timestamps: true });

export default mongoose.model("SystemConfig", SystemConfigSchema);
