import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { learnTopic } from "../api/ai.js";
import LoadingSkeleton from "../components/ai/LoadingSkeleton.jsx";

const TOPICS = [
  {
    id: "what-is-stock",
    title: "What is a Stock?",
    icon: "📈",
    level: "Beginner",
    description: "The fundamentals of equity ownership",
    query: "What is a stock? Explain it simply with a real-world analogy.",
  },
  {
    id: "diversification",
    title: "Diversification",
    icon: "🧩",
    level: "Beginner",
    description: "Why spreading risk matters",
    query: "Explain diversification in investing with examples and why it matters.",
  },
  {
    id: "risk-management",
    title: "Risk Management",
    icon: "🛡️",
    level: "Intermediate",
    description: "Protecting your capital intelligently",
    query: "Explain risk management in stock trading, including stop-loss, position sizing, and portfolio protection.",
  },
  {
    id: "candlestick",
    title: "Candlestick Basics",
    icon: "🕯️",
    level: "Intermediate",
    description: "Reading price action visually",
    query: "Explain candlestick charts in stock trading. Cover bullish/bearish candles, doji, hammer, and how to read them.",
  },
  {
    id: "long-term",
    title: "Long-Term Investing",
    icon: "🌱",
    level: "Beginner",
    description: "Building wealth over time",
    query: "Explain the principles of long-term investing, compounding, and why time in the market matters.",
  },
  {
    id: "pe-ratio",
    title: "P/E Ratio",
    icon: "🔢",
    level: "Intermediate",
    description: "Valuing stocks with fundamentals",
    query: "Explain the Price-to-Earnings (P/E) ratio: what it means, how to calculate it, and how to use it when evaluating stocks.",
  },
  {
    id: "market-cap",
    title: "Market Capitalization",
    icon: "🏢",
    level: "Beginner",
    description: "Understanding company size",
    query: "What is market capitalization? Explain large-cap, mid-cap, and small-cap stocks and their risk/reward profiles.",
  },
  {
    id: "technical-analysis",
    title: "Technical Analysis",
    icon: "📊",
    level: "Advanced",
    description: "Chart patterns and indicators",
    query: "Explain technical analysis in stock trading. Cover moving averages, RSI, MACD, support/resistance levels.",
  },
  {
    id: "fundamental-analysis",
    title: "Fundamental Analysis",
    icon: "🔬",
    level: "Advanced",
    description: "Analyzing business value",
    query: "Explain fundamental analysis: revenue, profit margins, EPS, ROE, and how to evaluate a company's financial health.",
  },
];

const LEVEL_COLORS = {
  Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  Advanced: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AILearn() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [error, setError] = useState(null);
  const explanationRef = useRef(null);

  useEffect(() => {
    if (explanation && explanationRef.current) {
      explanationRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [explanation]);

  async function fetchExplanation(query, topicTitle) {
    setLoading(true);
    setError(null);
    setExplanation("");

    try {
      const data = await learnTopic(query);
      setExplanation(data.explanation);
    } catch (err) {
      setError("AI learning assistant is temporarily unavailable. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  function handleTopicClick(topic) {
    setSelectedTopic(topic);
    fetchExplanation(topic.query, topic.title);
  }

  function handleCustomSubmit(e) {
    e.preventDefault();
    if (!customInput.trim()) return;
    setSelectedTopic({ title: customInput.trim(), icon: "💬" });
    fetchExplanation(customInput.trim());
    setCustomInput("");
  }

  const filteredTopics =
    activeFilter === "All" ? TOPICS : TOPICS.filter((t) => t.level === activeFilter);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a2 2 0 01-2.828 0l-.344-.346z"
                />
              </svg>
            </div>
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              Powered by Gemini AI
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">AI Learning Hub</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg max-w-xl">
            Master stock market concepts with your personal AI tutor. From basics to advanced strategies.
          </p>
        </header>

        {/* Custom Question */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Ask Anything</p>
          <form onSubmit={handleCustomSubmit} className="flex gap-3">
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. What is dollar cost averaging? How do options work?"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            <button
              type="submit"
              disabled={!customInput.trim() || loading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
            >
              Ask AI
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topics Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Filter by Level</p>
                <div className="flex gap-2 flex-wrap">
                  {["All", "Beginner", "Intermediate", "Advanced"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
                        activeFilter === f
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic)}
                    className={`w-full text-left px-6 py-4 hover:bg-indigo-50/50 transition-all group flex items-center gap-4 ${
                      selectedTopic?.id === topic.id ? "bg-indigo-50 border-l-2 border-indigo-600" : ""
                    }`}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{topic.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-black text-sm tracking-tight ${selectedTopic?.id === topic.id ? "text-indigo-700" : "text-slate-900"}`}>
                        {topic.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{topic.description}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border shrink-0 ${LEVEL_COLORS[topic.level]}`}>
                      {topic.level}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Explanation Panel */}
          <div className="lg:col-span-2" ref={explanationRef}>
            <AnimatePresence mode="wait">
              {!selectedTopic && !loading ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
                >
                  <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-100">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a2 2 0 01-2.828 0l-.344-.346z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Select a Topic</h3>
                  <p className="text-slate-400 text-sm font-medium max-w-xs">
                    Choose a topic from the left panel or ask your own question above to get a detailed AI explanation.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="explanation"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Topic Header */}
                  <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 to-transparent flex items-center gap-4">
                    <span className="text-3xl">{selectedTopic?.icon || "💬"}</span>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedTopic?.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-indigo-600">AI-Generated Explanation</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-8 py-6">
                    {loading ? (
                      <div className="space-y-4">
                        <LoadingSkeleton lines={6} />
                        <div className="h-6" />
                        <LoadingSkeleton lines={4} />
                      </div>
                    ) : error ? (
                      <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                        <svg className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-black text-rose-700">AI Unavailable</p>
                          <p className="text-xs text-rose-600 mt-1">{error}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed [&>h1]:text-2xl [&>h1]:font-black [&>h1]:text-slate-900 [&>h2]:text-xl [&>h2]:font-black [&>h2]:text-slate-800 [&>h3]:font-black [&>h3]:text-slate-800 [&>ul]:space-y-2 [&>p]:text-base">
                        <ReactMarkdown>{explanation}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Disclaimer */}
                  {!loading && !error && explanation && (
                    <div className="mx-8 mb-6 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
                      <p className="text-[10px] text-slate-400 font-medium">
                        📚 This explanation is AI-generated for educational purposes only. Always consult a qualified financial advisor before making investment decisions.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
