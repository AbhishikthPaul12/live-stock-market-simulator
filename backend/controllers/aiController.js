import asyncHandler from "../middleware/asyncHandler.js";
import {
  askAI,
  generateStockInsight,
  analyzePortfolio,
  generateTradeRecommendations,
  summarizeNews,
  generateRiskAnalysis,
  explainConcept,
} from "../services/aiService.js";

// ─── Simple per-user rate limiting (in-memory) ─────────────────────────────────
const userCooldowns = new Map();
const CHAT_COOLDOWN_MS = 2000; // 2 seconds between chat messages

function isRateLimited(userId, type = "chat") {
  const key = `${userId}_${type}`;
  const lastCall = userCooldowns.get(key);
  if (lastCall && Date.now() - lastCall < CHAT_COOLDOWN_MS) return true;
  userCooldowns.set(key, Date.now());
  return false;
}

// ─── POST /api/ai/chat ─────────────────────────────────────────────────────────
export const chat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (isRateLimited(req.user._id.toString())) {
    return res.status(429).json({ error: "Please wait a moment before sending another message." });
  }

  const reply = await askAI(message.trim(), history || []);
  res.json({ reply });
});

// ─── GET /api/ai/stock-insight/:symbol ────────────────────────────────────────
export const stockInsight = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { price = 0, change = 0 } = req.query;

  const insight = await generateStockInsight(symbol, parseFloat(price), parseFloat(change));
  res.json(insight);
});

// ─── POST /api/ai/portfolio-analysis ──────────────────────────────────────────
export const portfolioAnalysis = asyncHandler(async (req, res) => {
  const { holdings } = req.body;

  if (!Array.isArray(holdings)) {
    return res.status(400).json({ error: "Holdings array is required" });
  }

  const analysis = await analyzePortfolio(holdings);
  res.json(analysis);
});

// ─── GET /api/ai/recommendations ──────────────────────────────────────────────
export const recommendations = asyncHandler(async (req, res) => {
  // stockList is passed as query: ?stocks=JSON_string
  let stockList = [];
  if (req.query.stocks) {
    try {
      stockList = JSON.parse(req.query.stocks);
    } catch {
      return res.status(400).json({ error: "Invalid stocks JSON" });
    }
  }

  const result = await generateTradeRecommendations(stockList);
  res.json(result);
});

// ─── POST /api/ai/news-summary ─────────────────────────────────────────────────
export const newsSummary = asyncHandler(async (req, res) => {
  const { headlines } = req.body;

  if (!Array.isArray(headlines) || headlines.length === 0) {
    return res.status(400).json({ error: "Headlines array is required" });
  }

  const summaries = await summarizeNews(headlines);
  res.json({ summaries });
});

// ─── GET /api/ai/risk-analysis/:symbol ────────────────────────────────────────
export const riskAnalysis = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { price = 0, change = 0 } = req.query;

  const risk = await generateRiskAnalysis(symbol, parseFloat(price), parseFloat(change));
  res.json(risk);
});

// ─── POST /api/ai/learn ────────────────────────────────────────────────────────
export const learnConcept = asyncHandler(async (req, res) => {
  const { topic } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: "Topic is required" });
  }

  const explanation = await explainConcept(topic.trim());
  res.json({ explanation });
});
