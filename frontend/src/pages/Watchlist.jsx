import { useState, useEffect } from "react";
import { getWatchlist, removeFromWatchlist } from "../api/data.js";

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchWatchlist() {
    try {
      const data = await getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWatchlist();
  }, []);

  async function removeStock(symbol) {
    try {
      await removeFromWatchlist(symbol);
      setWatchlist(watchlist.filter((item) => item.symbol !== symbol));
    } catch (error) {
      alert("Failed to remove from watchlist");
    }
  }

  return (
    <div className="p-10 bg-white min-h-screen font-sans text-black">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 pb-6 border-b border-gray-100">
          <h1 className="text-2xl font-medium tracking-tight text-gray-900">Watchlist</h1>
          <p className="text-sm text-gray-500 mt-1">Monitored assets for potential trade execution.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-4 w-4 border border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="border border-gray-100 p-12 text-center bg-gray-50/50">
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">No assets monitored</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-gray-200">
            {watchlist.map((stock, i) => (
              <div key={i} className="bg-white border-r border-b border-gray-200 p-8 hover:bg-gray-50 transition-colors group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="font-bold text-lg tracking-tight">{stock.symbol}</h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1 truncate">{stock.name}</p>
                  </div>
                </div>

                <button
                  onClick={() => removeStock(stock.symbol)}
                  className="w-full text-[10px] font-bold uppercase tracking-widest border border-black px-4 py-3 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
                >
                  Terminate Position
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;