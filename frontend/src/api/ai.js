import API from "./axios.js";

// ─── AI Chatbot ────────────────────────────────────────────────────────────────
export const sendChatMessage = (message, history) =>
  API.post("/ai/chat", { message, history }).then((r) => r.data);

// ─── Stock Insight ─────────────────────────────────────────────────────────────
export const getStockInsight = (symbol, price, change) =>
  API.get(`/ai/stock-insight/${symbol}`, { params: { price, change } }).then((r) => r.data);

// ─── Portfolio Analysis ────────────────────────────────────────────────────────
export const getPortfolioAnalysis = (holdings) =>
  API.post("/ai/portfolio-analysis", { holdings }).then((r) => r.data);

// ─── Trade Recommendations ─────────────────────────────────────────────────────
export const getRecommendations = (stockList) =>
  API.get("/ai/recommendations", {
    params: { stocks: JSON.stringify(stockList) },
  }).then((r) => r.data);

// ─── News Summary ──────────────────────────────────────────────────────────────
export const getNewsSummary = (headlines) =>
  API.post("/ai/news-summary", { headlines }).then((r) => r.data);

// ─── Risk Analysis ─────────────────────────────────────────────────────────────
export const getRiskAnalysis = (symbol, price, change) =>
  API.get(`/ai/risk-analysis/${symbol}`, { params: { price, change } }).then((r) => r.data);

// ─── Learning Assistant ────────────────────────────────────────────────────────
export const learnTopic = (topic) =>
  API.post("/ai/learn", { topic }).then((r) => r.data);
