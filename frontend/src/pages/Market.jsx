import { useState, useContext } from "react"
import { AppContext } from "../contexts/AppContext"
import BuyModal from "../components/BuyModal"
import StockChart from "../components/StockChart";

function Market() {
  const { buyStock, addToWatchlist } = useContext(AppContext);
  const [selectedStock, setSelectedStock] = useState(null);

  const stocks = [
    { symbol: "TCS", price: 3800 },
    { symbol: "INFY", price: 1500 },
    { symbol: "RELIANCE", price: 2500 },
    { symbol: "HDFC", price: 2700 }
  ];

  function openModal(stock) {
    setSelectedStock(stock);
  }

  function closeModal() {
    setSelectedStock(null);
  }

  function handleBuy(symbol, price, qty) {
    buyStock(symbol, price, qty);
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Market</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {stocks.map(function (stock) {
          return (
            <div
              key={stock.symbol}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">{stock.symbol}</h2>

              <p className="text-gray-500 mt-1">Current Price</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{stock.price}
              </p>

              <button
                onClick={() => openModal(stock)}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
              >
                Buy
              </button>

              <button
                onClick={() => addToWatchlist(stock)}
                className="mt-2 w-full bg-yellow-400 text-black py-2 rounded-lg"
              >
                Add to Watchlist
              </button>

            </div>
          );
        })}
      </div>

      <BuyModal
        stock={selectedStock}
        onClose={closeModal}
        onConfirm={handleBuy}
      />

      <StockChart symbol="TCS" />
    </div>
  );
}

export default Market