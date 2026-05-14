export default function RecommendationCard({ symbol, category, confidence, reason, onBuy }) {
  const categoryConfig = {
    Trending: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", icon: "🔥" },
    Momentum: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "⚡" },
    Stable: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "🛡️" },
    "Beginner-Friendly": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "⭐" },
  };

  const cfg = categoryConfig[category] || categoryConfig["Stable"];
  const confidenceColor =
    confidence >= 85 ? "text-emerald-600" : confidence >= 70 ? "text-amber-600" : "text-slate-500";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 p-5 flex flex-col gap-4 group">
      {/* Top Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center font-black text-slate-700 text-sm group-hover:scale-105 transition-transform">
            {symbol.slice(0, 2)}
          </div>
          <div>
            <p className="font-black text-slate-900 text-base tracking-tight">{symbol.replace(".NS", "")}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              {cfg.icon} {category}
            </span>
          </div>
        </div>

        {/* AI Badge */}
        <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">
          <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a2 2 0 01-2.828 0l-.344-.346z"
            />
          </svg>
          <span className="text-[10px] font-black text-indigo-600">AI Pick</span>
        </div>
      </div>

      {/* Confidence */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Confidence</span>
          <span className={`text-sm font-black ${confidenceColor}`}>{confidence}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Reason */}
      <p className="text-xs text-slate-500 font-medium leading-relaxed">{reason}</p>

      {/* Disclaimer + Action */}
      <div className="flex items-center justify-end pt-2 border-t border-slate-50">
        {onBuy && (
          <button
            onClick={() => onBuy(symbol)}
            className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Trade →
          </button>
        )}
      </div>
    </div>
  );
}
