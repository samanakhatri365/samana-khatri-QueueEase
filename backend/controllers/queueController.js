import Token from "../models/Token.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import sendBookingConfirmation from "../utils/bookingConfirmationEmail.js";

// Helper to get today's date string
const getToday = () => new Date().toISOString().split("T")[0];

// Helper to emit queue updates via socket
const emitQueueUpdate = async (io, departmentId) => {
  if (!io) return;
  const today = getToday();
  const waiting = await Token.find({ department: departmentId, date: today, status: "waiting" })
    .populate("patient", "name")
    .sort({ tokenNumber: 1 });
  const serving = await Token.findOne({ department: departmentId, date: today, status: "serving" })
    .populate("patient", "name");

  io.to(`dept-${departmentId}`).emit("queue-updated", {
    departmentId,
    waiting,
    currentServing: serving
  });
};

// Generate a new token for patient
export const generateToken = async (req, res) => {
  try {
    const { departmentId, doctorId } = req.body;
    const patientId = req.user.userId;

    if (!departmentId || !doctorId) {
      return res.status(400).json({ message: "Department and Doctor are required" });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "staff") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (!doctor.isAvailable) {
      return res.status(400).json({ message: "Selected doctor is currently on leave/unavailable" });
    }

    const today = getToday();

    // Check if patient already has an active token for this DOCTOR today
    const existingToken = await Token.findOne({
      patient: patientId,
      doctor: doctorId,
      date: today,
      status: { $in: ["waiting", "serving"] }
    });

    if (existingToken) {
      return res.status(409).json({
        message: "You already have an active token for this doctor today",
        token: existingToken
      });
    }

    // Increment department's current token
    const updatedDept = await Department.findByIdAndUpdate(
      departmentId,
      { $inc: { currentToken: 1 } },
      { new: true }
    );

    const tokenNumber = updatedDept.currentToken;
    const displayNumber = `${department.code}${String(tokenNumber).padStart(3, "0")}`;

    const token = await Token.create({
      tokenNumber,
      displayNumber,
      patient: patientId,
      department: departmentId,
      doctor: doctorId,
      date: today
    });

    await token.populate("department", "name code");

    // Emit socket update
    emitQueueUpdate(req.app.get("io"), departmentId);

    // Send booking confirmation email (non-blocking)
    const patient = await User.findById(patientId).select("name email");
    if (patient?.email) {
      sendBookingConfirmation({
        email: patient.email,
        name: patient.name,
        tokenNumber: displayNumber,
        departmentName: department.name,
        doctorName: doctor.name,
        date: today
      });
    }

    res.status(201).json({ token });
  } catch (error) {
    console.error("Generate token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get patient's tokens for today
export const getMyTokens = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const today = getToday();

    const tokens = await Token.find({
      patient: patientId,
      date: today
    })
      .populate("department", "name code nowServing")
      .populate("doctor", "name")
      .sort({ createdAt: -1 });

    res.json({ tokens });
  } catch (error) {
    console.error("Get my tokens error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get queue status for a department
export const getQueueStatus = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const today = getToday();

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const waiting = await Token.find({
      department: departmentId,
      date: today,
      status: "waiting"
    }).sort({ tokenNumber: 1 });

    const currentServing = await Token.findOne({
      department: departmentId,
      date: today,
      status: "serving"
    }).populate("patient", "name");

    res.json({
      department: {
        id: department._id,
        name: department.name,
        code: department.code,
        nowServing: department.nowServing
      },
      waiting,
      currentServing
    });
  } catch (error) {
    console.error("Get queue status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get all tokens for a department today
export const getDepartmentQueue = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const today = getToday();

    const tokens = await Token.find({
      department: departmentId,
      date: today
    })
      .populate("patient", "name email")
      .populate("department", "name code")
      .sort({ tokenNumber: 1 });

    const waiting = tokens.filter(t => t.status === "waiting");
    const serving = tokens.find(t => t.status === "serving");
    const completed = tokens.filter(t => t.status === "completed");
    const skipped = tokens.filter(t => t.status === "skipped");

    res.json({
      tokens,
      waiting,
      summary: {
        waiting: waiting.length,
        serving: serving ? 1 : 0,
        completed: completed.length,
        skipped: skipped.length,
        total: tokens.length
      },
      currentServing: serving
    });
  } catch (error) {
    console.error("Get department queue error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin & Staff: Get history (completed, skipped, cancelled)
export const getQueueHistory = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const tokens = await Token.find({
      department: departmentId,
      status: { $in: ["completed", "skipped", "cancelled"] }
    })
      .populate("patient", "name email")
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Token.countDocuments({
      department: departmentId,
      status: { $in: ["completed", "skipped", "cancelled"] }
    });

    res.json({
      tokens,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get queue history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Call next token
export const callNextToken = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const today = getToday();

    // Complete current serving token if any
    await Token.findOneAndUpdate(
      { department: departmentId, date: today, status: "serving" },
      { status: "completed", completedAt: new Date() }
    );

    // Get next waiting token
    const nextToken = await Token.findOneAndUpdate(
      { department: departmentId, date: today, status: "waiting" },
      { status: "serving", calledAt: new Date() },
      { new: true, sort: { tokenNumber: 1 } }
    ).populate("patient", "name");

    if (!nextToken) {
      return res.json({ message: "No more tokens in queue", currentServing: null });
    }

    // Update department's nowServing
    await Department.findByIdAndUpdate(departmentId, {
      nowServing: nextToken.tokenNumber
    });

    // Emit socket update
    emitQueueUpdate(req.app.get("io"), departmentId);

    res.json({ currentServing: nextToken });
  } catch (error) {
    console.error("Call next token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin/Staff: Mark token as completed manually
export const completeToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const token = await Token.findById(tokenId);

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    token.status = "completed";
    token.completedAt = new Date();
    await token.save();

    // Emit live update
    emitQueueUpdate(req.app.get("io"), token.department);

    res.json({ message: "Token marked as completed", token });
  } catch (error) {
    console.error("Complete token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Skip current token
export const skipToken = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const token = await Token.findByIdAndUpdate(
      tokenId,
      { status: "skipped" },
      { new: true }
    );

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    // Emit socket update
    emitQueueUpdate(req.app.get("io"), token.department);

    res.json({ token, message: "Token skipped" });
  } catch (error) {
    console.error("Skip token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Reset department queue for today
export const resetQueue = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const today = getToday();

    await Token.updateMany(
      { department: departmentId, date: today },
      { status: "cancelled" }
    );

    await Department.findByIdAndUpdate(departmentId, {
      currentToken: 0,
      nowServing: 0
    });

    // Emit socket update
    emitQueueUpdate(req.app.get("io"), departmentId);

    res.json({ message: "Queue reset successfully" });
  } catch (error) {
    console.error("Reset queue error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
