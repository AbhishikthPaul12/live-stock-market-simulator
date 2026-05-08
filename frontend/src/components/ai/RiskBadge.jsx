// Risk badge with animated gauge and color coding
export default function RiskBadge({ level = "Medium", score = 5, reasoning = "", compact = false }) {
  const config = {
    Low: {
      color: "emerald",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      bar: "bg-emerald-500",
      dot: "bg-emerald-500",
      width: "33%",
      icon: "🟢",
    },
    Medium: {
      color: "amber",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      bar: "bg-amber-500",
      dot: "bg-amber-500",
      width: "66%",
      icon: "🟡",
    },
    High: {
      color: "rose",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      bar: "bg-rose-500",
      dot: "bg-rose-500",
      width: "90%",
      icon: "🔴",
    },
  };

  const cfg = config[level] || config["Medium"];

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${cfg.bg} ${cfg.text} ${cfg.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
        {level} Risk
      </span>
    );
  }

  return (
    <div className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cfg.icon}</span>
          <span className={`text-sm font-black uppercase tracking-widest ${cfg.text}`}>
            {level} Risk
          </span>
        </div>
        <span className={`text-xs font-black ${cfg.text} opacity-70`}>{score}/10</span>
      </div>

      {/* Animated gauge bar */}
      <div className="h-2 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full ${cfg.bar} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: cfg.width }}
        />
      </div>

      {reasoning && (
        <p className={`text-xs mt-2 ${cfg.text} opacity-80 leading-relaxed`}>{reasoning}</p>
      )}
    </div>
  );
}
