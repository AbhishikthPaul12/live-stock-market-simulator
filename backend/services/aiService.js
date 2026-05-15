import { HfInference } from "@huggingface/inference";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

<<<<<<< HEAD
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const HF_MODEL = "meta-llama/Llama-3.2-1B-Instruct";

const SYSTEM_PROMPT = "You are an AI-powered financial expert specializing in the Indian Stock Market (NSE and BSE). Your goal is to provide educational guidance inside a stock market simulator focused on Indian equities. Explain concepts using Indian context (e.g., SEBI, Nifty 50, Sensex, INR), provide educational guidance, and summarize stock information accurately. IMPORTANT: Always complete your thoughts and ensure your responses are fully finished.";
=======
const SYSTEM_PROMPT = `You are "StockSim AI", a specialized financial assistant for the Live Stock Market Simulator. 

STRICT GUIDELINES:
1. ONLY answer questions related to:
   - The Stock Market & Trading (NSE, BSE, Nifty 50, etc.).
   - Financial Literacy & Investment Concepts.
   - Guidance on using this "Live Stock Market Simulator" app.
2. If a user asks about UNRELATED topics (cooking, politics, sports, general history, etc.), politely decline and state that you are only programmed to assist with stock market and app-related queries.
3. Keep all responses highly concise (under 80-100 words).
4. Use simple, beginner-friendly language.
5. Do not hallucinate data; if you don't know a concept, suggest the user check the AI Learning hub.`;
>>>>>>> 7887eca4148cd361fd4dfc87e33f21a9637ca9e1

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
  return await callHF(message);
};

export const analyzePortfolio = async (portfolioData) => {
  const prompt = `Analyze this portfolio data: ${JSON.stringify(portfolioData)}.
  Return exactly ONE structured JSON object with fields: score (0-100), summary (text), diversification (text), suggestions (array of strings), riskLevel (string).
  
  CRITICAL: 
  - Limit the total length of the 'summary' text to under 80 words.
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
      // Last resort: meticulously strip all JSON-like structural characters and keys
      extractedSummary = text
        .replace(/\{|\}|\[|\]|```json|```|"/g, "") // Remove braces, brackets, quotes
        .replace(/"?summary"?:|"?score"?:|"?diversification"?:|"?suggestions"?:|"?riskLevel"?:/gi, "") // Remove keys
        .replace(/\d+,\s*/, "") // Remove the leading score + comma (e.g. "80, ")
        .replace(/,\s*High|,\s*Medium|,\s*Low/i, "") // Remove trailing risk levels
        .replace(/,\s*Standard.*/i, "") // Remove trailing diversification text
        .replace(/,\s*,/g, ",") // Remove double commas
        .replace(/^\s*,/, "") // Remove leading commas
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
  const prompt = `Generate a short financial summary for ${stockData.name} (${stockData.symbol}).
  The stock is trading at ₹${stockData.price} with a movement of ${stockData.change}%.
  
  IMPORTANT INSTRUCTIONS:
  1. SIMULATE 1 sentence of recent "Market News" (like earning report, expansion deal, etc) that drives this price.
  2. Return ONLY ONE RAW JSON OBJECT. No words before or after it.
  3. Do not use double quotes (") inside the summary text fields.
  
  EXACT OUTPUT FORMAT:
  {
    "summary": "Place the simulated news driver and short analysis here.",
    "riskLevel": "Low/Medium/High",
    "sentiment": "Bullish/Bearish/Neutral",
    "volatility": "Low/Medium/High",
    "shortTermOutlook": "Brief outlook statement"
  }`;
  
  try {
    const text = await callHF(prompt);
    try {
      // Smarter extraction: Find the FIRST valid { ... } block
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("Failed to parse AI JSON response.");
    }
    
    // Nuclear Scrubber: Meticulously strip ALL JSON-like artifacts
    const cleanSummary = text
      .replace(/```json|```|\{|\}|\[|\]/g, "") // Remove all brackets and blocks
      .replace(/"(summary|riskLevel|sentiment|volatility|shortTermOutlook|industry|sector|summaryOfBenefits|benefits|outlook|analysis|risk)":/gi, "") // Remove common keys
      .replace(/"\s*,\s*"/g, "\n") // Convert comma-separated quoted values into new lines
      .replace(/^"|"$|",$/g, "") // Remove leading/trailing quotes and trailing commas
      .replace(/\\"/g, '"') // Unescape quotes
      .replace(/\s+/g, " ") // Normalize spaces
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
  return await callHF(prompt);
};
