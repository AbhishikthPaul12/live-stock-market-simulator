// Animated loading skeleton for AI content areas
export default function LoadingSkeleton({ lines = 3, className = "" }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <div
            className="h-3 bg-slate-200 rounded-full"
            style={{ width: `${[85, 70, 55, 90, 65][i % 5]}%` }}
          />
        </div>
      ))}
    </div>
  );
}

// Card-level skeleton for full insight cards
export function CardSkeleton({ className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 animate-pulse ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-slate-200 rounded-xl" />
        <div className="h-4 bg-slate-200 rounded-full w-32" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded-full w-full" />
        <div className="h-3 bg-slate-200 rounded-full w-4/5" />
        <div className="h-3 bg-slate-200 rounded-full w-3/5" />
      </div>
    </div>
  );
}
