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
      setPortfolio(currentPortfolio => {
        updatePrices(currentPortfolio);
        return currentPortfolio;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function handleSell(symbol, price, qty) {
    try {
      const stock = portfolio.find((s) => s.symbol === symbol);
      const profit = (price - stock.buyPrice) * qty;
      
      // Optimistic UI update
      setRealizedProfit((prev) => prev + profit);

      const res = await sellStock({ symbol, quantity: qty });
      
      // Update local state immediately from response
      setRealizedProfit(res.realizedProfit || 0);
      
      // Refresh portfolio list
      const p = await getPortfolio();
      setPortfolio(p);
      
      alert(res.message || "Stock sold successfully!");
    } catch (err) {
      console.error("Sell error:", err);
      alert(err.response?.data?.message || "Failed to sell stock.");
      
      // Revert data in case of error
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Portfolio</h1>
            <p className="text-slate-500 mt-1">Real-time asset tracking and performance analysis.</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold text-sm ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {isPositive ? '▲' : '▼'} ₹{Math.abs(totalProfit).toFixed(2)} Overall
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Realized Profit</p>
            <h2 className={`text-3xl font-bold ${realizedProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              ₹{realizedProfit.toFixed(3)}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${unrealizedProfit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Unrealized P&L</p>
            <h2 className={`text-3xl font-bold ${unrealizedProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              ₹{unrealizedProfit.toFixed(3)}
            </h2>
          </div>

          <div className={`p-6 rounded-2xl shadow-lg border-none text-white transition-all transform hover:scale-[1.02] ${isPositive ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-rose-500 to-orange-600'}`}>
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wider mb-2">Total Net P&L</p>
            <h2 className="text-3xl font-black">
              ₹{totalProfit.toFixed(3)}
            </h2>
          </div>
        </div>

        {/* HOLDINGS TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Active Positions</h3>
            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded-full">{portfolio.length} Assets</span>
          </div>
          
          <div className="overflow-x-auto">
            {portfolio.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">💼</div>
                <p className="text-slate-500 font-bold">Your portfolio is currently empty.</p>
                <p className="text-sm text-slate-400 mt-1">Start trading to build your wealth.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100 bg-slate-50/20">
                    <th className="px-8 py-5 font-black">Asset</th>
                    <th className="px-8 py-5 font-black">Quantity</th>
                    <th className="px-8 py-5 font-black">Avg. Buy</th>
                    <th className="px-8 py-5 font-black">Current</th>
                    <th className="px-8 py-5 font-black">Gain / Loss</th>
                    <th className="px-8 py-5 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {portfolio.map((item, i) => {
                    const current = livePrices[item.symbol]?.price || item.buyPrice;
                    const profit = (current - item.buyPrice) * item.quantity;
                    const profitPercent = ((current - item.buyPrice) / item.buyPrice) * 100;

                    return (
                      <tr key={i} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black overflow-hidden border border-slate-50">
                              {livePrices[item.symbol]?.logo ? (
                                <img src={livePrices[item.symbol].logo} alt={item.symbol} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-slate-400">{item.symbol[0]}</span>
                              )}
                            </div>
                            <div>
                              <span className="font-black text-slate-900 block">{item.symbol}</span>
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Equity</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-slate-600 font-bold">{item.quantity}</td>
                        <td className="px-8 py-6 text-slate-500 font-medium">₹{item.buyPrice.toFixed(2)}</td>
                        <td className="px-8 py-6 text-slate-900 font-black">₹{current.toFixed(2)}</td>
                        <td className="px-8 py-6">
                          <div className={`flex flex-col ${profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            <span className="font-black">₹{profit.toFixed(2)}</span>
                            <span className="text-xs font-bold bg-opacity-10 rounded px-1 w-fit mt-1">
                              {profit >= 0 ? '▲' : '▼'} {Math.abs(profitPercent).toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button
                            onClick={() => setSelectedStock({ ...item, currentPrice: current })}
                            className="bg-slate-900 hover:bg-rose-600 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-slate-200 hover:shadow-rose-200 transition-all transform active:scale-95"
                          >
                            Sell
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