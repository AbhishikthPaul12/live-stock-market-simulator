import { HfInference } from "@huggingface/inference";
import "dotenv/config";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const MODEL = "meta-llama/Llama-3.2-1B-Instruct";

const SYSTEM_PROMPT = "You are an AI-powered financial learning assistant inside a stock market simulator. Explain concepts clearly, provide educational guidance, summarize stock information, and avoid giving real financial advice.";

/**
 * Generic function to call Hugging Face API using the official library (Chat Completion)
 */
async function callHF(prompt) {
  try {
    const response = await hf.chatCompletion({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Hugging Face API Error:", error.message);
    throw new Error("AI service temporarily unavailable");
  }
}

export const askAI = async (message) => {
  return await callHF(message);
};

export const analyzePortfolio = async (portfolioData) => {
  const prompt = `Analyze this portfolio data and provide a risk score (0-100), diversification feedback, suggestions, and health analysis. 
  Data: ${JSON.stringify(portfolioData)}
  Return the response in a structured JSON format with fields: score, summary, diversification, suggestions (array), riskLevel.`;
  
  try {
    const text = await callHF(prompt);
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(text.slice(jsonStart, jsonEnd));
      }
    } catch (e) {
      console.warn("Failed to parse AI JSON response, returning text summary.");
    }
    
    return {
      score: 75,
      summary: text,
      diversification: "Analysis completed.",
      suggestions: ["Consider further diversification"],
      riskLevel: "Medium"
    };
  } catch (error) {
    return {
      score: 0,
      summary: "AI service temporarily unavailable",
      diversification: "N/A",
      suggestions: [],
      riskLevel: "Unknown"
    };
  }
};

export const generateStockInsight = async (stockData) => {
  const prompt = `Provide a financial summary, risk level, market sentiment, volatility insight, and a short-term outlook for this stock: ${JSON.stringify(stockData)}.
  Return the response in a structured JSON format with fields: summary, riskLevel, sentiment, volatility, shortTermOutlook.`;
  
  try {
    const text = await callHF(prompt);
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(text.slice(jsonStart, jsonEnd));
      }
    } catch (e) {
      console.warn("Failed to parse AI JSON response.");
    }
    
    return {
      summary: text,
      riskLevel: "Medium",
      sentiment: "Neutral",
      volatility: "Standard",
      shortTermOutlook: "Monitoring market conditions."
    };
  } catch (error) {
    return {
      summary: "AI insight temporarily unavailable",
      riskLevel: "N/A",
      sentiment: "Neutral",
      volatility: "N/A",
      shortTermOutlook: "N/A"
    };
  }
};

export const explainTradingConcept = async (topic) => {
  const prompt = `Explain the trading concept of "${topic}" in simple, beginner-friendly terms for a student using a simulator. Provide an example if possible.`;
  return await callHF(prompt);
};
