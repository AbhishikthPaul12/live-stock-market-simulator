import { useEffect, useState } from "react";
import { getStockHistory } from "../api/data.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ChartModal({ stock, onClose, onBuy, onWatchlist }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm border border-gray-200 shadow-2xl w-full max-w-3xl overflow-hidden font-sans text-black">
        <div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gray-50/50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight">{stock.symbol}</h2>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{stock.name}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-2xl font-bold">₹{stock.price.toFixed(2)}</p>
              <p className={`text-sm font-bold ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors text-2xl font-light">&times;</button>
        </div>

        <div className="p-8">
          <div className="h-64 w-full flex items-center justify-center bg-white border border-gray-200 mb-8 p-4">
            {loading ? (
              <div className="h-4 w-4 border border-black border-t-transparent rounded-full animate-spin"></div>
            ) : history.length === 0 ? (
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Data unavailable</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '0px', border: '1px solid #e5e7eb', boxShadow: 'none', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="price" stroke="#000" strokeWidth={2} dot={false} animationDuration={500} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex flex-col w-full md:w-32">
              <label className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Quantity</label>
              <input 
                type="number" 
                min="1" 
                value={qty} 
                onChange={(e) => setQty(Number(e.target.value))}
                className="border border-gray-200 p-3 text-sm font-bold outline-none focus:border-black transition-colors bg-gray-50/50"
              />
            </div>
            
            <div className="flex gap-2 w-full">
              <button
                onClick={() => onBuy(qty)}
                className="flex-1 bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
              >
                Execute Buy
              </button>
              <button
                onClick={() => onWatchlist(stock)}
                className="flex-1 border border-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
              >
                Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
