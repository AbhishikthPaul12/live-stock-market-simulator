import * as aiService from "../services/aiService.js";

export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    const response = await aiService.askAI(message);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const portfolioAnalysis = async (req, res) => {
  try {
    const { portfolio } = req.body;
    if (!portfolio) {
      return res.status(400).json({ message: "Portfolio data is required" });
    }
    const analysis = await aiService.analyzePortfolio(portfolio);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const stockInsight = async (req, res) => {
  try {
    const { symbol, price, change, name } = req.body;
    if (!symbol) {
      return res.status(400).json({ message: "Stock symbol is required" });
    }
    const insight = await aiService.generateStockInsight({ symbol, price, change, name });
    res.json(insight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const learnConcept = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }
    const explanation = await aiService.explainTradingConcept(topic);
    res.json({ explanation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Keep old exports for compatibility if needed, but updated to use new service
export const recommendations = async (req, res) => {
  try {
    const { stocks } = req.body;
    
    const stockList = (stocks || []).slice(0, 15).map(s => 
      `${s.symbol} (${s.name}) - Price: ₹${s.price}, Change: ${(s.change || 0).toFixed(2)}%`
    ).join("\n");

    const prompt = `Based on these Indian stock market stocks and their current performance, recommend 3-5 stocks for a beginner trader.

Available stocks:
${stockList}

Return ONLY a JSON array (no extra text) where each object has:
- "symbol": the stock symbol exactly as given
- "category": one of "Momentum", "Value", "Growth", "Defensive", "Swing Trade"
- "confidence": a number 60-95
- "reason": a short 1-sentence explanation

Example format: [{"symbol":"TCS.NS","category":"Growth","confidence":85,"reason":"Strong fundamentals and consistent earnings growth."}]`;

    const text = await aiService.askAI(prompt);
    
    // Try to parse JSON from the AI response
    try {
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']') + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(text.slice(jsonStart, jsonEnd));
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ recommendations: parsed });
        }
      }
    } catch (e) {
      console.warn("Failed to parse AI recommendations JSON:", e.message);
    }

    // Fallback: generate basic recommendations from available stocks
    const fallbackRecos = (stocks || []).slice(0, 4).map(s => ({
      symbol: s.symbol,
      category: s.change >= 0 ? "Momentum" : "Value",
      confidence: Math.floor(Math.random() * 20) + 70,
      reason: s.change >= 0 
        ? `Showing positive momentum with ${(s.change || 0).toFixed(2)}% gain today.`
        : `Trading at a potential value entry point after recent correction.`
    }));
    
    res.json({ recommendations: fallbackRecos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const newsSummary = async (req, res) => {
  try {
    const { headlines } = req.body;
    const response = await aiService.askAI(`Summarize these financial headlines and provide a sentiment (positive, neutral, negative) for EACH one. Format the response as a JSON array of objects with fields: headline, summary, sentiment. 
    Headlines: ${JSON.stringify(headlines)}`);
    
    try {
      const jsonStart = response.indexOf('[');
      const jsonEnd = response.lastIndexOf(']') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const summaries = JSON.parse(response.slice(jsonStart, jsonEnd));
        return res.json({ summaries });
      }
    } catch (e) {
      console.warn("Failed to parse AI news JSON.");
    }
    
    // Fallback: wrap headlines
    res.json({ summaries: headlines.map(h => ({ headline: h, summary: "Analysis completed.", sentiment: "neutral" })) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const riskAnalysis = async (req, res) => {
  try {
    const { symbol } = req.params;
    const response = await aiService.askAI(`Analyze the risk factors for ${symbol} in the current market environment.`);
    res.json({ riskAnalysis: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
