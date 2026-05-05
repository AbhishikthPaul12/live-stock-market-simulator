import { useState, useEffect } from "react"

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("watchlist")) || [];
    setWatchlist(stored);
  }, []);

  function removeStock(symbol) {
    const updated = watchlist.filter(
      (item) => item.symbol !== symbol
    );
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Watchlist</h1>

      {watchlist.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          No stocks in watchlist
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {watchlist.map((stock, i) => (
            <div key={i} className="bg-white p-4 rounded shadow">
              <h2 className="font-bold">{stock.symbol}</h2>

              <button
                onClick={() => removeStock(stock.symbol)}
                className="mt-2 bg-red-500 text-white px-3 py-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Watchlist