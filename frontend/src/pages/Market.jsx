import { useState } from "react"
import { buyStock } from "../api/trade.js"
import BuyModal from "../components/BuyModal"

function Market() {
  const [selectedStock, setSelectedStock] = useState(null);

  const stocks = [
    { symbol: "TCS", price: 3800 },
    { symbol: "INFY", price: 1500 },
    { symbol: "RELIANCE", price: 2500 },
    { symbol: "HDFC", price: 2700 }
  ];

  // BUY FUNCTION
  async function handleBuy(symbol, price, qty) {
    try {
      await buyStock({ symbol, price, quantity: qty });
      alert("Stock bought!");
      setSelectedStock(null);
    } catch (error) {
      alert("Error buying stock");
    }
  }

  // WATCHLIST FUNCTION (LOCALSTORAGE BASED)
  function addToWatchlist(stock) {
    const stored =
      JSON.parse(localStorage.getItem("watchlist")) || [];

    const exists = stored.find(
      (item) => item.symbol === stock.symbol
    );

    if (exists) {
      alert("Already in watchlist");
      return;
    }

    const updated = [...stored, stock];

    localStorage.setItem("watchlist", JSON.stringify(updated));

    alert("Added to watchlist");
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Market</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="bg-white p-5 rounded-xl shadow"
          >
            <h2 className="text-xl font-semibold">
              {stock.symbol}
            </h2>

            <p className="text-green-600 text-2xl font-bold">
              ₹{stock.price}
            </p>

            {/* BUY BUTTON */}
            <button
              onClick={() => setSelectedStock(stock)}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded"
            >
              Buy
            </button>

            {/* WATCHLIST BUTTON */}
            <button
              onClick={() => addToWatchlist(stock)}
              className="mt-2 w-full bg-yellow-400 text-black py-2 rounded"
            >
              Add to Watchlist
            </button>
          </div>
        ))}
      </div>

      <BuyModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        onConfirm={handleBuy}
      />
    </div>
  );
}

export default Market