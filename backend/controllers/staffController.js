import User from "../models/User.js";
import bcrypt from "bcrypt";
import validateStaffEmail, { getAllowedDomains } from "../utils/validateStaffEmail.js";
import sendStaffWelcomeEmail from "../utils/staffWelcomeEmail.js";
import Department from "../models/Department.js";

// List all staff members
export const getStaff = async (req, res) => {
    try {
        const staff = await User.find({ role: "staff" })
            .select("-password")
            .populate("departmentId", "name");
        res.json({ staff });
    } catch (error) {
        console.error("Get staff error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Add new staff member (Admin only)
export const createStaff = async (req, res) => {
    try {
        const { name, email, password, departmentId } = req.body;

        // Validate staff email domain
        if (!validateStaffEmail(email)) {
            return res.status(400).json({ 
                message: `Unauthorized email domain. Staff members must use one of these authorized domains: ${getAllowedDomains()}`
            });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const staff = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "staff",
            departmentId,
            isVerified: true
        });

        // Get department name for email
        let departmentName = "Not Assigned";
        if (departmentId) {
            const department = await Department.findById(departmentId);
            departmentName = department?.name || "Not Assigned";
        }

        // Send welcome email with credentials (non-blocking)
        sendStaffWelcomeEmail({
            email: staff.email,
            name: staff.name,
            password: password, // Send plain password in email (only time it's visible)
            departmentName: departmentName,
            role: "Staff Member"
        });

        res.status(201).json({
            message: "Staff member created successfully. Welcome email sent with login credentials.",
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role,
                departmentId: staff.departmentId
            }
        });
    } catch (error) {
        console.error("Create staff error:", error);
        res.status(500).json({ message: error.message || "Server error occurred while creating staff" });
    }
};

// Update staff department
export const updateStaffDept = async (req, res) => {
    try {
        const { id } = req.params;
        const { departmentId } = req.body;

        const staff = await User.findByIdAndUpdate(
            id,
            { departmentId },
            { new: true }
        ).select("-password");

        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        res.json({ message: "Staff department updated", staff });
    } catch (error) {
        console.error("Update staff error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
// Toggle staff availability
export const toggleAvailability = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isAvailable = !user.isAvailable;
        await user.save();

        res.json({
            message: `Status updated to ${user.isAvailable ? 'Available' : 'On Leave'}`,
            isAvailable: user.isAvailable
        });
    } catch (error) {
        console.error("Toggle availability error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
// Get doctors for a specific department
export const getDoctorsByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        console.log(`[DEBUG] Fetching doctors for departmentId: ${departmentId}`);

        const doctors = await User.find({
            role: "staff",
            departmentId,
            isAvailable: true
        }).select("name email isAvailable");

        console.log(`[DEBUG] Found ${doctors.length} doctors:`, doctors);

        res.json({ doctors });
    } catch (error) {
        console.error("Get doctors error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
