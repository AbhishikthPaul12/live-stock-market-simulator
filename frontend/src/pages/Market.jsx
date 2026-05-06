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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer" onClick={() => setChartStock(s)}>
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-bold overflow-hidden border border-slate-50">
              {s.logo ? (
                <img src={s.logo} alt={s.symbol} className="w-full h-full object-contain" />
              ) : (
                <span className="text-slate-400">{s.symbol[0]}</span>
              )}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {isPositive ? '▲' : '▼'} {Math.abs(s.change).toFixed(2)}%
            </div>
          </div>
          <h3 className="font-black text-slate-900 text-xl tracking-tight">{s.symbol}</h3>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mt-1 truncate">{s.name}</p>
        </div>
        
        <div className="flex justify-between items-end mt-8">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current Price</p>
            <p className="text-2xl font-black text-slate-900">₹{s.price.toFixed(2)}</p>
          </div>
          <button
            className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Market</h1>
            <p className="text-slate-500 mt-1 font-medium">Real-time stock monitoring and instant execution.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by ticker (e.g. AAPL)..." 
              className="w-full bg-white border-none shadow-sm rounded-2xl p-4 pl-12 text-slate-600 placeholder-slate-300 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-all">
              Search
            </button>
          </form>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">{error}</span>
          </div>
        )}

        {stock && !loading && !error && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-slate-200"></span>
              Search Result
            </h2>
            <div className="max-w-sm">
              <StockCard s={stock} />
            </div>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <span className="w-8 h-px bg-slate-200"></span>
            Trending Stocks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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