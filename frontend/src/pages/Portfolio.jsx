import { useEffect, useState } from "react"
import { getPortfolio } from "../api/data.js"
import { sellStock } from "../api/trade.js"
import SellModal from "../components/SellModal"
import { useStockPrices } from "../hooks/useStockPrices.js"

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [realizedProfit, setRealizedProfit] = useState(0);

  const prices = {};

  async function fetchData() {
    const data = await getPortfolio();
    setPortfolio(data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSell(symbol, price, qty) {
    const stock = portfolio.find((s) => s.symbol === symbol);

    const profit = (price - stock.buyPrice) * qty;
    setRealizedProfit((prev) => prev + profit);

    await sellStock({ symbol, price, quantity: qty });
    fetchData();
  }

  // 🔥 Unrealized Profit
  const unrealizedProfit = portfolio.reduce((acc, item) => {
    const current = prices[item.symbol] || item.buyPrice;
    return acc + (current - item.buyPrice) * item.quantity;
  }, 0);

  const totalProfit = realizedProfit + unrealizedProfit;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Portfolio</h1>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p>Realized</p>
          <p className="text-green-600 font-bold">
            ₹{(realizedProfit || 0).toFixed(3)}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Unrealized</p>
          <p
            className={
              unrealizedProfit >= 0
                ? "text-green-600 font-bold"
                : "text-red-500 font-bold"
            }
          >
            ₹{(unrealizedProfit || 0).toFixed(3)}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Total</p>
          <p
            className={
              totalProfit >= 0
                ? "text-green-600 font-bold"
                : "text-red-500 font-bold"
            }
          >
            ₹{(totalProfit || 0).toFixed(3)}
          </p>
        </div>
      </div>

      {/* STOCK LIST */}
      <div className="grid md:grid-cols-2 gap-6">
        {portfolio.map((item, i) => {
          const current = prices[item.symbol] || item.buyPrice;
          const profit =
            (current - item.buyPrice) * item.quantity;

          return (
            <div key={i} className="bg-white p-5 rounded shadow">
              <h2>{item.symbol}</h2>
              <p>Qty: {item.quantity}</p>
              <p>Buy: ₹{(item.buyPrice || 0).toFixed(3)}</p>
              <p>Current: ₹{(current || 0).toFixed(3)}</p>

              <p
                className={
                  profit >= 0
                    ? "text-green-600 font-bold"
                    : "text-red-500 font-bold"
                }
              >
                ₹{(profit || 0).toFixed(3)}
              </p>

              <button
                onClick={() =>
                  setSelectedStock({
                    ...item,
                    currentPrice: current
                  })
                }
                className="mt-2 bg-red-500 text-white px-3 py-1"
              >
                Sell
              </button>
            </div>
          );
        })}
      </div>

      <SellModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        onConfirm={handleSell}
      />
    </div>
  );
}

export default Portfolio