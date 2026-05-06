import { useEffect, useState } from "react";
import { getStockHistory } from "../api/data.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ChartModal({ stock, onClose, onBuy, onWatchlist }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stock) return;
    
    async function fetchHistory() {
      setLoading(true);
      const data = await getStockHistory(stock.symbol);
      setHistory(data);
      setLoading(false);
    }
    
    fetchHistory();
  }, [stock]);

  if (!stock) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {stock.logo && <img src={stock.logo} alt={stock.symbol} className="w-12 h-12 rounded-full" />}
            <div>
              <h2 className="text-3xl font-bold">{stock.name} ({stock.symbol})</h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-2xl font-bold">₹{stock.price || 0}</p>
                <p className={`font-bold text-lg ${stock.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {stock.change > 0 ? '+' : ''}{stock.change || 0}
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black font-bold text-3xl">&times;</button>
        </div>

        <div className="h-80 w-full flex items-center justify-center bg-gray-50 rounded mb-6 border">
          {loading ? (
            <p className="text-gray-500 font-medium">Loading precise market data...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500 font-medium">No historical data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis domain={['auto', 'auto']} tick={{fontSize: 12}} />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => onBuy(stock)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg shadow transition-colors font-bold text-lg"
          >
            Buy {stock.symbol}
          </button>
          <button
            onClick={() => onWatchlist(stock)}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black py-4 rounded-lg shadow transition-colors font-bold text-lg"
          >
            Add to Watchlist
          </button>
        </div>
      </div>
    </div>
  );
}
