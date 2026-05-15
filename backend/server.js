import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { initSocketEmitter } from "./services/stockService.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Socket.IO server with CORS matching Express
const io = new Server(httpServer, {
  cors: corsOptions
});

// Middleware
app.use(helmet()); // Security Headers
app.use(cors(corsOptions));
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/ai", aiRoutes);

// Static Serving for Production
const frontendPath = path.join(__dirname, "../frontend/dist");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

app.use(notFound)
app.use(errorHandler)

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`⚡ Client disconnected: ${socket.id}`);
  });
});

// Initialize the stock service Socket.IO emitter
initSocketEmitter(io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO ready on port ${PORT}`);
});