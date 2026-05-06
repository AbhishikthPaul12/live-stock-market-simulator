import { useState, useEffect } from "react";
import { buyStock } from "../api/trade.js";
import { getAllStocks } from "../api/data.js";
import ChartModal from "../components/ChartModal.jsx";
import { useStockPrices } from "../hooks/useStockPrices.js";

function Market() {
  const [searchInput, setSearchInput] = useState("");
  const [activeSymbol, setActiveSymbol] = useState("");
  const [chartStock, setChartStock] = useState(null);
  const [allStocks, setAllStocks] = useState([]);
  
  const { stock, loading, error } = useStockPrices(activeSymbol);

  async function fetchAll() {
    try {
      const data = await getAllStocks();
      setAllStocks(data);
    } catch (err) {
      console.error("Error fetching all stocks", err);
    }
  }

  useEffect(() => {
    fetchAll();
    const intId = setInterval(fetchAll, 5000); 
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
      alert("Trade executed successfully!");
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Trade failed.");
    }
  }

  async function addToWatchlist(stockToAdd) {
    try {
      const { addToWatchlist: apiCall } = await import("../api/data.js");
      await apiCall({ 
        symbol: stockToAdd.symbol, 
        name: stockToAdd.name 
      });
      alert("Added to Watchlist!");
    } catch (error) {
      alert(error.response?.data?.message || "Already in watchlist or failed to add.");
    }
  }

  const StockCard = ({ s }) => {
    const isPositive = s.change >= 0;
    return (
      <div 
        className="bg-white rounded-[32px] border border-slate-200 p-7 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer" 
        onClick={() => setChartStock(s)}
      >
        <div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black overflow-hidden border border-slate-100 shadow-inner">
              {s.logo ? (
                <img src={s.logo} alt={s.symbol} className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-slate-400 text-xl">{s.symbol[0]}</span>
              )}
            </div>
            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {isPositive ? '▲' : '▼'} {Math.abs(s.change).toFixed(2)}%
            </div>
          </div>
          <h3 className="font-black text-slate-900 text-2xl tracking-tighter">{s.symbol}</h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 truncate">{s.name}</p>
        </div>
        
        <div className="flex justify-between items-end mt-10">
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 opacity-60">Price</p>
            <p className="text-2xl font-black text-slate-900 font-mono">₹{s.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg shadow-indigo-100 group-hover:bg-indigo-700 transition-all transform active:scale-90">
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
        <header className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Market</h1>
            <p className="text-slate-500 mt-2 font-medium text-lg">Real-time assets monitoring and instant execution.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full lg:w-[450px] group">
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search ticker (e.g. TSLA)..." 
              className="w-full bg-white border border-slate-200 shadow-sm rounded-[24px] p-5 pl-14 text-slate-900 font-bold placeholder-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-lg"
            />
            <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              Search
            </button>
          </form>
        </header>

        {error && (
          <div className="mb-10 p-5 bg-rose-50 text-rose-600 rounded-3xl border border-rose-100 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <span className="font-bold text-lg">{error}</span>
          </div>
        )}

        {stock && !loading && !error && (
          <div className="mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-4">
              <span className="w-12 h-0.5 bg-indigo-500 rounded-full"></span>
              Search Result
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <StockCard s={stock} />
            </div>
          </div>
        )}

        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-4">
            <span className="w-12 h-0.5 bg-slate-200 rounded-full"></span>
            Market Assets
          </h2>
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
          onWatchlist={addToWatchlist}
        />
      )}
    </div>
  );
}

export default Market;