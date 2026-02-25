import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
    submitContact,
    getAllContacts,
    updateContactStatus,
    deleteContact
} from "../controllers/contactController.js";

const router = express.Router();

// Public route - submit contact message
router.post("/", submitContact);

// Admin routes
router.get("/", protect, adminOnly, getAllContacts);
router.patch("/:id", protect, adminOnly, updateContactStatus);
router.delete("/:id", protect, adminOnly, deleteContact);

export default router;
