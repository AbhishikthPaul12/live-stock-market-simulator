import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Gemini Client (lazy — initialized at call time so dotenv has loaded) ─────
function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY not configured in .env");
  }
  const genAI = new GoogleGenerativeAI(key);
  // gemini-flash-latest: stable high-quota free tier
  return genAI.getGenerativeModel({ model: "gemini-flash-latest" });
}

// ─── In-Memory Cache (30 min TTL — aggressively cache to reduce quota usage) ──
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCache(key, value) {
  cache.set(key, { value, timestamp: Date.now() });
}

// ─── Helper: sleep ─────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ─── Extract retry-after delay from Google's 429 error message ─────────────────
function getRetryDelayMs(errMsg) {
  // API says: "Please retry in 17.792s"
  const match = errMsg?.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (match) return Math.ceil(parseFloat(match[1])) * 1000 + 1000; // +1s buffer
  return 20000; // default 20s if not parseable
}

// ─── Helper: Generate text safely (respects API retry-after on 429) ────────────
async function generateText(prompt, cacheKey = null) {
  if (cacheKey) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const model = getModel();
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (cacheKey) setCache(cacheKey, text);
      return text;
    } catch (err) {
      lastErr = err;
      if (err.message?.includes("429") || err.message?.includes("Too Many Requests")) {
        const waitMs = getRetryDelayMs(err.message);
        console.warn(`[AI] Rate limited. Waiting ${Math.round(waitMs / 1000)}s before retry...`);
        await sleep(waitMs);
        continue;
      }
      throw err; // Non-429 errors — fail immediately
    }
  }
  throw lastErr;
}

// ─── 1. General Chatbot ───────────────────────────────────────────────────────
export async function askAI(userMessage, conversationHistory = []) {
  const systemContext = `You are StockSim AI — an intelligent assistant for a stock market simulation platform. 
You help users understand:
- Stock market concepts and terminology
- Portfolio analysis and risk management
- Trading strategies (educational context only)
- Market trends and company fundamentals
- Investment principles for beginners and advanced users

This is a SIMULATION platform — always emphasize that this is for educational purposes only and not real financial advice.
Keep responses concise, clear, and engaging. Use bullet points and structure when helpful.
Format responses with markdown when appropriate.`;

  const historyText = conversationHistory
    .slice(-6)
    .map((m) => `${m.role === "user" ? "User" : "StockSim AI"}: ${m.content}`)
    .join("\n");

  const prompt = `${systemContext}

${historyText ? `Previous conversation:\n${historyText}\n` : ""}
User: ${userMessage}
StockSim AI:`;

  try {
    return await generateText(prompt);
  } catch (err) {
    console.error("[AI Chat Error]", err.message);
    return "I'm having trouble connecting right now. Please try again in a moment. (AI service temporarily unavailable)";
  }
}

// ─── 2. Stock Insight ─────────────────────────────────────────────────────────
export async function generateStockInsight(symbol, price, changePercent) {
  const cacheKey = `stock_insight_${symbol}_${Math.floor(Date.now() / CACHE_TTL)}`;

  const prompt = `You are a financial analyst for a stock market simulation platform.
Analyze the stock: ${symbol}
Current Price: ${price}
Today's Change: ${changePercent}%

Provide a structured JSON response with these exact fields:
{
  "sentiment": "Bullish" or "Bearish" or "Neutral",
  "riskLevel": "Low" or "Medium" or "High",
  "shortTermOutlook": "one sentence",
  "longTermOutlook": "one sentence",
  "volatilityAnalysis": "one sentence",
  "summary": "2-3 sentence AI insight summary"
}

Base your analysis on the price movement percentage and general knowledge of this stock/sector.
Respond with ONLY valid JSON, no markdown code blocks.
This is for educational simulation purposes only.`;

  try {
    const text = await generateText(prompt, cacheKey);
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[AI Stock Insight Error]", err.message);
    return {
      sentiment: "Neutral",
      riskLevel: "Medium",
      shortTermOutlook: "Insufficient data for short-term analysis.",
      longTermOutlook: "Insufficient data for long-term analysis.",
      volatilityAnalysis: "Volatility data not available.",
      summary: "AI insight temporarily unavailable. Please try again shortly.",
    };
  }
}

// ─── 3. Portfolio Analysis ─────────────────────────────────────────────────────
export async function analyzePortfolio(holdings) {
  if (!holdings || holdings.length === 0) {
    return {
      score: 0,
      riskLevel: "Unknown",
      diversification: "No holdings to analyze.",
      suggestions: ["Add stocks to your portfolio to get AI analysis."],
      sectorExposure: "N/A",
      summary: "Your portfolio is empty. Start by purchasing stocks in the Market.",
    };
  }

  const holdingsSummary = holdings
    .map((h) => `${h.symbol}: ${h.quantity} shares @ avg ₹${h.buyPrice}`)
    .join(", ");

  const prompt = `You are a portfolio analyst for a stock market simulation platform.
Analyze this portfolio:
Holdings: ${holdingsSummary}
Total positions: ${holdings.length}

Provide a JSON response with:
{
  "score": number 0-100 (overall portfolio health),
  "riskLevel": "Low" or "Medium" or "High" or "Very High",
  "diversification": "brief assessment of diversification",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "sectorExposure": "brief note on sector concentration",
  "summary": "2-3 sentence overall portfolio assessment"
}

Respond with ONLY valid JSON, no markdown code blocks.
This is for educational simulation only — not real financial advice.`;

  try {
    const text = await generateText(prompt);
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[AI Portfolio Error]", err.message);
    return {
      score: 50,
      riskLevel: "Medium",
      diversification: "Unable to analyze diversification at this time.",
      suggestions: ["Try again in a few moments.", "Ensure your portfolio has active holdings."],
      sectorExposure: "Analysis unavailable.",
      summary: "AI portfolio analysis is temporarily unavailable. Please try again shortly.",
    };
  }
}

// ─── 4. Trade Recommendations ──────────────────────────────────────────────────
export async function generateTradeRecommendations(stockList) {
  const cacheKey = `recommendations_${Math.floor(Date.now() / CACHE_TTL)}`;

  const stockSummary = stockList
    .slice(0, 20)
    .map((s) => `${s.symbol}: ₹${s.price} (${s.change || 0}%)`)
    .join(", ");

  const prompt = `You are a stock recommendation engine for an educational simulation platform.
Available stocks: ${stockSummary}

Select 6 stocks and categorize them. Return JSON:
{
  "recommendations": [
    {
      "symbol": "TICKER",
      "category": "Trending" or "Momentum" or "Stable" or "Beginner-Friendly",
      "confidence": number 60-95,
      "reason": "one short sentence explanation"
    }
  ]
}

Pick 2 Trending, 2 Momentum, 1 Stable, 1 Beginner-Friendly.
Respond with ONLY valid JSON, no markdown code blocks.
Disclaimer: Educational simulation only — not financial advice.`;

  try {
    const text = await generateText(prompt, cacheKey);
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[AI Recommendations Error]", err.message);
    return {
      recommendations: stockList.slice(0, 4).map((s, i) => ({
        symbol: s.symbol,
        category: ["Trending", "Momentum", "Stable", "Beginner-Friendly"][i % 4],
        confidence: 70,
        reason: "Based on recent market activity.",
      })),
    };
  }
}

// ─── 5. News Summarizer ────────────────────────────────────────────────────────
export async function summarizeNews(headlines) {
  const prompt = `You are a financial news analyst for an educational stock simulation platform.
Summarize these market news headlines:
${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Return a JSON array:
[
  {
    "headline": "original headline",
    "summary": "one clear sentence summary",
    "sentiment": "positive" or "neutral" or "negative"
  }
]

Respond with ONLY valid JSON array, no markdown code blocks.`;

  try {
    const text = await generateText(prompt);
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[AI News Error]", err.message);
    return headlines.map((h) => ({
      headline: h,
      summary: "Summary temporarily unavailable.",
      sentiment: "neutral",
    }));
  }
}

// ─── 6. Risk Analysis ─────────────────────────────────────────────────────────
export async function generateRiskAnalysis(symbol, price, changePercent) {
  const cacheKey = `risk_${symbol}_${Math.floor(Date.now() / CACHE_TTL)}`;

  const prompt = `Analyze the trading risk for stock: ${symbol}
Price: ${price}, Today's Change: ${changePercent}%

Return JSON:
{
  "riskLevel": "Low" or "Medium" or "High",
  "riskScore": number 1-10,
  "reasoning": "one sentence explanation",
  "factors": ["factor 1", "factor 2"]
}

Respond with ONLY valid JSON, no markdown code blocks.
Educational simulation only.`;

  try {
    const text = await generateText(prompt, cacheKey);
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[AI Risk Error]", err.message);
    return {
      riskLevel: "Medium",
      riskScore: 5,
      reasoning: "Risk analysis temporarily unavailable.",
      factors: ["Market conditions", "Price volatility"],
    };
  }
}

// ─── 7. Learning Assistant ─────────────────────────────────────────────────────
export async function explainConcept(topic) {
  const prompt = `You are StockSim's AI learning assistant, explaining stock market concepts to students.
Explain: "${topic}"

Provide a clear, beginner-friendly explanation with:
- Simple definition
- Real-world analogy (if applicable)
- Key takeaways (as bullet points)
- Why it matters for investors

Use markdown formatting. Keep it educational and engaging.
This is for a simulation platform — not real financial advice.`;

  try {
    return await generateText(prompt);
  } catch (err) {
    console.error("[AI Learn Error]", err.message);
    return "I couldn't load this explanation right now. Please try again in a moment.";
  }
}
