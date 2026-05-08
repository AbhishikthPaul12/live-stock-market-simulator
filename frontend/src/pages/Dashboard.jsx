import { useEffect, useState } from "react";
import { getProfile } from "../api/auth.js";
import { getPortfolio, getWallet } from "../api/data.js";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [wallet, setWallet] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [realizedProfit, setRealizedProfit] = useState(0);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [w, p, profile] = await Promise.all([getWallet(), getPortfolio(), getProfile()]);
        
        setWallet(w.walletBalance);
        setPortfolio(p);
        setRealizedProfit(profile.realizedProfit || 0);
        await updatePricesLocal(p);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    async function updatePricesLocal(port) {
      if (!port || port.length === 0) return;
      const uniqueSymbols = [...new Set(port.map(s => s.symbol))];
      
      try {
        const { getAllStocks, getStockData } = await import('../api/data.js');
        const allStocks = await getAllStocks();
        const allPricesMap = {};
        allStocks.forEach(s => allPricesMap[s.symbol] = s.price);

        const newPrices = {};
        const symbolsToFetch = [];

        for (const sym of uniqueSymbols) {
          if (allPricesMap[sym]) {
             newPrices[sym] = allStocks.find(s => s.symbol === sym);
          } else {
             symbolsToFetch.push(sym);
          }
        }

        if (symbolsToFetch.length > 0) {
          const results = await Promise.all(
            symbolsToFetch.map(sym => getStockData(sym))
          );
          results.forEach(res => {
            if (res && res.price) newPrices[res.symbol] = res;
          });
        }
        
        setLivePrices(prev => ({...prev, ...newPrices}));
      } catch (err) {
        console.error("Error updating prices", err);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function updatePricesLoop(port) {
      if (!port || port.length === 0) return;
      const uniqueSymbols = [...new Set(port.map(s => s.symbol))];
      
      try {
        const { getAllStocks, getStockData } = await import('../api/data.js');
        const allStocks = await getAllStocks();
        const allPricesMap = {};
        allStocks.forEach(s => allPricesMap[s.symbol] = s.price);

        const newPrices = {};
        const symbolsToFetch = [];

        for (const sym of uniqueSymbols) {
          if (allPricesMap[sym]) {
             newPrices[sym] = allStocks.find(s => s.symbol === sym);
          } else {
             symbolsToFetch.push(sym);
          }
        }

        if (symbolsToFetch.length > 0) {
          const results = await Promise.all(
            symbolsToFetch.map(sym => getStockData(sym))
          );
          results.forEach(res => {
            if (res && res.price) newPrices[res.symbol] = res;
          });
        }
        
        setLivePrices(prev => ({...prev, ...newPrices}));
      } catch (err) {
        console.error("Error updating prices", err);
      }
    }

    const interval = setInterval(() => {
      updatePricesLoop(portfolio);
    }, 5000);

    return () => clearInterval(interval);
  }, [portfolio]);

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
           <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full -mr-40 -mt-40 z-0 opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Portfolio Analysis</h2>
                <div className="flex flex-col md:flex-row gap-10">
                   <div className="flex-1">
                      <p className="text-slate-500 font-medium leading-relaxed text-lg mb-8">
                        Your investment strategy is currently yielding a net performance of <span className={`font-black ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{profit >= 0 ? '₹' + profit.toFixed(2) + ' Surplus' : '₹' + Math.abs(profit).toFixed(2) + ' Deficit'}</span> relative to your entry prices.
                      </p>
                      <div className="flex flex-wrap gap-3">
                         <div className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                            AI Suggestions Active
                         </div>
                         <div className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest">
                            Risk: Moderate
                         </div>
                      </div>
                   </div>
                   <div className="w-full md:w-64 h-64 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col items-center justify-center group-hover:border-indigo-200 transition-colors">
                      <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                         <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Charts</span>
                      <span 
                        onClick={() => navigate("/dashboard/analytics")} 
                        className="text-xs font-bold text-indigo-600 mt-1 cursor-pointer hover:underline"
                      >
                        Explore Details
                      </span>
                   </div>
                </div>
              </div>
           </div>

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
      </div>
    </div>
  );
}

export default Dashboard;