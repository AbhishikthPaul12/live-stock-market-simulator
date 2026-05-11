import { useMemo } from "react";

/**
 * MiniSparkline — A lightweight SVG sparkline chart.
 * Generates a realistic trend line from the stock's current price and daily change.
 *
 * Props:
 *   price   — current price (number)
 *   change  — daily % change (number, e.g. 2.5 or -1.3)
 *   width   — SVG width  (default 80)
 *   height  — SVG height (default 32)
 *   data    — optional array of price numbers; if omitted, synthetic data is generated
 */
export default function MiniSparkline({ price = 0, change = 0, width = 80, height = 32, data }) {
  const points = useMemo(() => {
    if (data && data.length > 1) return data;

    // Generate 12 synthetic data points that trend toward the current price
    const count = 12;
    const pctMove = (change || 0) / 100;
    const startPrice = price / (1 + pctMove);
    const result = [];

    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1); // 0 → 1
      const trend = startPrice + (price - startPrice) * progress;
      // Add controlled noise (±0.4 % of price) for realism
      const noise = price * 0.004 * (Math.sin(i * 2.7 + price) + Math.cos(i * 1.3));
      result.push(trend + noise);
    }
    return result;
  }, [price, change, data]);

  if (!points || points.length < 2 || price === 0) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const padding = 2;
  const usableW = width - padding * 2;
  const usableH = height - padding * 2;

  const pathPoints = points.map((val, i) => {
    const x = padding + (i / (points.length - 1)) * usableW;
    const y = padding + usableH - ((val - min) / range) * usableH;
    return `${x},${y}`;
  });

  const linePath = `M${pathPoints.join(" L")}`;

  // Gradient fill under the line
  const fillPath = `${linePath} L${padding + usableW},${padding + usableH} L${padding},${padding + usableH} Z`;

  const isPositive = change >= 0;
  const strokeColor = isPositive ? "#10b981" : "#f43f5e";
  const gradientId = `spark-${price}-${change}`.replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
