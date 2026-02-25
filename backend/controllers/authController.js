import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Token from "../models/Token.js";
import catchAsync from "../utils/catchAsync.js";
import createError from "../utils/createError.js";
import verificationCode from "../utils/verificationCode.js";
import recoveryEmail from "../utils/recoveryEmail.js";
import verifyEmail from "../utils/verifyEmail.js";

const createToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ... existing register and login ...
export const register = async (req, res) => {
  const code = verificationCode();
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationCode: code,
      isVerified: false,
      role: role === "admin" ? "admin" : "patient"
    });

    const mailOptions = {
      email: user.email,
      subject: "Account Verification",
      code: code,
      name: user.name,
    };

    await verifyEmail(mailOptions);

    const token = createToken(user._id, user.role);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Register error", error);
    return res.status(500).json({ message: "Server error" });
  }
};

//verification email
export const verificationEmail = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    verificationCode: req.body.verificationCode,
  });

  if (!user) throw createError(401, "Invalid verification code");

  if (user.isVerified)
    throw createError(401, "You are already verified. Login in to continue.");

  user.isVerified = true;

  await user.save();

  return res.status(200).json({ message: "Email verified successfully" });
});

//Forgot password
export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    throw createError(400, `User with email ${req.body.email} is not found`);

  const resetOtp = verificationCode();

  user.resetPasswordOTP = resetOtp;

  await user.save();

  try {
    const message = `You are receiving this email because you have
    requested to reset the password`;

    const options = {
      email: user.email,
      subject: "Password reset Otp",
      message,
      resetOtp: resetOtp,
    };

    await recoveryEmail(options);

    res
      .status(200)
      .send({ status: "success", message: "ResetPassword Otp Email sent" });
  } catch (error) {
    user.resetPasswordOTP = undefined;

    await user.save();

    throw createError(500, "Email cound't be sent");
  }
});

//Reset password
export const resetPassword = catchAsync(async (req, res, next) => {
  const resetOtp = req.body.otp;

  const user = await User.findOne({
    resetPasswordOTP: resetOtp,
  });

  if (!user) throw createError(400, `Invalid Otp ${req.body.otp}`);

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user.password = hashedPassword;
  user.resetPasswordOTP = undefined;

  await user.save();

  res
    .status(200)
    .send({ status: "success", message: "Your Password has been changed" });
});

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user._id, user.role);
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        isAvailable: user.isAvailable
      }
    });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name email role departmentId isAvailable");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get today's stats if staff
    let stats = null;
    if (user.role === "staff") {
      const today = new Date().toISOString().split("T")[0];
      const servedCount = await Token.countDocuments({
        doctor: user._id,
        date: today,
        status: "completed"
      });
      stats = { servedCount };
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        isAvailable: user.isAvailable,
        stats
      }
    });
  } catch (error) {
    console.error("Profile error", error);
    return res.status(500).json({ message: "Server error" });
  }
};
