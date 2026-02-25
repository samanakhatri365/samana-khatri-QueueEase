import express from "express";
import { protect, adminOnly, staffOrAdmin } from "../middleware/authMiddleware.js";
import {
  submitFeedback,
  checkFeedback,
  getAllFeedback,
  getDoctorFeedback
} from "../controllers/feedbackController.js";

const router = express.Router();

// Patient routes
router.post("/submit", protect, submitFeedback);
router.get("/check/:tokenId", protect, checkFeedback);

// Admin routes
router.get("/all", protect, adminOnly, getAllFeedback);

// Staff/Admin routes
router.get("/doctor/:doctorId", protect, staffOrAdmin, getDoctorFeedback);

export default router;
