import { useEffect, useState } from "react";
import { getProfile } from "../api/auth.js";
import { getPortfolio, getWallet } from "../api/data.js";
import { getPortfolioAnalysis, getNewsSummary } from "../api/ai.js";
import { useNavigate } from "react-router-dom";
import LoadingSkeleton from "../components/ai/LoadingSkeleton.jsx";
import RiskBadge from "../components/ai/RiskBadge.jsx";

// Mock news headlines for AI summarization
const MOCK_HEADLINES = [
  "Indian markets rally as RBI holds interest rates steady",
  "Adani Group stocks surge following infrastructure deal announcement",
  "Tech sector faces headwinds amid global chip shortage concerns",
  "FII inflows reach record high as rupee stabilizes against dollar",
  "SEBI introduces new regulations for F&O trading to curb speculation",
];

// Sentiment color config
function SentimentPill({ sentiment }) {
  const cfg = {
    positive: "bg-emerald-50 text-emerald-700 border-emerald-200",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
    negative: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const icons = { positive: "↑", neutral: "→", negative: "↓" };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${cfg[sentiment] || cfg.neutral}`}>
      {icons[sentiment] || "→"} {sentiment}
    </span>
  );
}

function Dashboard() {
  const [wallet, setWallet] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [realizedProfit, setRealizedProfit] = useState(0);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // News loaded on demand only — not auto
  const [newsData, setNewsData] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsLoaded, setNewsLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [w, p, profile] = await Promise.all([getWallet(), getPortfolio(), getProfile()]);
        setWallet(w.walletBalance);
        setPortfolio(p);
        setRealizedProfit(profile.realizedProfit || 0);
        await updatePrices(p);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // AI States
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);

  async function updatePrices(port) {
    if (!port || port.length === 0) return;
    const uniqueSymbols = [...new Set(port.map((s) => s.symbol))];
    try {
      const { getAllStocks, getStockData } = await import("../api/data.js");
      const allStocks = await getAllStocks();
      const allPricesMap = {};
      allStocks.forEach((s) => (allPricesMap[s.symbol] = s.price));
      const newPrices = {};
      const symbolsToFetch = [];
      for (const sym of uniqueSymbols) {
        if (allPricesMap[sym]) {
          newPrices[sym] = allStocks.find((s) => s.symbol === sym);
        } else {
          symbolsToFetch.push(sym);
        }
      }
      if (symbolsToFetch.length > 0) {
        const results = await Promise.all(symbolsToFetch.map((sym) => getStockData(sym)));
        results.forEach((res) => {
          if (res && res.price) newPrices[res.symbol] = res;
        });
      }
      setLivePrices((prev) => ({ ...prev, ...newPrices }));
    } catch (err) {
      console.error("Error updating prices", err);
    }
  }

  useEffect(() => {
    async function updatePricesLoop(port) {
      if (!port || port.length === 0) return;
      const uniqueSymbols = [...new Set(port.map((s) => s.symbol))];
      try {
        const { getAllStocks, getStockData } = await import("../api/data.js");
        const allStocks = await getAllStocks();
        const allPricesMap = {};
        allStocks.forEach((s) => (allPricesMap[s.symbol] = s.price));
        const newPrices = {};
        const symbolsToFetch = [];
        for (const sym of uniqueSymbols) {
          if (allPricesMap[sym]) {
            newPrices[sym] = allStocks.find((s) => s.symbol === sym);
          } else {
            symbolsToFetch.push(sym);
          }
        }
        if (symbolsToFetch.length > 0) {
          const results = await Promise.all(symbolsToFetch.map((sym) => getStockData(sym)));
          results.forEach((res) => {
            if (res && res.price) newPrices[res.symbol] = res;
          });
        }
        setLivePrices((prev) => ({ ...prev, ...newPrices }));
      } catch (err) {
        console.error("Error updating prices", err);
      }
    }
    const interval = setInterval(() => updatePricesLoop(portfolio), 5000);
    return () => clearInterval(interval);
  }, [portfolio]);

  async function handleAIAnalyze() {
    if (aiLoading) return;
    setAiLoading(true);
    setAiAnalyzed(true);
    try {
      const holdings = portfolio.map((h) => ({
        symbol: h.symbol,
        quantity: h.quantity,
        buyPrice: h.buyPrice,
      }));
      const data = await getPortfolioAnalysis(holdings);
      setAiAnalysis(data);
    } catch {
      setAiAnalysis(null);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleFetchNews() {
    if (newsLoading) return;
    setNewsLoading(true);
    setNewsLoaded(true);
    try {
      const data = await getNewsSummary(MOCK_HEADLINES);
      setNewsData(data.summaries || []);
    } catch {
      setNewsData(MOCK_HEADLINES.map((h) => ({ headline: h, summary: "", sentiment: "neutral" })));
    } finally {
      setNewsLoading(false);
    }
  }

  const portfolioValue = portfolio.reduce((acc, item) => {
    const current = livePrices[item.symbol]?.price || item.buyPrice;
    return acc + current * item.quantity;
  }, 0);

  const profit = portfolio.reduce((acc, item) => {
    const current = livePrices[item.symbol]?.price || item.buyPrice;
    return acc + (current - item.buyPrice) * item.quantity;
  }, 0);

  const totalProfit = realizedProfit + profit;

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
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
            <p className="text-slate-500 mt-1 font-medium text-lg">Good afternoon! Here's your portfolio's performance today.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/dashboard/market")} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Explore Market</button>
            <button onClick={() => navigate("/dashboard/portfolio")} className="bg-white text-slate-900 border border-slate-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">View Holdings</button>
          </div>
        </header>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* WALLET */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m.599-1c.51-.498.901-1.099.901-2.101 0-1.101-.391-1.703-.901-2.101M12 16c-1.11 0-2.08-.402-2.599-1M12 16V7m0 9v1" /></svg>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Wallet Balance</span>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">₹{(wallet || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Withdrawal Limit</span>
              <span className="text-[10px] font-black text-indigo-500">100%</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full w-full"></div>
            </div>
          </div>

          {/* ASSETS */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Holdings</span>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{portfolio.length}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Active Positions
            </p>
          </div>

          {/* NET VALUE */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Invested Value</span>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">₹{portfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="mt-4 flex items-center gap-2 px-2 py-1 bg-emerald-50 rounded-lg w-fit">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Market Live</span>
            </div>
          </div>

          {/* NET P&L */}
          <div className={`p-7 rounded-3xl shadow-xl shadow-slate-200 transition-all transform hover:scale-[1.03] text-white flex flex-col justify-between ${totalProfit >= 0 ? 'bg-gradient-to-br from-indigo-600 to-indigo-800' : 'bg-gradient-to-br from-rose-600 to-rose-800'}`}>
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <span className="text-xs font-black uppercase tracking-widest opacity-80">Total Net P&L</span>
              </div>
              <p className="text-3xl font-black tracking-tight">{totalProfit >= 0 ? '+' : ''}₹{totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <p className="text-[10px] font-bold opacity-70 mt-6 uppercase tracking-widest">Realized + Floating</p>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* AI PORTFOLIO ANALYSIS CARD */}
          <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full -mr-40 -mt-40 z-0 opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Portfolio Analysis</h2>
                {!aiAnalyzed && (
                  <button
                    onClick={handleAIAnalyze}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a2 2 0 01-2.828 0l-.344-.346z" /></svg>
                    Analyze with AI
                  </button>
                )}
              </div>

              {!aiAnalyzed ? (
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="flex-1">
                    <p className="text-slate-500 font-medium leading-relaxed text-lg mb-8">
                      Your investment strategy is currently yielding a net performance of{" "}
                      <span className={`font-black ${profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {profit >= 0 ? "₹" + profit.toFixed(2) + " Surplus" : "₹" + Math.abs(profit).toFixed(2) + " Deficit"}
                      </span>{" "}
                      relative to your entry prices.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <div className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        Click "Analyze with AI" for insights
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-64 h-64 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col items-center justify-center group-hover:border-indigo-200 transition-colors">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                      <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Charts</span>
                    <span onClick={() => navigate("/dashboard/analytics")} className="text-xs font-bold text-indigo-600 mt-1 cursor-pointer hover:underline">
                      Explore Details
                    </span>
                  </div>
                </div>
              ) : aiLoading ? (
                <div className="space-y-5">
                  <LoadingSkeleton lines={3} />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                    <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                  </div>
                  <LoadingSkeleton lines={2} />
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-5">
                  {/* Score + Risk Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-center">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI Score</p>
                      <p className="text-4xl font-black text-indigo-700">{aiAnalysis.score}</p>
                      <p className="text-[10px] text-indigo-500 font-medium mt-1">/ 100</p>
                    </div>
                    <div className="flex items-center">
                      <RiskBadge level={aiAnalysis.riskLevel} score={Math.round((aiAnalysis.score / 100) * 10)} reasoning={aiAnalysis.sectorExposure} />
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-slate-600 font-medium leading-relaxed text-sm">{aiAnalysis.summary}</p>

                  {/* Diversification */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diversification</p>
                    <p className="text-sm text-slate-700 font-medium">{aiAnalysis.diversification}</p>
                  </div>

                  {/* Suggestions */}
                  {aiAnalysis.suggestions?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Suggestions</p>
                      <ul className="space-y-2">
                        {aiAnalysis.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-indigo-500 mt-0.5 font-black shrink-0">→</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => { setAiAnalyzed(false); setAiAnalysis(null); }}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    ← Reset analysis
                  </button>
                </div>
              ) : (
                <p className="text-rose-500 text-sm font-medium">AI analysis failed. Please try again.</p>
              )}
            </div>
          </div>

          {/* MARKET PULSE */}
          <div className="bg-indigo-900 rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-800 rounded-full -mb-32 -mr-32 opacity-50 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-black mb-4 tracking-tight">Market Pulse</h2>
                <p className="text-indigo-200 font-medium leading-relaxed">
                  Global markets are showing high volatility today. Keep an eye on your watchlist.
                </p>
              </div>
              <div className="mt-10">
                <button onClick={() => navigate("/dashboard/market")} className="w-full bg-white text-indigo-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all active:scale-95">
                  Execute Trade
                </button>
                <p className="text-center text-indigo-400 text-[10px] font-bold mt-4 uppercase tracking-widest">Trusted by 10k+ Traders</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI NEWS SUMMARIZER */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Market News</h2>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              AI Summarized
            </span>
            <div className="flex-1"></div>
            {!newsLoaded && (
               <button 
                 onClick={handleFetchNews}
                 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-white border border-indigo-100 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all shadow-sm"
               >
                 Summarize Headlines
               </button>
            )}
          </div>

          {!newsLoaded ? (
            <div className="bg-white rounded-[32px] border border-slate-200 p-12 text-center shadow-sm">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
               </div>
               <h3 className="text-lg font-black text-slate-900 mb-1">Market Pulse</h3>
               <p className="text-xs text-slate-400 font-medium mb-6">Click the button above to generate AI summaries for today's top headlines.</p>
               <button 
                 onClick={handleFetchNews}
                 className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
               >
                 Generate AI Summaries
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                      <div className="h-3 bg-slate-200 rounded-full w-3/4 mb-3" />
                      <div className="h-3 bg-slate-200 rounded-full w-full mb-2" />
                      <div className="h-3 bg-slate-200 rounded-full w-4/5" />
                    </div>
                  ))
                : newsData.map((item, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3">
                      <p className="text-sm font-black text-slate-800 leading-snug">{item.headline}</p>
                      {item.summary && <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.summary}</p>}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                        <SentimentPill sentiment={item.sentiment || "neutral"} />
                        <span className="text-[10px] text-slate-300 font-medium">AI Summary</span>
                      </div>
                    </div>
                  ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;