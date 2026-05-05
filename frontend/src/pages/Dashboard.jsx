import { useEffect, useState } from "react"
import { getPortfolio, getWallet } from "../api/data.js"

function Dashboard() {
  const [wallet, setWallet] = useState(0);
  const [portfolio, setPortfolio] = useState([]);

  const prices = {
    TCS: 4000,
    INFY: 1600,
    RELIANCE: 2600,
    HDFC: 2800
  };

  useEffect(() => {
    async function fetchData() {
      const w = await getWallet();
      const p = await getPortfolio();

      setWallet(w.walletBalance);
      setPortfolio(p);
    }
    fetchData();
  }, []);

  // Holdings count
  const holdings = portfolio.length;

  // Portfolio value
  const portfolioValue = portfolio.reduce((acc, item) => {
    const current = prices[item.symbol] || item.buyPrice;
    return acc + current * item.quantity;
  }, 0);

  // Profit/Loss
  const profit = portfolio.reduce((acc, item) => {
    const current = prices[item.symbol] || item.buyPrice;
    return acc + (current - item.buyPrice) * item.quantity;
  }, 0);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <p>Wallet</p>
          <h2>₹{wallet}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Holdings</p>
          <h2>{holdings}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Portfolio Value</p>
          <h2>₹{portfolioValue}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Profit / Loss</p>
          <h2
            className={
              profit >= 0 ? "text-green-600" : "text-red-500"
            }
          >
            ₹{profit}
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Dashboard