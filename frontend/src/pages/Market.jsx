import { useState, useEffect } from "react";
import { buyStock } from "../api/trade.js";
import { getAllStocks, addToWatchlist } from "../api/data.js";
import ChartModal from "../components/ChartModal.jsx";
import { useStockPrices } from "../hooks/useStockPrices.js";
import { useToast } from "../context/ToastContext.jsx";

function Market() {
  const { addToast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [activeSymbol, setActiveSymbol] = useState("");
  const [chartStock, setChartStock] = useState(null);
  const [allStocks, setAllStocks] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const { stock, loading, error } = useStockPrices(activeSymbol);

  async function fetchAll() {
    try {
      const data = await getAllStocks();
      setAllStocks(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching all stocks", err);
    }
  }

  useEffect(() => {
    fetchAll();
    const intId = setInterval(fetchAll, 2000); // Polling every 2 seconds for a "live" feel
    return () => clearInterval(intId);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveSymbol(searchInput.trim().toUpperCase());
    }
  };

  async function handleBuy(symbol, qty) {
    try {
      await buyStock({ symbol, quantity: qty });
      addToast(`Purchase of ${qty} shares of ${symbol} completed!`, "success");
    } catch (error) {
      addToast(error.response?.data?.message || error.message || "Trade execution failed.", "error");
    }
  }

  async function handleAddToWatchlist(stockToAdd) {
    try {
      await addToWatchlist({ 
        symbol: stockToAdd.symbol, 
        name: stockToAdd.name 
      });
      addToast(`${stockToAdd.symbol} is now in your watchlist.`, "success");
    } catch (error) {
      addToast(error.response?.data?.message || "Already in watchlist.", "error");
    }
  }

  const StockCard = ({ s }) => {
    const isPositive = s.change >= 0;
    const displaySymbol = s.symbol.replace('.NS', '').replace('.BO', '');
    const [imgError, setImgError] = useState(false);
    return (
      <div 
        className="bg-white rounded-[32px] border border-slate-100 p-7 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden" 
        onClick={() => setChartStock(s)}
      >
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-5 transition-transform group-hover:scale-150 duration-700 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
        
        <div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 shadow-inner flex items-center justify-center">
              {s.logo && !imgError ? (
                <img
                  src={s.logo}
                  alt={displaySymbol}
                  className="w-full h-full object-contain p-1.5 bg-white"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-white font-black text-lg bg-gradient-to-br ${isPositive ? 'from-indigo-500 to-indigo-700' : 'from-rose-500 to-rose-700'}`}>
                  {displaySymbol.slice(0, 2)}
                </div>
              )}
            </div>
            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {isPositive ? '▲' : '▼'} {Math.abs(s.change || 0).toFixed(2)}%
            </div>
          </div>
          <h3 className="font-black text-slate-900 text-2xl tracking-tighter leading-none">{displaySymbol}</h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2 truncate max-w-[180px]">{s.name}</p>
        </div>
        
        <div className="flex justify-between items-end mt-12">
          <div>
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-1">Live Price</p>
            <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">₹{s.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl shadow-slate-200 group-hover:bg-indigo-600 transition-all transform active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
               <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200"></span>
               <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em]">Live Exchange</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter">Market Overview</h1>
            <p className="text-slate-500 mt-4 font-medium text-xl max-w-xl leading-relaxed opacity-80">
              Access 100+ global equity assets with institutional-grade real-time price execution.
            </p>
          </div>
          
          <div className="w-full lg:w-[500px]">
             <form onSubmit={handleSearch} className="relative group mb-4">
                <input 
                  type="text" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Ticker symbol (e.g. TCS)..." 
                  className="w-full bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-3xl p-6 pl-16 text-slate-900 font-black placeholder-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-lg"
                />
                <svg className="w-7 h-7 absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg">
                  Search
                </button>
             </form>
             <div className="flex justify-between px-2">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Global Asset Discovery</p>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Updated: {lastUpdated.toLocaleTimeString()}</p>
             </div>
          </div>
        </header>

        {error && (
          <div className="mb-12 p-6 bg-rose-50 text-rose-600 rounded-[32px] border border-rose-100 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
               <p className="text-sm font-black uppercase tracking-widest opacity-60 mb-0.5">Asset Fault</p>
               <p className="font-black text-lg">{error}</p>
            </div>
          </div>
        )}

        {stock && !loading && !error && (
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-10">
               <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Search Result</h2>
               <div className="flex-1 h-px bg-slate-100"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <StockCard s={stock} />
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-4 mb-10">
             <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Global Assets</h2>
             <div className="flex-1 h-px bg-slate-100"></div>
             <span className="bg-slate-100 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{allStocks.length} Tracked</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {allStocks.map(s => (
              <StockCard key={s.symbol} s={s} />
            ))}
          </div>
        </div>
      </div>

      {chartStock && (
        <ChartModal 
          stock={chartStock} 
          onClose={() => setChartStock(null)} 
          onBuy={(qty) => handleBuy(chartStock.symbol, qty)}
          onWatchlist={handleAddToWatchlist}
        />
      )}
    </div>
  );
}

export default Market;