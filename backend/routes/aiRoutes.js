import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  chat,
  stockAnalysis,
  portfolioAnalysis,
  recommendations,
  riskAnalysis,
  learning,
  watchlistInsights,
  newsSummary,
} from "../controllers/aiController.js";


const router = express.Router();

// All AI routes require authentication
router.post("/chat", protect, chat);
router.post("/stock-analysis", protect, stockAnalysis);
router.post("/portfolio-analysis", protect, portfolioAnalysis);
router.post("/recommendations", protect, recommendations);
router.post("/risk-analysis", protect, riskAnalysis);
router.post("/learning", protect, learning);
router.post("/watchlist-insights", protect, watchlistInsights);
router.post("/news-summary", protect, newsSummary);


export default router;

