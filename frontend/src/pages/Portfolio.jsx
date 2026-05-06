import { useEffect, useState } from "react";
import { getPortfolio } from "../api/data.js";
import { sellStock } from "../api/trade.js";
import { getProfile } from "../api/auth.js";
import SellModal from "../components/SellModal";

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [realizedProfit, setRealizedProfit] = useState(0);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [p, profile] = await Promise.all([getPortfolio(), getProfile()]);
        setPortfolio(p);
        setRealizedProfit(profile.realizedProfit || 0);
        await updatePrices(p);
      } catch (err) {
        console.error("Error fetching portfolio:", err);
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
      updatePrices(portfolio); 
    }, 5000);

    return () => clearInterval(interval);
  }, [portfolio]);

  async function handleSell(symbol, price, qty) {
    try {
      const stock = portfolio.find((s) => s.symbol === symbol);
      const profit = (price - stock.buyPrice) * qty;
      
      setRealizedProfit((prev) => prev + profit);

      const res = await sellStock({ symbol, quantity: qty });
      
      setRealizedProfit(res.realizedProfit || 0);
      
      const p = await getPortfolio();
      setPortfolio(p);
      
      alert(res.message || "Stock sold successfully!");
    } catch (err) {
      console.error("Sell error:", err);
      alert(err.response?.data?.message || "Failed to sell stock.");
      
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
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Portfolio</h1>
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

        {/* HOLDINGS TABLE */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Active Positions</h3>
              <p className="text-slate-400 text-xs font-medium mt-1">Manage your open trades and exit strategies.</p>
            </div>
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-4 py-2 rounded-xl uppercase tracking-widest border border-slate-200">{portfolio.length} Assets</span>
          </div>
          
          <div className="overflow-x-auto">
            {portfolio.length === 0 ? (
              <div className="py-32 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner text-4xl">💼</div>
                <p className="text-slate-900 font-black text-xl">Portfolio Empty</p>
                <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto font-medium">Build your wealth by exploring the market and executing your first trade.</p>
              </div>
            ) : (
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
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Equity Position</span>
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