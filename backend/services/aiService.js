import { HfInference } from "@huggingface/inference";
import "dotenv/config";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const MODEL = "meta-llama/Llama-3.2-1B-Instruct";

const SYSTEM_PROMPT = "You are an AI-powered financial expert specializing in the Indian Stock Market (NSE and BSE). Your goal is to provide educational guidance inside a stock market simulator focused on Indian equities. Explain concepts using Indian context (e.g., SEBI, Nifty 50, Sensex, INR), provide educational guidance, and summarize stock information accurately. IMPORTANT: Always complete your thoughts and ensure your responses are fully finished.";

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
      max_tokens: 1000,
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
  const prompt = `Analyze this portfolio data: ${JSON.stringify(portfolioData)}.
  Return exactly ONE structured JSON object with fields: score (0-100), summary (text), diversification (text), suggestions (array of strings), riskLevel (string).
  
  CRITICAL: 
  - Do NOT include markdown code blocks. 
  - Do NOT include any code, explanations, or console logs.
  - Return ONLY the JSON object.`;
  
  try {
    const text = await callHF(prompt);
    try {
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("Failed to parse AI Portfolio JSON.");
    }
    
    // Aggressive Fallback: Clean up the text to ensure it's JUST a plain paragraph
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
  const prompt = `Provide a detailed financial insight for ${stockData.name} (${stockData.symbol}).
  Return the response in a structured JSON format with fields: summary, riskLevel, sentiment, volatility, shortTermOutlook.
  
  CRITICAL REQUIREMENTS:
  - The analysis MUST be about ${stockData.name}.
  - Return ONLY ONE JSON object. Do NOT repeat yourself.
  - Do NOT wrap the JSON in markdown code blocks.
  - Provide 3-4 bullet points of educational insight in the 'summary' field.
  - Every field must be a STRING.`;
  
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
