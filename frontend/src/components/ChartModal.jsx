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
      try {
        const data = await getStockHistory(stock.symbol);
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchHistory();
  }, [stock?.symbol]);

  useEffect(() => {
    if (stock && stock.price && history.length > 0) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      
      setHistory(prev => {
        const lastPoint = prev[prev.length - 1];
        // If price changed or its a new minute, update/append
        if (lastPoint.price !== stock.price || lastPoint.date !== timeStr) {
           const newPoint = {
             date: timeStr,
             price: stock.price,
             timestamp: Date.now()
           };
           
           if (lastPoint.date === timeStr) {
             const updated = [...prev];
             updated[updated.length - 1] = newPoint;
             return updated;
           }
           return [...prev, newPoint];
        }
        return prev;
      });
    }
  }, [stock?.price]);

  if (!stock) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-10 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center p-3">
               {stock.logo ? (
                 <img src={stock.logo} alt={stock.symbol} className="w-full h-full object-contain" />
               ) : (
                 <span className="text-2xl font-black text-slate-300">{stock.symbol[0]}</span>
               )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{stock.symbol}</h2>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{stock.name}</span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <p className={`text-sm font-black px-2 py-0.5 rounded-lg border ${stock.change >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-10">
          <div className="h-80 w-full bg-white rounded-3xl border border-slate-100 mb-10 p-6 shadow-inner overflow-hidden relative group">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                <p className="text-[10px] uppercase font-black tracking-widest">History data currently unavailable</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="price" stroke="#4f46e5" strokeWidth={3} dot={false} animationDuration={1000} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-end">
            <div className="flex flex-col w-full lg:w-64">
              <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Quantity</label>
              <div className="flex flex-col gap-3">
                <div className="relative group">
                  <button 
                    onClick={() => setQty(prev => Math.max(1, (parseInt(prev) || 0) - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90 z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                  </button>
                  
                  <input 
                    type="number" 
                    value={qty} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d+$/.test(val)) {
                        setQty(val);
                      }
                    }}
                    onBlur={() => {
                      if (!qty || parseInt(qty) < 1) setQty(1);
                    }}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 px-14 text-center text-slate-900 font-black text-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  />

                  <button 
                    onClick={() => setQty(prev => (parseInt(prev) || 0) + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90 z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
                
                <div className="flex gap-2">
                  {[10, 50, 100].map(preset => (
                    <button
                      key={preset}
                      onClick={() => setQty(prev => (parseInt(prev) || 0) + preset)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 w-full">
              <button
                disabled={!qty || parseInt(qty) <= 0}
                onClick={() => onBuy(parseInt(qty))}
                className="flex-1 bg-indigo-600 text-white py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5 disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Confirm Purchase
                </div>
                <span className="text-[9px] opacity-60">Total: ₹{((parseInt(qty) || 0) * stock.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </button>
              <button
                onClick={() => onWatchlist(stock)}
                className="flex-1 bg-white border border-slate-200 text-slate-500 py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                Save to Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );}
