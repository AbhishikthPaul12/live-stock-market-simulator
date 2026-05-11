import { motion } from "framer-motion";
import LoadingSkeleton from "./LoadingSkeleton.jsx";

export default function PortfolioAIAnalysis({ data, loading, error }) {
  if (loading) return <div className="p-6 bg-white rounded-3xl border border-slate-200"><LoadingSkeleton lines={6} /></div>;
  if (error) return null;
  if (!data) return null;

  // Sanitize summary to remove potential JSON/Markdown leftovers
  const sanitizeSummary = (text) => {
    if (typeof text !== 'string') return '';
    return text.replace(/```json|```/g, "").replace(/\{[\s\S]*\}/g, "").trim();
  };

  const cleanSummary = sanitizeSummary(summary);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider">AI Portfolio Advisor</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Intelligent Wealth Analysis</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
           <span className="text-indigo-400 text-2xl font-black">{score || 0}</span>
           <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Health Score</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Risk & Diversification Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Risk Profile</span>
            <span className={`text-sm font-black uppercase ${
              riskLevel === 'Low' ? 'text-emerald-600' : riskLevel === 'High' ? 'text-rose-600' : 'text-amber-600'
            }`}>
              {riskLevel || 'Medium'} Risk
            </span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Diversification</span>
            <span className="text-sm font-black text-slate-900">{diversification || 'Analysis completed.'}</span>
          </div>
        </div>

        {/* AI Summary */}
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">AI Diagnostic Summary</span>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {cleanSummary || (summary && summary.length > 200 ? summary.substring(0, 200) + '...' : summary) || 'Analysis in progress...'}
          </p>
        </div>


        {/* Suggestions */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] block mb-4">Strategic Recommendations</span>
          <div className="space-y-3">
            {suggestions && suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 group">
                <div className="w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                  <svg className="w-3 h-3 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[13px] text-slate-500 font-bold group-hover:text-slate-900 transition-colors">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
