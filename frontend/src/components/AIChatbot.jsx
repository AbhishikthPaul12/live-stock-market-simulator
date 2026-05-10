import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { sendChatMessage } from "../api/ai.js";

// ─── Typing Indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a2 2 0 01-2.828 0l-.344-.346z"
          />
        </svg>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chat Message ──────────────────────────────────────────────────────────────
function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 mb-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-black ${
          isUser ? "bg-slate-900 text-white" : "bg-indigo-600 text-white"
        }`}
      >
        {isUser ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a2 2 0 01-2.828 0l-.344-.346z"
            />
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[82%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
          isUser
            ? "bg-slate-900 text-white rounded-br-sm"
            : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Suggested Prompts ─────────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  "What is diversification?",
  "Is my portfolio risky?",
  "Explain candlestick charts",
  "How does P/E ratio work?",
  "Explain risk management",
];

// ─── Main Chatbot Component ────────────────────────────────────────────────────
export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ai_chat_history");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        {
          role: "assistant",
          content:
            "Hi! I'm **StockSim AI** 👋\n\nI can help you understand stocks, analyze your portfolio, explain market concepts, and answer trading questions.\n\nWhat would you like to know?",
        },
      ]);
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ai_chat_history", JSON.stringify(messages));
    }
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed || isLoading) return;

      setInput("");
      setError(null);

      const userMsg = { role: "user", content: trimmed };
      const currentMessages = [...messages, userMsg];
      setMessages(currentMessages);
      setIsLoading(true);

      try {
        const data = await sendChatMessage(trimmed, messages);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      } catch (err) {
        const errMsg = "AI service is temporarily unavailable. Please try again shortly.";
        setError(errMsg);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ ${errMsg}` },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, messages, isLoading]
  );

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => sendMessage(), 300);
    }
  }

  function handlePromptClick(prompt) {
    sendMessage(prompt);
  }

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────────────────── */}
      <motion.button
        onClick={() => {
          if (isOpen && isMinimized) {
            setIsMinimized(false);
          } else {
            setIsOpen(true);
            setIsMinimized(false);
          }
        }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-300 flex items-center justify-center hover:bg-indigo-700 transition-colors ${
          isOpen && !isMinimized ? "hidden" : "flex"
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="StockSim AI"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a2 2 0 01-2.828 0l-.344-.346z"
          />
        </svg>
        <span className="absolute w-14 h-14 rounded-full border-2 border-indigo-400 animate-ping opacity-30" />
      </motion.button>

      {/* ── Chat Window ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatbot"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={
              isMinimized
                ? { opacity: 1, y: 0, scale: 1, height: "auto" }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl shadow-slate-300/50 border border-slate-200 overflow-hidden flex flex-col ${
              isMinimized ? "" : "h-[580px] max-h-[80vh]"
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a2 2 0 01-2.828 0l-.344-.346z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-black text-sm">StockSim AI</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-indigo-200 text-[10px] font-medium">AI Powered</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsMinimized(true);
                    setIsOpen(false);
                  }}
                  className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                  title="Minimize"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0 bg-slate-50/50">
                  {messages.map((msg, i) => (
                    <ChatMessage key={i} message={msg} />
                  ))}
                  {isLoading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>

                {messages.length <= 1 && (
                  <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none bg-slate-50/50 border-t border-slate-100 shrink-0">
                    {SUGGESTED_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePromptClick(p)}
                        className="shrink-0 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors whitespace-nowrap"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                <div className="px-4 py-3 border-t border-slate-200 bg-white shrink-0">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask AI about markets..."
                      rows={1}
                      className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all max-h-28 overflow-y-auto"
                      style={{ lineHeight: "1.5" }}
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || isLoading}
                      className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
