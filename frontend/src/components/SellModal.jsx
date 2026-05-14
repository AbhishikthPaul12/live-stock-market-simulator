import { useState, useEffect } from "react";
import { getRiskAnalysis } from "../api/ai.js";
import { useToast } from "../context/ToastContext";
import RiskBadge from "./ai/RiskBadge.jsx";

function SellModal({ stock, onClose, onConfirm }) {
  const { addToast } = useToast();
  const [qty, setQty] = useState(1);
  const [riskData, setRiskData] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);

  useEffect(() => {
    setQty(1);
    if (stock) {
      setRiskLoading(true);
      setRiskData(null);
      getRiskAnalysis(stock.symbol, stock.currentPrice || stock.buyPrice, 0)
        .then(setRiskData)
        .catch(() => setRiskData({ riskLevel: "Medium", riskScore: 5, reasoning: "Risk data unavailable." }))
        .finally(() => setRiskLoading(false));
    }
  }, [stock]);

  if (!stock || !stock.symbol) return null;

  function handleConfirm() {
    if (!qty || qty <= 0) {
      addToast("Please enter a valid quantity", "error");
      return;
    }
    if (qty > stock.quantity) {
      addToast("You cannot sell more than you own", "error");
      return;
    }
    onConfirm(stock.symbol, stock.currentPrice, qty);
    onClose();
  }

  const proceeds = qty * (stock.currentPrice || stock.buyPrice);
  const currentPrice = stock.currentPrice || stock.buyPrice;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-[100] animate-in fade-in duration-300 px-4">
      <div className="bg-white p-8 rounded-[32px] w-full max-w-sm shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sell {stock.symbol}</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Liquidate Position</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
          <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Assets</span>
            <span className="text-sm font-black text-slate-900">{stock.quantity} Units</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Market Price</span>
            <span className="text-lg font-black text-slate-900">
              {"₹" + currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center text-rose-600">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Estimated Proceeds</span>
            <span className="text-sm font-black">
              {"₹" + proceeds.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
              Quantity to Sell
            </label>
            <div className="flex flex-col gap-3">
              <div className="relative group">
                <button 
                  onClick={() => setQty(prev => Math.max(1, (parseInt(prev) || 0) - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-90 z-10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                </button>

                <input
                  type="number"
                  value={qty}
                  placeholder="Max units owned"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d+$/.test(val)) {
                      const num = parseInt(val) || 0;
                      if (num <= stock.quantity) {
                        setQty(val);
                      } else {
                        setQty(stock.quantity);
                      }
                    }
                  }}
                  onBlur={() => {
                    if (!qty || parseInt(qty) < 1) setQty(1);
                  }}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 px-14 text-center text-slate-900 font-black text-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                />

                <button 
                  onClick={() => setQty(prev => Math.min(stock.quantity, (parseInt(prev) || 0) + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-90 z-10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setQty(stock.quantity)}
                  className="flex-1 py-2 rounded-xl bg-slate-900 text-[9px] font-black text-white uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-slate-100"
                >
                  Sell Max ({stock.quantity})
                </button>
                <button
                  onClick={() => setQty(Math.floor(stock.quantity / 2) || 1)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Half
                </button>
              </div>
            </div>
          </div>

          {/* AI Risk Meter */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Risk Meter</p>
            {riskLoading ? (
              <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ) : riskData ? (
              <RiskBadge level={riskData.riskLevel} score={riskData.riskScore} reasoning={riskData.reasoning} />
            ) : null}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={!qty || parseInt(qty) <= 0}
            onClick={handleConfirm}
            className="flex-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-rose-600 hover:shadow-rose-100 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            Confirm Sell
          </button>
        </div>
      </div>
    </div>
  );
}

export default SellModal;