import { useState, useEffect } from "react"
import { buyStock } from "../api/trade.js"
import { getAllStocks } from "../api/data.js"
import BuyModal from "../components/BuyModal.jsx"
import ChartModal from "../components/ChartModal.jsx"
import { useStockPrices } from "../hooks/useStockPrices.js"

function Market() {
  const [searchInput, setSearchInput] = useState("");
  const [activeSymbol, setActiveSymbol] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);
  const [chartStock, setChartStock] = useState(null);
  const [allStocks, setAllStocks] = useState([]);
  
  const { stock, loading, error } = useStockPrices(activeSymbol);

  useEffect(() => {
    async function fetchAll() {
      try {
        const data = await getAllStocks();
        setAllStocks(data);
      } catch (err) {
        console.error("Error fetching all stocks", err);
      }
    }
    fetchAll();
    const intId = setInterval(fetchAll, 2000); // Poll every 2s for live simulated updates
    return () => clearInterval(intId);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveSymbol(searchInput.trim().toUpperCase());
    }
  };

  // BUY FUNCTION
  async function handleBuy(symbol, qty) {
    try {
      await buyStock({ symbol, quantity: qty });
      alert("Stock bought!");
      setSelectedStock(null);
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Error buying stock");
    }
  }

  // WATCHLIST FUNCTION
  function addToWatchlist(stockToAdd) {
    const stored = JSON.parse(localStorage.getItem("watchlist")) || [];
    const exists = stored.find((item) => item.symbol === stockToAdd.symbol);

    if (exists) {
      alert("Already in watchlist");
      return;
    }

    const updated = [...stored, stockToAdd];
    localStorage.setItem("watchlist", JSON.stringify(updated));
    alert("Added to watchlist");
  }

  // Reusable Stock Card Component
  const StockCard = ({ s }) => (
    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        {s.logo ? (
          <img src={s.logo} alt={s.symbol} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-lg">
            {s.symbol[0]}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold">{s.symbol}</h2>
          <p className="text-sm text-gray-500 truncate w-48">{s.name}</p>
        </div>
      </div>

      <div className="flex justify-between items-end mb-6 mt-4">
        <p className="text-4xl font-bold">
          ₹{s.price || 0}
        </p>
        <p className={`font-bold text-xl ${s.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {s.change > 0 ? '+' : ''}{s.change || 0}
        </p>
      </div>

      <button
        onClick={() => setChartStock(s)}
        className="w-full bg-gray-800 hover:bg-black text-white py-3 rounded transition-colors font-bold"
      >
        View Stock
      </button>
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Market</h1>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2 max-w-md">
        <input 
          type="text" 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search stock symbol (e.g. AAPL, TSLA)" 
          className="flex-1 p-3 rounded shadow outline-none uppercase"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 rounded shadow hover:bg-blue-700 font-bold">
          Search
        </button>
      </form>

      {loading && activeSymbol && <p className="text-gray-600 mb-8">Loading...</p>}
      {error && !loading && <p className="text-red-500 font-bold mb-8">{error}</p>}

      {stock && !loading && !error && (
        <div className="max-w-md mb-12 border-b pb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Search Result</h2>
          <StockCard s={stock} />
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6">Available Real Stocks</h2>
        {allStocks.length === 0 ? (
          <p>Loading real-time market data...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {allStocks.map(s => <StockCard key={s.symbol} s={s} />)}
          </div>
        )}
      </div>

      {selectedStock && (
        <BuyModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          onConfirm={handleBuy}
        />
      )}

      {chartStock && (
        <ChartModal 
          stock={chartStock} 
          onClose={() => setChartStock(null)} 
          onBuy={(s) => setSelectedStock(s)}
          onWatchlist={addToWatchlist}
        />
      )}
    </div>
  );
}

export default Market;