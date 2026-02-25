import express from "express";
import { protect, adminOnly, staffOrAdmin } from "../middleware/authMiddleware.js";
import {
  generateToken,
  getMyTokens,
  getQueueStatus,
  getDepartmentQueue,
  getQueueHistory,
  callNextToken,
  skipToken,
  completeToken,
  resetQueue
} from "../controllers/queueController.js";

const router = express.Router();

// Patient routes
router.post("/token", protect, generateToken);
router.get("/my-tokens", protect, getMyTokens);
router.get("/status/:departmentId", getQueueStatus);

// Admin & Staff routes (Queue Management)
router.get("/department/:departmentId", protect, staffOrAdmin, getDepartmentQueue);
router.get("/department/:departmentId/history", protect, staffOrAdmin, getQueueHistory);
router.post("/department/:departmentId/next", protect, staffOrAdmin, callNextToken);
router.patch("/token/:tokenId/skip", protect, staffOrAdmin, skipToken);
router.patch("/token/:tokenId/complete", protect, staffOrAdmin, completeToken);
router.post("/department/:departmentId/reset", protect, adminOnly, resetQueue);

export default router;
