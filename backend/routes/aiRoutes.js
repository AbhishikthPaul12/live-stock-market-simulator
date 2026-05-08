import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  chat,
  stockInsight,
  portfolioAnalysis,
  recommendations,
  newsSummary,
  riskAnalysis,
  learnConcept,
} from "../controllers/aiController.js";

const router = express.Router();

// All AI routes require authentication
router.post("/chat", protect, chat);
router.post("/stock-insight", protect, stockInsight);
router.post("/portfolio-analysis", protect, portfolioAnalysis);
router.get("/recommendations", protect, recommendations);
router.post("/news-summary", protect, newsSummary);
router.get("/risk-analysis/:symbol", protect, riskAnalysis);
router.post("/learn", protect, learnConcept);

export default router;
