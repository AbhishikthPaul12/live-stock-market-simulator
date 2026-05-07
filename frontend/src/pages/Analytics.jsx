import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { getAllStocks } from "../api/data.js";

export default function Analytics() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('1W');
  const [marketTrend, setMarketTrend] = useState([]);

  const generateData = (range) => {
    let count = 7;
    let labels = [];
    let volatility = 500;
    
    switch (range) {
      case '1D':
        count = 24;
        volatility = 150;
        labels = Array.from({ length: 24 }, (_, i) => ({
          fullLabel: `${i}:00`,
          showOnAxis: i % 6 === 0
        }));
        break;
      case '1W':
        count = 7;
        volatility = 600;
        const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        labels = weekDays.map(d => ({ fullLabel: d, showOnAxis: true }));
        break;
      case '1M':
        count = 30;
        volatility = 800;
        labels = Array.from({ length: 30 }, (_, i) => ({
          fullLabel: `Day ${i + 1}`,
          showOnAxis: i % 5 === 0
        }));
        break;
      case '3M':
        count = 90;
        volatility = 1200;
        const now3M = new Date();
        labels = Array.from({ length: 90 }, (_, i) => {
          const d = new Date(now3M);
          d.setDate(now3M.getDate() - (89 - i));
          const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          return {
            fullLabel: label,
            showOnAxis: i % 15 === 0
          };
        });
        break;
      case '6M':
        count = 180;
        volatility = 1800;
        const now6M = new Date();
        labels = Array.from({ length: 180 }, (_, i) => {
          const d = new Date(now6M);
          d.setDate(now6M.getDate() - (179 - i));
          const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          return {
            fullLabel: label,
            showOnAxis: i % 30 === 0
          };
        });
        break;
      case '1YR':
        count = 12;
        volatility = 2500;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        labels = months.map(m => ({ fullLabel: m, showOnAxis: true }));
        break;
      case '3YRS':
        count = 36;
        volatility = 4000;
        const currentYear = new Date().getFullYear();
        labels = Array.from({ length: 36 }, (_, i) => {
          let label = `Q${(i/3)%4 + 1} ${currentYear - 2 + Math.floor(i/12)}`;
          let show = i % 12 === 0;
          return { fullLabel: label, showOnAxis: show };
        });
        break;
        break;
      default:
        count = 7;
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        labels = days.map(d => ({ fullLabel: d, showOnAxis: true }));
    }

    let baseValue = 3500 + Math.random() * 2000;
    return Array.from({ length: count }, (_, i) => {
      baseValue += (Math.random() - 0.48) * (volatility / count * 5);
      return { 
        name: labels[i].fullLabel, 
        value: Math.max(1000, Math.floor(baseValue)),
        showOnAxis: labels[i].showOnAxis
      };
    });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllStocks();
        setStocks(data);
        setMarketTrend(generateData('1W'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleRangeChange = (range) => {
    setSelectedRange(range);
    setMarketTrend(generateData(range));
  };

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
        <header className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Market Analytics</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Deep insights into global asset performance and volatility.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Market Pulse</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Global Composite Index</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['1D', '1W', '1M', '3M', '6M', '1YR', '3YRS'].map((range) => (
                  <button 
                    key={range}
                    onClick={() => handleRangeChange(range)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedRange === range ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketTrend}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                    dy={10}
                    interval={0}
                    minTickGap={10}
                    tickFormatter={(value, index) => {
                      const dataPoint = marketTrend[index];
                      return dataPoint && dataPoint.showOnAxis ? value : '';
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                    tickFormatter={(value) => `₹${value}`}
                    width={80}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 20px' }}
                    itemStyle={{ fontWeight: 800, color: '#4f46e5' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Price']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4f46e5" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={1000}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Info */}
          <div className="space-y-8">
            <div className="bg-indigo-900 rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-800 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
               <div className="relative z-10">
                 <h3 className="text-xl font-black mb-4 tracking-tight">AI Prediction</h3>
                 <p className="text-indigo-200 text-sm font-medium leading-relaxed mb-8">
                   Our neural models suggest a <span className="text-white font-black">78% probability</span> of upward momentum in the next 48 hours for tech assets.
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                       <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Confidence Level</p>
                       <p className="text-lg font-black">Institutional Grade</p>
                    </div>
                 </div>
               </div>
            </div>

            <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm">
               <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Top Movers</h3>
               <div className="space-y-6">
                 {stocks.slice(0, 4).map(s => (
                   <div key={s.symbol} className="flex justify-between items-center group cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {s.symbol[0]}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900">{s.symbol}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.name}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black text-slate-900">₹{s.price.toFixed(2)}</p>
                         <p className={`text-[10px] font-black ${s.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {s.change >= 0 ? '+' : ''}{s.change}%
                         </p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Sectors */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { name: 'Technology', value: '+2.4%', color: 'bg-indigo-50 text-indigo-600' },
             { name: 'Finance', value: '-0.8%', color: 'bg-rose-50 text-rose-600' },
             { name: 'Energy', value: '+1.2%', color: 'bg-amber-50 text-amber-600' },
             { name: 'Healthcare', value: '+0.5%', color: 'bg-emerald-50 text-emerald-600' }
           ].map(sector => (
             <div key={sector.name} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{sector.name}</p>
                <div className="flex items-end justify-between">
                   <p className="text-3xl font-black text-slate-900 tracking-tighter">Index</p>
                   <span className={`px-3 py-1 rounded-lg text-xs font-black ${sector.color}`}>{sector.value}</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
