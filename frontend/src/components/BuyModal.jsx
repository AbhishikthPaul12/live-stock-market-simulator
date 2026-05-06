import { useState, useEffect } from "react"

function BuyModal({ stock, onClose, onConfirm }) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [stock]);

  if (!stock) return null;

  function handleConfirm() {
    if (!qty || qty <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    onConfirm(stock.symbol, qty);
    onClose();
  }

  const totalCost = qty * stock.price;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-[100] animate-in fade-in duration-300 px-4">
      <div className="bg-white p-8 rounded-[32px] w-full max-w-sm shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start mb-6">
          <div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Buy {stock.symbol}</h2>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Execute Market Order</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Market Price</span>
            <span className="text-lg font-black text-slate-900">₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-600">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Estimated Total</span>
            <span className="text-sm font-black">₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Quantity to Purchase</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-slate-900 font-black text-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              min="1"
            />
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
            onClick={handleConfirm}
            className="flex-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            Confirm Buy
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuyModal;