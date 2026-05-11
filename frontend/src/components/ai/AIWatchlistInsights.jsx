import { motion } from "framer-motion";
import LoadingSkeleton from "./LoadingSkeleton.jsx";

export default function AIWatchlistInsights({ data, loading, error }) {
  if (loading) return <div className="p-6 bg-white rounded-3xl border border-slate-200"><LoadingSkeleton lines={4} /></div>;
  if (error) return null;
  if (!data) return null;

  const { globalSummary, stockInsights } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider">Watchlist Copilot</h3>
            <p className="text-indigo-200/60 text-[9px] font-bold uppercase tracking-widest">Intelligent Market Surveillance</p>
          </div>
        </div>
        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
          Gemini Active
        </span>
      </div>

      <div className="p-8">
        <div className="mb-8">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Global Surveillance Summary</span>
          <p className="text-slate-600 font-medium leading-relaxed italic border-l-4 border-indigo-500 pl-4 py-1">
            "{globalSummary}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stockInsights && stockInsights.map((s, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl group hover:border-indigo-200 transition-all">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-black text-slate-900 tracking-tight">{s.symbol}</span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${
                  s.trend === 'Bullish' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {s.trend}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                {s.aiNote}
              </p>
              <div className="mt-4 flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                 <div className={`w-1.5 h-1.5 rounded-full ${s.volatility === 'High' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.volatility} Volatility</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
