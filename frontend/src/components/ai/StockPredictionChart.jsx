import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

function generateProjection(basePrice, trend = "bullish", points = 14) {
  const data = [];
  const multiplier = trend === "bullish" ? 1.008 : trend === "bearish" ? 0.993 : 1.001;
  let price = basePrice;

  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.5) * basePrice * 0.015;
    price = price * multiplier + noise;
    data.push({
      day: `Day ${i + 1}`,
      projected: parseFloat(price.toFixed(2)),
    });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs font-bold text-slate-500">{label}</p>
        <p className="text-sm font-black text-indigo-600">₹{payload[0]?.value?.toLocaleString("en-IN")}</p>
      </div>
    );
  }
  return null;
};

export default function StockPredictionChart({ symbol, currentPrice, trend = "neutral", confidence = 72 }) {
  const projectionData = generateProjection(currentPrice || 1000, trend);

  const trendConfig = {
    bullish: { color: "#10b981", label: "Bullish", icon: "↗", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    bearish: { color: "#f43f5e", label: "Bearish", icon: "↘", badge: "bg-rose-50 text-rose-700 border-rose-200" },
    neutral: { color: "#6366f1", label: "Neutral", icon: "→", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  };

  const cfg = trendConfig[trend] || trendConfig.neutral;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black text-indigo-700 uppercase tracking-widest">AI Trend Forecast</p>
            <p className="text-[10px] text-slate-400 font-medium">{symbol} · 14-day projection</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${cfg.badge}`}>
            {cfg.icon} {cfg.label}
          </span>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence</span>
            <span className="text-[10px] font-black text-indigo-600">{confidence}%</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={projectionData}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={currentPrice}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              label={{ value: "Current", fontSize: 10, fill: "#94a3b8" }}
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke={cfg.color}
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 5, fill: cfg.color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Disclaimer */}
      <div className="mx-5 mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
        <svg className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
          Predictions are AI-generated simulations and not financial advice. For educational purposes only.
        </p>
      </div>
    </div>
  );
}
