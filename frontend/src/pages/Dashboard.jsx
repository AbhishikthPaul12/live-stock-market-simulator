import { useContext } from "react"
import { AppContext } from "../contexts/AppContext"
import PortfolioChart from "../components/PortfolioChart"

function Dashboard() {
  const { balance, portfolio } = useContext(AppContext);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Balance</p>
          <p className="text-2xl font-bold">₹{balance}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Stocks</p>
          <p className="text-2xl font-bold">
            {portfolio.length}
          </p>
        </div>
      </div>

      {/* CHART */}
      <div className="mt-6">
        <PortfolioChart portfolio={portfolio} />
      </div>
    </div>
  );
}

export default Dashboard