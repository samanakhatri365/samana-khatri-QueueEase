import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getConfig, updateConfig } from "../controllers/configController.js";

const router = express.Router();

// GET settings (public - for About page etc.)
router.get("/", getConfig);

// UPDATE settings (admin only)
router.put("/", protect, adminOnly, updateConfig);

export default router;
