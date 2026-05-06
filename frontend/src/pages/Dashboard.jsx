import { useEffect, useState } from "react";
import { getProfile } from "../api/auth.js";
import { getPortfolio, getWallet } from "../api/data.js";

function Dashboard() {
  const [wallet, setWallet] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [realizedProfit, setRealizedProfit] = useState(0);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(true);

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
    
    async function updatePrices(port) {
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
    
    const interval = setInterval(() => {
      setPortfolio(currentPortfolio => {
        updatePrices(currentPortfolio);
        return currentPortfolio;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Your financial summary and asset distribution.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-3">Available Balance</p>
            <p className="text-3xl font-black text-slate-900">₹{(wallet || 0).toFixed(2)}</p>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 rounded-full w-[60%]"></div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-3">Holdings</p>
            <p className="text-3xl font-black text-slate-900">{portfolio.length}</p>
            <p className="text-xs font-bold text-slate-400 mt-2">Active Positions</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-3">Net Asset Value</p>
            <p className="text-3xl font-black text-slate-900">₹{portfolioValue.toFixed(2)}</p>
            <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              Live Market Tracking
            </p>
          </div>

          <div className={`p-8 rounded-3xl shadow-lg transition-all transform hover:scale-[1.02] text-white ${totalProfit >= 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-rose-500 to-orange-600'}`}>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-3">Total Net P&L</p>
            <p className="text-3xl font-black">{totalProfit >= 0 ? '+' : ''}₹{totalProfit.toFixed(2)}</p>
            <p className="text-xs font-bold opacity-80 mt-2">Realized + Floating</p>
          </div>
        </div>

        <div className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 z-0 opacity-50"></div>
            <div className="relative z-10 flex-1">
              <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Portfolio Summary</h2>
              <p className="text-slate-500 font-medium max-w-md leading-relaxed">
                Your investment strategy is currently yielding a net performance of <span className={`font-black ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{profit >= 0 ? 'Surplus' : 'Deficit'}</span> relative to your entry prices. Monitor individual assets in the Portfolio tab for exit strategies.
              </p>
              <div className="mt-8 flex gap-4">
                 <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live API Connected</span>
                 </div>
              </div>
            </div>
            <div className="w-full md:w-64 h-40 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 font-black relative z-10">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
               <span className="text-xs uppercase tracking-widest">Analytics Dashboard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;