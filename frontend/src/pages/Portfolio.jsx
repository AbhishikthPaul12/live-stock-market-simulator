import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPortfolio, getAllStocks } from "../api/data.js";
import { sellStock } from "../api/trade.js";
import { getProfile } from "../api/auth.js";
import { getStockInsight, getPortfolioAnalysis } from "../api/ai.js";
import SellModal from "../components/SellModal";
import RiskBadge from "../components/ai/RiskBadge.jsx";
import LoadingSkeleton from "../components/ai/LoadingSkeleton.jsx";

import { useToast } from "../context/ToastContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

// ─── Per-stock AI insight component ──────────────────────────────────────────
const PortfolioAIInsight = ({ symbol, price, change }) => {
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [showInsight, setShowInsight] = useState(false);

  async function fetchInsight() {
    if (showInsight) { setShowInsight(false); return; }
    setShowInsight(true);
    setInsightLoading(true);
    try {
      const data = await getStockInsight(symbol, price || 0, change || 0);
      setInsight(data);
    } catch {
      setInsight({ summary: "AI insight temporarily unavailable.", sentiment: "Neutral", riskLevel: "Medium" });
    } finally {
      setInsightLoading(false);
    }
  }

  const sentimentColors = { Bullish: "bg-emerald-50 text-emerald-600 border-emerald-100", Bearish: "bg-rose-50 text-rose-600 border-rose-100", Neutral: "bg-slate-50 text-slate-500 border-slate-100" };

  return (
    <div className="mt-2">
      <button
        onClick={fetchInsight}
        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a2 2 0 01-2.828 0l-.344-.346z" /></svg>
        {showInsight ? "Hide AI" : "AI Insight"}
      </button>
      {showInsight && (
        <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2">
          {insightLoading ? (
            <LoadingSkeleton lines={2} />
          ) : insight ? (
            <>
              <div className="flex items-center justify-between">
                 <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${sentimentColors[insight.sentiment] || sentimentColors.Neutral}`}>{insight.sentiment}</span>
                 <RiskBadge level={insight.riskLevel} compact />
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed whitespace-pre-line">
                {typeof insight.summary === 'object' 
                  ? (insight.summary.company || insight.summary.description || JSON.stringify(insight.summary)) 
                  : insight.summary}
              </p>
              {insight.shortTermOutlook && (
                <div className="text-[9px] text-slate-400 font-medium whitespace-pre-line">
                  <span className="font-black text-slate-600">Outlook: </span>
                  {insight.shortTermOutlook}
                </div>
              )}
              {insight.volatility && (
                <div className="text-[9px] text-slate-400 font-medium whitespace-pre-line">
                  <span className="font-black text-slate-600">Volatility: </span>
                  {insight.volatility}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

function Portfolio() {
  const { addToast } = useToast();
  const [portfolio, setPortfolio] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [realizedProfit, setRealizedProfit] = useState(0);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [p, profile, stocks] = await Promise.all([getPortfolio(), getProfile(), getAllStocks()]);
        setPortfolio(p);
        setRealizedProfit(profile.realizedProfit || 0);
        
        // Seed livePrices state immediately
        const initialPrices = {};
        stocks.forEach((s) => {
          initialPrices[s.symbol] = { price: s.price, change: s.change, logo: s.logo };
        });
        setLivePrices(initialPrices);
      } catch (err) {
        console.error("Error fetching portfolio:", err);
      } finally {
        setLoading(false);
      }
    }



    fetchData();
  }, []);

  // Use Socket.IO for live price updates instead of polling
  const { livePrices: socketPrices } = useSocket();

  useEffect(() => {
    if (Object.keys(socketPrices).length === 0 || portfolio.length === 0) return;
    setLivePrices((prev) => {
      const next = { ...prev };
      for (const item of portfolio) {
        if (socketPrices[item.symbol]) {
          next[item.symbol] = socketPrices[item.symbol];
        }
      }
      return next;
    });
  }, [socketPrices, portfolio]);

  async function handleSell(symbol, price, qty) {
    try {
      const stock = portfolio.find((s) => s.symbol === symbol);
      const profit = (price - stock.buyPrice) * qty;
      
      setRealizedProfit((prev) => prev + profit);

      const res = await sellStock({ symbol, quantity: qty });
      
      setRealizedProfit(res.realizedProfit || 0);
      
      const p = await getPortfolio();
      setPortfolio(p);
      
      addToast(res.message || `Sold ${qty} shares of ${symbol} successfully!`, "success");
    } catch (err) {
      console.error("Sell error:", err);
      addToast(err.response?.data?.message || "Failed to sell stock.", "error");
      
      const [p, profile] = await Promise.all([getPortfolio(), getProfile()]);
      setPortfolio(p);
      setRealizedProfit(profile.realizedProfit || 0);
    }
  }

  const unrealizedProfit = portfolio.reduce((acc, item) => {
    const current = livePrices[item.symbol]?.price || item.buyPrice;
    return acc + (current - item.buyPrice) * item.quantity;
  }, 0);

  const totalProfit = realizedProfit + unrealizedProfit;
  const isPositive = totalProfit >= 0;

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIAnalyze = async () => {
    setAiLoading(true);
    try {
      const data = await getPortfolioAnalysis(portfolio);
      setAiAnalysis(data);
    } catch (err) {
      addToast("Portfolio analysis failed.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Portfolio</h1>
            <p className="text-slate-500 mt-2 font-medium text-lg">Real-time asset tracking and performance analysis.</p>
          </div>
          <div className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border shadow-sm ${isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
            <span className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            {isPositive ? 'Profit' : 'Loss'} • ₹{Math.abs(totalProfit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Realized P&L</p>
            <h2 className={`text-4xl font-black tracking-tighter ${realizedProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              ₹{realizedProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="mt-6 flex items-center gap-2">
               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Settled Trades</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-5 group-hover:scale-110 transition-transform duration-700 ${unrealizedProfit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Unrealized P&L</p>
            <h2 className={`text-4xl font-black tracking-tighter ${unrealizedProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              ₹{unrealizedProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="mt-6 flex items-center gap-2">
               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Floating Performance</span>
            </div>
          </div>

          <div className={`p-8 rounded-[32px] shadow-2xl text-white transition-all transform hover:scale-[1.03] flex flex-col justify-between ${isPositive ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-indigo-100' : 'bg-gradient-to-br from-rose-600 to-rose-800 shadow-rose-100'}`}>
            <div>
              <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em] mb-4">Total Net P&L</p>
              <h2 className="text-4xl font-black tracking-tighter">
                ₹{totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-8">Aggregate Portfolio Return</p>
          </div>
        </div>

        {/* AI PORTFOLIO ANALYSIS */}
        <div className="mb-12">
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-10 relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Portfolio Insights</h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">Deep AI analysis of your holdings using.</p>
                 </div>
                 <button 
                   onClick={handleAIAnalyze}
                   disabled={aiLoading || portfolio.length === 0}
                   className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                 >
                   {aiLoading ? "Analyzing..." : "Analyze Portfolio"}
                 </button>
              </div>

              {!aiAnalysis ? (
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center">
                   <p className="text-slate-400 font-bold text-sm">Click the button above to generate a full AI analysis of your current portfolio.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                   <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 text-center">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Risk Score</p>
                      <h4 className="text-5xl font-black text-indigo-700 tracking-tighter">{aiAnalysis.score}</h4>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mt-2 inline-block">
                        AI Powered
                      </span>
                   </div>
                   <div className="lg:col-span-3 space-y-6">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Executive Summary</p>
                          <p className="text-slate-600 font-medium leading-relaxed">
                            {aiAnalysis.summary?.replace(/\{|\}|\[|\]|^["\s,]+|["\s,]+$|"/g, "").replace(/,\s*,/g, ",").trim()}
                          </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-white border border-slate-100 rounded-2xl p-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Diversification</p>
                            <p className="text-xs text-slate-500 font-medium">{aiAnalysis.diversification}</p>
                         </div>
                         <div className="bg-white border border-slate-100 rounded-2xl p-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Suggestions</p>
                            <ul className="space-y-2">
                               {aiAnalysis.suggestions?.map((s, i) => (
                                 <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                    <span className="text-indigo-500 mt-1 font-black">→</span>
                                    {s}
                                 </li>
                               ))}
                            </ul>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HOLDINGS */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 md:px-10 py-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/30 gap-4">
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Active Positions</h3>
              <p className="text-slate-400 text-xs font-medium mt-1">Manage your open trades and exit strategies.</p>
            </div>
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-4 py-2 rounded-xl uppercase tracking-widest border border-slate-200">{portfolio.length} Assets</span>
          </div>
          
          <div className="p-0">
            {portfolio.length === 0 ? (
              <div className="py-32 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner text-4xl">💼</div>
                <p className="text-slate-900 font-black text-xl">Portfolio Empty</p>
                <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto font-medium">Build your wealth by exploring the market and executing your first trade.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50 bg-slate-50/10">
                        <th className="px-10 py-6">Asset</th>
                        <th className="px-10 py-6">Quantity</th>
                        <th className="px-10 py-6">Avg. Buy</th>
                        <th className="px-10 py-6">Current</th>
                        <th className="px-10 py-6">P&L Status</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {portfolio.map((item, i) => {
                        const current = livePrices[item.symbol]?.price || item.buyPrice;
                        const profit = (current - item.buyPrice) * item.quantity;
                        const profitPercent = ((current - item.buyPrice) / item.buyPrice) * 100;

                        return (
                          <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-10 py-7">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black overflow-hidden border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                                  {livePrices[item.symbol]?.logo ? (
                                    <img src={livePrices[item.symbol].logo} alt={item.symbol} className="w-full h-full object-contain p-2" />
                                  ) : (
                                    <span className="text-slate-400 text-xl">{item.symbol[0]}</span>
                                  )}
                                </div>
                                <div>
                                  <span className="font-black text-slate-900 text-lg tracking-tight block">{item.symbol}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Asset</span>
                                  <PortfolioAIInsight symbol={item.symbol} price={current} change={profitPercent} />
                                  <Link 
                                    to={`/dashboard/market?symbol=${item.symbol}`}
                                    className="mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-600 transition-colors"
                                  >
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    Trade Now
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-7 text-slate-600 font-bold text-lg">{item.quantity}</td>
                            <td className="px-10 py-7 text-slate-500 font-mono text-sm">₹{item.buyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="px-10 py-7 text-slate-900 font-black text-lg font-mono">₹{current.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="px-10 py-7">
                              <div className={`flex flex-col ${profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                <span className="font-black text-lg tracking-tight">₹{profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg w-fit mt-1 border ${profit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                  {profit >= 0 ? '▲' : '▼'} {Math.abs(profitPercent).toFixed(2)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-10 py-7 text-right">
                              <button
                                onClick={() => setSelectedStock({ ...item, currentPrice: current })}
                                className="bg-slate-900 text-white px-8 py-3 rounded-[18px] text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-rose-600 hover:shadow-rose-100 transition-all transform active:scale-90"
                              >
                                Exit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-slate-100">
                   {portfolio.map((item, i) => {
                      const current = livePrices[item.symbol]?.price || item.buyPrice;
                      const profit = (current - item.buyPrice) * item.quantity;
                      const profitPercent = ((current - item.buyPrice) / item.buyPrice) * 100;
                      return (
                        <div key={i} className="p-6 space-y-6">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black border border-slate-100 shadow-sm">
                                    {livePrices[item.symbol]?.logo ? (
                                      <img src={livePrices[item.symbol].logo} alt={item.symbol} className="w-full h-full object-contain p-2" />
                                    ) : (
                                      <span className="text-slate-400 text-lg">{item.symbol[0]}</span>
                                    )}
                                 </div>
                                 <div>
                                    <h4 className="font-black text-slate-900 text-lg tracking-tight leading-none">{item.symbol}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Holding: {item.quantity} Units</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest mb-1">Live Value</p>
                                 <p className="text-lg font-black text-slate-900 font-mono tracking-tight">₹{current.toLocaleString('en-IN')}</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <div>
                                 <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Buy Price</p>
                                 <p className="font-bold text-slate-600 text-sm">₹{item.buyPrice.toLocaleString('en-IN')}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Performance</p>
                                 <div className={`flex items-center justify-end gap-1 font-black text-sm ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {profit >= 0 ? '▲' : '▼'} {Math.abs(profitPercent).toFixed(2)}%
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-3">
                              <button
                                onClick={() => setSelectedStock({ ...item, currentPrice: current })}
                                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all"
                              >
                                Liquidate Asset
                              </button>
                              <Link 
                                to={`/dashboard/market?symbol=${item.symbol}`}
                                className="w-14 h-14 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-2xl border border-indigo-100 active:scale-95 transition-all"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                              </Link>
                           </div>
                           <PortfolioAIInsight symbol={item.symbol} price={current} change={profitPercent} />
                        </div>
                      )
                   })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <SellModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        onConfirm={handleSell}
      />
    </div>
  );
}

export default Portfolio;
