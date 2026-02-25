import Feedback from "../models/Feedback.js";
import Token from "../models/Token.js";

// Submit feedback for a completed token
export const submitFeedback = async (req, res) => {
  try {
    const { tokenId, rating, comment } = req.body;
    const patientId = req.user.userId;

    if (!tokenId || !rating) {
      return res.status(400).json({ message: "Token ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Verify token exists and belongs to this patient
    const token = await Token.findById(tokenId);
    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    if (token.patient.toString() !== patientId) {
      return res.status(403).json({ message: "You can only rate your own appointments" });
    }

    if (token.status !== "completed") {
      return res.status(400).json({ message: "Can only rate completed appointments" });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ token: tokenId });
    if (existingFeedback) {
      return res.status(409).json({ message: "You have already submitted feedback for this appointment" });
    }

    // Create feedback
    const feedback = await Feedback.create({
      token: tokenId,
      patient: patientId,
      doctor: token.doctor,
      department: token.department,
      rating,
      comment: comment?.trim() || ""
    });

    res.status(201).json({
      message: "Thank you for your feedback!",
      feedback
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Check if feedback exists for a token
export const checkFeedback = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const patientId = req.user.userId;

    const token = await Token.findById(tokenId);
    if (!token || token.patient.toString() !== patientId) {
      return res.status(404).json({ message: "Token not found" });
    }

    const feedback = await Feedback.findOne({ token: tokenId });

    res.json({
      hasFeedback: !!feedback,
      canSubmit: token.status === "completed" && !feedback
    });
  } catch (error) {
    console.error("Check feedback error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all feedback (Admin only)
export const getAllFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 20, department, rating } = req.query;

    const query = {};
    if (department) query.department = department;
    if (rating) query.rating = parseInt(rating);

    const feedbacks = await Feedback.find(query)
      .populate("patient", "name email")
      .populate("doctor", "name")
      .populate("department", "name")
      .populate("token", "tokenNumber displayNumber date")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Feedback.countDocuments(query);

    // Calculate average rating
    const avgResult = await Feedback.aggregate([
      { $match: query },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    const stats = avgResult[0] || { avgRating: 0, count: 0 };

    // Rating distribution
    const ratingDistribution = await Feedback.aggregate([
      { $match: query },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      feedbacks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: {
        averageRating: Math.round(stats.avgRating * 10) / 10 || 0,
        totalReviews: stats.count,
        distribution: ratingDistribution
      }
    });
  } catch (error) {
    console.error("Get all feedback error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get feedback for a specific doctor
export const getDoctorFeedback = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const feedbacks = await Feedback.find({ doctor: doctorId })
      .populate("patient", "name")
      .populate("token", "tokenNumber date")
      .sort({ createdAt: -1 })
      .limit(50);

    const avgResult = await Feedback.aggregate([
      { $match: { doctor: doctorId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    const stats = avgResult[0] || { avgRating: 0, count: 0 };

    res.json({
      feedbacks,
      stats: {
        averageRating: Math.round(stats.avgRating * 10) / 10 || 0,
        totalReviews: stats.count
      }
    });
  } catch (error) {
    console.error("Get doctor feedback error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
