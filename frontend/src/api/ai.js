import API from "./axios.js";

// ─── AI Chatbot ────────────────────────────────────────────────────────────────
export const sendChatMessage = (message, history) =>
  API.post("/ai/chat", { message, history }).then((r) => r.data);

// ─── Stock Analysis ────────────────────────────────────────────────────────────
export const getStockInsight = (symbol, price, change, name) =>
  API.post("/ai/stock-analysis", { symbol, price, change, name }).then((r) => r.data);

// ─── Portfolio Analysis ────────────────────────────────────────────────────────
export const getPortfolioAnalysis = (portfolio) =>
  API.post("/ai/portfolio-analysis", { portfolio }).then((r) => r.data);

// ─── Trade Recommendations ─────────────────────────────────────────────────────
export const getRecommendations = (stocks) =>
  API.post("/ai/recommendations", { stocks }).then((r) => r.data);

// ─── Risk Analysis ─────────────────────────────────────────────────────────────
export const getRiskAnalysis = (symbol, price, quantity, type) =>
  API.post("/ai/risk-analysis", { symbol, price, quantity, type }).then((r) => r.data);

// ─── Learning Assistant ────────────────────────────────────────────────────────
export const learnTopic = (topic) =>
  API.post("/ai/learning", { topic }).then((r) => r.data);

// ─── Watchlist Insights ────────────────────────────────────────────────────────
export const getWatchlistInsights = (watchlist) =>
  API.post("/ai/watchlist-insights", { watchlist }).then((r) => r.data);
// ─── News Summary ──────────────────────────────────────────────────────────────
export const getNewsSummary = (headlines) =>
  API.post("/ai/news-summary", { headlines }).then((r) => r.data);
