import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getStaff, createStaff, updateStaffDept, toggleAvailability, getDoctorsByDepartment } from "../controllers/staffController.js";

const router = express.Router();

router.get("/", protect, adminOnly, getStaff);
router.post("/", protect, adminOnly, createStaff);
router.patch("/:id/department", protect, adminOnly, updateStaffDept);
router.patch("/toggle-availability", protect, toggleAvailability);
router.get("/department/:departmentId", protect, getDoctorsByDepartment);

export default router;
