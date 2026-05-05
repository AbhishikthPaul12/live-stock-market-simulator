import { useContext, useState } from "react"
import { AppContext } from "../contexts/AppContext"
import SellModal from "../components/SellModal"

function Portfolio() {
  const { portfolio, sellStock, realizedProfit } =
    useContext(AppContext);

  const [selectedStock, setSelectedStock] = useState(null);

  const currentPrices = {
    TCS: 4000,
    INFY: 1600,
    RELIANCE: 2600,
    HDFC: 2800
  };

  function openModal(stock) {
    setSelectedStock(stock);
  }

  function closeModal() {
    setSelectedStock(null);
  }

  function handleSell(symbol, price, qty) {
    sellStock(symbol, price, qty);
  }

  function calculateUnrealized() {
    return portfolio.reduce(function (acc, item) {
      const current = currentPrices[item.symbol] || item.buyPrice;
      return acc + (current - item.buyPrice) * item.quantity;
    }, 0);
  }

  const unrealizedProfit = calculateUnrealized();
  const totalProfit = realizedProfit + unrealizedProfit;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Portfolio</h1>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Realized</p>
          <p className="text-xl font-bold text-green-600">
            ₹{realizedProfit}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Unrealized</p>
          <p
            className={
              "text-xl font-bold " +
              (unrealizedProfit >= 0
                ? "text-green-600"
                : "text-red-500")
            }
          >
            ₹{unrealizedProfit}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Total</p>
          <p
            className={
              "text-xl font-bold " +
              (totalProfit >= 0
                ? "text-green-600"
                : "text-red-500")
            }
          >
            ₹{totalProfit}
          </p>
        </div>
      </div>

      {/* STOCK LIST */}
      {portfolio.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-500">No stocks owned yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {portfolio.map(function (item, index) {
            const current =
              currentPrices[item.symbol] || item.buyPrice;

            const profit =
              (current - item.buyPrice) * item.quantity;

            return (
              <div
                key={index}
                className="bg-white p-5 rounded-xl shadow"
              >
                <div className="flex justify-between">
                  <h2 className="text-xl font-semibold">
                    {item.symbol}
                  </h2>
                  <span className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </span>
                </div>

                <div className="mt-3 text-gray-600">
                  <p>Buy: ₹{item.buyPrice}</p>
                  <p>Current: ₹{current}</p>
                </div>

                <p
                  className={
                    "mt-3 font-bold " +
                    (profit >= 0
                      ? "text-green-600"
                      : "text-red-500")
                  }
                >
                  {profit >= 0 ? "+" : ""}₹{profit}
                </p>

                <button
                  onClick={() =>
                    openModal({
                      ...item,
                      currentPrice: current
                    })
                  }
                  className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg"
                >
                  Sell
                </button>
              </div>
            );
          })}
        </div>
      )}

      <SellModal
        stock={selectedStock}
        onClose={closeModal}
        onConfirm={handleSell}
      />
    </div>
  );
}

export default Portfolio