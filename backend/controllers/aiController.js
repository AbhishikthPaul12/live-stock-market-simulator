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
    const response = await aiService.askAI("Provide 3-5 stock recommendations for a beginner trader in the current market context. Format as a list.");
    res.json({ recommendations: response });
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
