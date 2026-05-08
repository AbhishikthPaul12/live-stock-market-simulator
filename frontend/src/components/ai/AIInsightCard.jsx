import LoadingSkeleton from "./LoadingSkeleton.jsx";
import ReactMarkdown from "react-markdown";

const sentimentConfig = {
  Bullish: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "↗", dot: "bg-emerald-500" },
  Bearish: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: "↘", dot: "bg-rose-500" },
  Neutral: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: "→", dot: "bg-slate-400" },
  positive: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "↗", dot: "bg-emerald-500" },
  negative: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: "↘", dot: "bg-rose-500" },
  neutral: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: "→", dot: "bg-slate-400" },
};

export default function AIInsightCard({
  title = "AI Insight",
  content = "",
  sentiment = "Neutral",
  loading = false,
  error = false,
  className = "",
  compact = false,
}) {
  const cfg = sentimentConfig[sentiment] || sentimentConfig.Neutral;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a2 2 0 01-2.828 0l-.344-.346z"
              />
            </svg>
          </div>
          <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">
            {title}
          </span>
        </div>

        {!loading && !error && sentiment && (
          <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.icon} {sentiment}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {loading ? (
          <LoadingSkeleton lines={compact ? 2 : 4} />
        ) : error ? (
          <div className="flex items-center gap-2 text-slate-400">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs font-medium">AI service temporarily unavailable</span>
          </div>
        ) : (
          <div className="prose prose-sm prose-slate max-w-none text-slate-700 leading-relaxed text-sm">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
