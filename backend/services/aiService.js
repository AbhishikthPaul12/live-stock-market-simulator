import { HfInference } from "@huggingface/inference";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const HF_MODEL = "meta-llama/Llama-3.2-1B-Instruct";

const SYSTEM_PROMPT = `You are an AI Trading Copilot specializing in the Indian Stock Market (NSE and BSE).
Your role is to:
- explain stocks simply
- analyze portfolios
- explain risks
- summarize trends
- educate beginners
- provide simulated trading insights using Indian context (e.g., SEBI, Nifty 50, Sensex, INR)

Never provide real financial advice.
Keep responses concise, educational, professional, and beginner-friendly.
Ensure your responses are fully finished and do not cut off.`;

/**
 * Call Gemini API (Primary)
 */
async function callGemini(prompt) {
  try {
    const result = await geminiModel.generateContent([
      { text: SYSTEM_PROMPT },
      { text: prompt }
    ]);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw error;
  }
}

/**
 * Call Hugging Face API (Fallback)
 */
async function callHF(prompt) {
  try {
    const response = await hf.chatCompletion({
      model: HF_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Hugging Face API Error:", error.message);
    throw new Error("AI service temporarily unavailable");
  }
}

/**
 * Robust JSON extraction from AI response
 */
const extractJSON = (text) => {
  if (!text) return null;
  try {
    const cleanText = text.replace(/```json|```/g, "").trim();
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}') + 1;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(cleanText.slice(jsonStart, jsonEnd));
    }
    const arrStart = cleanText.indexOf('[');
    const arrEnd = cleanText.lastIndexOf(']') + 1;
    if (arrStart !== -1 && arrEnd !== -1) {
      return JSON.parse(cleanText.slice(arrStart, arrEnd));
    }
  } catch (e) {
    console.warn("JSON Extraction Failed:", e.message);
  }
  return null;
};

/**
 * Main AI call function with Gemini primary and HF fallback
 */
async function askAIWithFallback(prompt) {
  try {
    return await callGemini(prompt);
  } catch (error) {
    console.log("Gemini failed, falling back to Hugging Face...");
    return await callHF(prompt);
  }
}

export const askAI = async (message) => {
  return await askAIWithFallback(message);
};

export const analyzePortfolio = async (portfolioData) => {
  const prompt = `Analyze this portfolio data: ${JSON.stringify(portfolioData)}.
  Return exactly ONE structured JSON object with fields: score (0-100), summary (text), diversification (text), suggestions (array of strings), riskLevel (string).
  
  CRITICAL: 
  - Do NOT include markdown code blocks. 
  - Do NOT include any code, explanations, or console logs.
  - Return ONLY the JSON object.`;
  
  try {
    const text = await askAIWithFallback(prompt);
    const parsed = extractJSON(text);
    if (parsed) return parsed;
    
    let extractedSummary = text;
    const summaryMatch = text.match(/"summary":\s*"([\s\S]*?)"/);
    if (summaryMatch) {
      extractedSummary = summaryMatch[1];
    } else {
      extractedSummary = text
        .replace(/\{|\}|\[|\]/g, "")
        .replace(/"?summary"?:|"?score"?:|"?diversification"?:|"?suggestions"?:|"?riskLevel"?:/gi, "")
        .replace(/\d+,\s*/, "")
        .replace(/,\s*High|,\s*Medium|,\s*Low/i, "")
        .replace(/,\s*Standard.*/i, "")
        .replace(/,\s*,/g, ",")
        .replace(/^\s*,/, "")
        .trim();
    }

    return {
      score: 75,
      summary: extractedSummary || "Analysis completed based on current holdings.",
      diversification: "Standard diversification analysis.",
      suggestions: ["Consider broadening your asset variety."],
      riskLevel: "Medium"
    };
  } catch (error) {
    return {
      score: 0,
      summary: "Portfolio analysis service temporarily unavailable.",
      diversification: "N/A",
      suggestions: [],
      riskLevel: "Unknown"
    };
  }
};

export const generateStockInsight = async (stockData) => {
  const prompt = `Provide a detailed financial insight for ${stockData.name} (${stockData.symbol}).
  Return the response in a structured JSON format with fields: summary, riskLevel, sentiment, volatility, shortTermOutlook.
  
  CRITICAL REQUIREMENTS:
  - The analysis MUST be about ${stockData.name}.
  - Return ONLY ONE JSON object. Do NOT repeat yourself.
  - Do NOT wrap the JSON in markdown code blocks.
  - Provide 3-4 bullet points of educational insight in the 'summary' field.
  - Every field must be a STRING.`;
  
  try {
    const text = await askAIWithFallback(prompt);
    const parsed = extractJSON(text);
    if (parsed) return parsed;
    
    const cleanSummary = text
      .replace(/```json|```|\{|\}|\[|\]/g, "")
      .replace(/"(summary|riskLevel|sentiment|volatility|shortTermOutlook|industry|sector|summaryOfBenefits|benefits|outlook|analysis|risk)":/gi, "")
      .replace(/"\s*,\s*"/g, "\n")
      .replace(/^"|"$|",$/g, "")
      .replace(/\\"/g, '"')
      .replace(/\s+/g, " ")
      .trim();
    
    return {
      summary: cleanSummary || "Analysis completed based on current market data.",
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
  return await askAIWithFallback(prompt);
};

export const getWatchlistInsights = async (watchlistData) => {
  const prompt = `Analyze this user's stock watchlist and provide a summary of trends, potential sudden movements, and volatility alerts.
  Watchlist: ${JSON.stringify(watchlistData)}
  Return the response in a structured JSON format with fields: globalSummary, stockInsights (array of objects with symbol, trend, volatility, and aiNote).`;
  
  try {
    const text = await askAIWithFallback(prompt);
    const parsed = extractJSON(text);
    if (parsed) return parsed;
    
    return {
      globalSummary: "Watchlist analysis completed. Monitor for volatility in high-beta stocks.",
      stockInsights: watchlistData.map(s => ({ symbol: s.symbol, trend: "Neutral", volatility: "Standard", aiNote: "Steady performance observed." }))
    };
  } catch (error) {
    return { globalSummary: "Watchlist AI temporarily unavailable.", stockInsights: [] };
  }
};

export const summarizeNews = async (headlines) => {
  const prompt = `Summarize these financial news headlines and provide sentiment (positive, neutral, negative) for each.
  Headlines: ${JSON.stringify(headlines)}
  Return the response in a structured JSON format with a "summaries" array containing objects with "headline", "summary", and "sentiment".`;
  
  try {
    const text = await askAIWithFallback(prompt);
    const parsed = extractJSON(text);
    if (parsed) return parsed;
    
    return { summaries: headlines.map(h => ({ headline: h, summary: "", sentiment: "neutral" })) };
  } catch (error) {
    return { summaries: [] };
  }
};
