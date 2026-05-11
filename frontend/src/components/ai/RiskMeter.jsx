import { motion } from "framer-motion";

const riskConfigs = {
  Low: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    bar: "bg-emerald-500",
    icon: "✓",
    label: "Low Risk",
    width: "33%"
  },
  Medium: {
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    bar: "bg-amber-500",
    icon: "!",
    label: "Medium Risk",
    width: "66%"
  },
  High: {
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    bar: "bg-rose-500",
    icon: "⚠",
    label: "High Risk",
    width: "100%"
  }
};

export default function RiskMeter({ riskLevel = "Medium", explanation = "", reasoning = "" }) {
  const config = riskConfigs[riskLevel] || riskConfigs.Medium;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Risk Assessment</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.bg} ${config.color} ${config.border}`}>
          {config.icon} {config.label}
        </span>
      </div>

      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: config.width }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${config.bar}`}
        />
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs font-bold text-slate-900 mb-1">AI Reasoning</p>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{reasoning || "Analyzing trade parameters against historical volatility."}</p>
        </div>
        
        {explanation && (
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            "{explanation}"
          </p>
        )}
      </div>
    </div>
  );
}
