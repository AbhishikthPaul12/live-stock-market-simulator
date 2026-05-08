import { useState, useEffect, useCallback } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { getAllStocks, getStockHistory } from "../api/data.js";
import { getStockInsight } from "../api/ai.js";
import StockPredictionChart from "../components/ai/StockPredictionChart.jsx";

export default function Analytics() {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const allStocks = await getAllStocks();
        setStocks(allStocks);
        if (allStocks.length > 0) {
          setSelectedStock(allStocks[0]);
        }
      } catch (err) {
        console.error("Error fetching stocks:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  const fetchHistory = useCallback(async (symbol, range) => {
    setChartLoading(true);
    try {
      const history = await getStockHistory(symbol, range);
      const formatted = history.map((h, i) => ({
        ...h,
        showOnAxis:
          range === '1D' ? i % 4 === 0 :
          range === '1W' ? true :
          range === '1M' ? i % 5 === 0 :
          range === '3M' ? i % 15 === 0 :
          range === '6M' ? i % 30 === 0 :
          range === '1YR' ? i % 8 === 0 :
          i % 12 === 0
      }));
      setChartData(formatted);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedStock) {
      fetchHistory(selectedStock.symbol, selectedRange);
    }
  }, [selectedStock, selectedRange, fetchHistory]);

  useEffect(() => {
    if (selectedRange === '1D' && selectedStock) {
      const interval = setInterval(() => {
        fetchHistory(selectedStock.symbol, '1D');
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedRange, selectedStock, fetchHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Live Analytics</h1>
            <p className="text-slate-500 mt-2 font-medium text-lg italic opacity-80">
              Streaming real-market data · {selectedStock?.name || 'Indian Markets'}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">NSE Live Feed</span>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-3 bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative group overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner overflow-hidden">
                  {selectedStock?.logo ? (
                    <img src={selectedStock.logo} alt={selectedStock.symbol} className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-2xl font-black text-slate-300">{selectedStock?.symbol?.[0]}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedStock?.symbol?.replace('.NS', '')}</h2>
                  <p className="text-emerald-600 font-black text-xl font-mono tracking-tight">
                    ₹{selectedStock?.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-2xl">
                {['1D', '1W', '1M', '3M', '6M', '1YR', '3YRS'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedRange === range ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-900'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[450px] w-full relative">
              {chartLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <div className="h-10 w-10 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                    interval={0}
                    tickFormatter={(value, index) => chartData[index]?.showOnAxis ? value : ''}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    width={90}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px 24px' }}
                    itemStyle={{ fontWeight: 900, color: '#4f46e5', fontSize: '18px' }}
                    labelStyle={{ fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Price']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#4f46e5"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    animationDuration={1500}
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm flex flex-col h-[650px]">
              <h3 className="text-sm font-black text-slate-900 mb-6 tracking-widest uppercase">NSE Explorer</h3>
              <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {stocks.map(s => (
                  <div
                    key={s.symbol}
                    onClick={() => setSelectedStock(s)}
                    className={`flex justify-between items-center p-4 rounded-2xl cursor-pointer transition-all ${selectedStock?.symbol === s.symbol ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black overflow-hidden ${selectedStock?.symbol === s.symbol ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                        {s.logo ? (
                          <img src={s.logo} alt={s.symbol} className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-sm">{s.symbol[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{s.symbol.replace('.NS', '')}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[80px]">{s.name.split(' ')[0]}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">₹{s.price.toFixed(2)}</p>
                      <p className={`text-[10px] font-black ${s.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {s.change >= 0 ? '▲' : '▼'} {Math.abs(s.change).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Indian Market Index Overview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: 'Nifty 50', value: '24,346.70', change: '+0.42%', positive: true },
            { name: 'BSE Sensex', value: '80,218.37', change: '+0.38%', positive: true },
            { name: 'Bank Nifty', value: '52,341.80', change: '-0.15%', positive: false },
            { name: 'Nifty IT', value: '36,824.15', change: '+1.07%', positive: true }
          ].map(index => (
            <div key={index.name} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex justify-between items-center hover:shadow-xl transition-all">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{index.name}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">{index.value}</p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${index.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {index.change}
              </span>
            </div>
          ))}
        </div>

        {/* AI PREDICTION VISUALIZATION */}
        {selectedStock && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">AI Trend Forecast</h2>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                Gemini Powered
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <StockPredictionChart
              symbol={selectedStock.symbol?.replace('.NS', '')}
              currentPrice={selectedStock.price}
              trend={selectedStock.change >= 0.5 ? 'bullish' : selectedStock.change <= -0.5 ? 'bearish' : 'neutral'}
              confidence={Math.min(95, Math.max(60, Math.round(72 + Math.abs(selectedStock.change || 0) * 2)))}
            />
          </div>
        )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
      </div>
    </div>
  );
}
