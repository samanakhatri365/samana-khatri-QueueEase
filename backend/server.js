import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
console.log("Environment variables loaded:");
connectDB();

const app = express();
const server = http.createServer(app);
console.log("Server setup complete");
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};
const io = new Server(server, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.send("QueueEase Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/config", configRoutes);
app.use("/api/contact", contactRoutes);


// Socket.IO
io.on("connection", (socket) => {
  console.log("reached here!!")
  console.log("User connected:", socket.id);

  // Join department room for real-time updates
  socket.on("join-department", (departmentId) => {
    socket.join(`dept-${departmentId}`);
    console.log(`Socket ${socket.id} joined dept-${departmentId}`);
  });

  socket.on("leave-department", (departmentId) => {
    socket.leave(`dept-${departmentId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


// Make io accessible to routes
app.set("io", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
