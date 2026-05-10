import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getWatchlist, removeFromWatchlist } from "../api/data.js";
import { getStockInsight } from "../api/ai.js";
import RiskBadge from "../components/ai/RiskBadge.jsx";

// Per-stock AI alert component
function WatchlistAIAlert({ symbol }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);

  async function fetchInsight() {
    if (shown) { setShown(false); return; }
    setShown(true);
    setLoading(true);
    try {
      const data = await getStockInsight(symbol, 0, 0);
      setInsight(data);
    } catch {
      setInsight({ summary: "AI insight temporarily unavailable.", sentiment: "Neutral", riskLevel: "Medium" });
    } finally {
      setLoading(false);
    }
  }

  const sentimentIcon = { Bullish: "↗", Bearish: "↘", Neutral: "→" };
  const sentimentColor = {
    Bullish: "text-emerald-600",
    Bearish: "text-rose-600",
    Neutral: "text-slate-500",
  };

  return (
    <div className="mt-4">
      <button
        onClick={fetchInsight}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a2 2 0 01-2.828 0l-.344-.346z"
          />
        </svg>
        {shown ? "Hide Alert" : "AI Alert"}
      </button>

      {shown && (
        <div className="mt-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 p-3 space-y-2">
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-indigo-200 rounded-full w-full" />
              <div className="h-3 bg-indigo-200 rounded-full w-4/5" />
            </div>
          ) : insight ? (
            <>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black ${sentimentColor[insight.sentiment] || "text-slate-500"}`}>
                  {sentimentIcon[insight.sentiment] || "→"} {insight.sentiment || "Neutral"}
                </span>
                <RiskBadge level={insight.riskLevel || "Medium"} compact />
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed whitespace-pre-line">
                {typeof insight.summary === 'object' 
                  ? (insight.summary.company || insight.summary.description || JSON.stringify(insight.summary)) 
                  : insight.summary?.replace(/\{|\}|\[|\]|^["\s,]+|["\s,]+$|"/g, "").replace(/,\s*,/g, ",").trim()}
              </p>
              {insight.shortTermOutlook && (
                <div className="text-[9px] text-slate-500 font-medium whitespace-pre-line">
                  <span className="font-black text-slate-700">Outlook: </span>
                  {insight.shortTermOutlook}
                </div>
              )}
              {insight.volatility && (
                <div className="text-[9px] text-slate-500 font-medium whitespace-pre-line">
                  <span className="font-black text-slate-700">Volatility: </span>
                  {insight.volatility}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchWatchlist() {
    try {
      const data = await getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWatchlist();
  }, []);

  async function removeStock(symbol) {
    try {
      await removeFromWatchlist(symbol);
      setWatchlist(watchlist.filter((item) => item.symbol !== symbol));
    } catch (error) {
      alert("Failed to remove from watchlist");
    }
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Watchlist</h1>
            <p className="text-slate-500 mt-2 font-medium text-lg italic opacity-80">Curated assets for strategic market entry.</p>
          </div>
          {watchlist.length > 0 && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a2 2 0 01-2.828 0l-.344-.346z"
                />
              </svg>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">AI Alerts Available</span>
            </div>
          )}
        </header>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="h-12 w-12 border-t-2 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="bg-white border border-slate-200 p-24 rounded-[40px] text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Watchlist Empty</h3>
            <p className="text-slate-500 max-w-xs mx-auto">Start monitoring stocks by adding them from the market dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {watchlist.map((stock, i) => (
              <div
                key={i}
                className="bg-white rounded-[32px] border border-slate-200 p-8 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black overflow-hidden border border-slate-100 mb-6 shadow-sm">
                      <span className="text-slate-400 text-xl">{stock.symbol[0]}</span>
                    </div>
                    <h2 className="font-black text-2xl tracking-tighter text-slate-900 uppercase">{stock.symbol}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 truncate">{stock.name}</p>
                  </div>

                  {/* AI Alert Section */}
                  <WatchlistAIAlert symbol={stock.symbol} />

                  <Link
                    to={`/dashboard/market?symbol=${stock.symbol}`}
                    className="mt-4 w-full bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    Trade Now
                  </Link>

                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <button
                      onClick={() => removeStock(stock.symbol)}
                      className="w-full bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Asset
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;