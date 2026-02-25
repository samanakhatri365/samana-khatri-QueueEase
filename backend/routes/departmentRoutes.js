import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getDepartments,
  createDepartment,
  resetDepartmentQueue,
  seedDepartments
} from "../controllers/departmentController.js";

const router = express.Router();

// Public: Get all departments
router.get("/", getDepartments);

// Admin: Create department
router.post("/", protect, adminOnly, createDepartment);

// Admin: Reset department queue
router.patch("/:id/reset", protect, adminOnly, resetDepartmentQueue);

// Admin: Seed default departments
router.post("/seed", protect, adminOnly, seedDepartments);

export default router;
