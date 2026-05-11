import { useState, useEffect } from "react";
import { getAlerts, createAlert, deleteAlert, getAllStocks } from "../api/data.js";
import { useSocket } from "../context/SocketContext.jsx";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ symbol: "", targetPrice: "", type: "ABOVE" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [alertsData, stocksData] = await Promise.all([getAlerts(), getAllStocks()]);
        setAlerts(Array.isArray(alertsData) ? alertsData : []);
        setStocks(stocksData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Use Socket.IO for real-time alert trigger notifications
  const { alertEvents } = useSocket();

  useEffect(() => {
    if (alertEvents.length === 0) return;
    // When a new alert fires, re-fetch alerts to get latest triggered status
    (async () => {
      try {
        const updated = await getAlerts();
        setAlerts(Array.isArray(updated) ? updated : []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [alertEvents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.symbol || !form.targetPrice) return;
    setSubmitting(true);
    try {
      await createAlert(form);
      const updated = await getAlerts();
      setAlerts(updated);
      setForm({ symbol: "", targetPrice: "", type: "ABOVE" });
    } catch (err) {
      alert("Error creating alert");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id);
      setAlerts(alerts.filter(a => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter">Price Alerts</h1>
          <p className="text-slate-500 mt-4 font-medium text-xl italic opacity-80 leading-relaxed max-w-2xl">
            Configure smart triggers to monitor market volatility. We'll notify you the moment your targets are reached.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Create Alert Section */}
          <div className="lg:col-span-1">
             <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-10">
                <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight uppercase">New Monitor</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Stock Symbol</label>
                      <select 
                        value={form.symbol}
                        onChange={(e) => setForm({...form, symbol: e.target.value})}
                        className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-black focus:ring-2 focus:ring-indigo-600 outline-none"
                      >
                         <option value="">Select Asset</option>
                         {stocks.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Target Price (₹)</label>
                      <input 
                        type="number"
                        placeholder="0.00"
                        value={form.targetPrice}
                        onChange={(e) => setForm({...form, targetPrice: e.target.value})}
                        className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-black focus:ring-2 focus:ring-indigo-600 outline-none"
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Condition</label>
                      <div className="grid grid-cols-2 gap-4">
                         <button 
                            type="button"
                            onClick={() => setForm({...form, type: 'ABOVE'})}
                            className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${form.type === 'ABOVE' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400'}`}
                         >
                            Above
                         </button>
                         <button 
                            type="button"
                            onClick={() => setForm({...form, type: 'BELOW'})}
                            className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${form.type === 'BELOW' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-slate-50 text-slate-400'}`}
                         >
                            Below
                         </button>
                      </div>
                   </div>
                   <button 
                      disabled={submitting}
                      className="w-full bg-slate-900 text-white p-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all disabled:opacity-50 mt-4"
                   >
                      {submitting ? 'Activating...' : 'Activate Alert'}
                   </button>
                </form>
             </div>
          </div>

          {/* Alerts List */}
          <div className="lg:col-span-2 space-y-12">
             {/* Active Alerts */}
             <section>
                <div className="flex items-center gap-4 mb-8">
                   <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Monitors</h2>
                   <div className="flex-1 h-px bg-slate-200"></div>
                   <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black">{activeAlerts.length}</span>
                </div>
                
                {activeAlerts.length === 0 ? (
                  <p className="text-slate-400 font-medium italic">No active monitors running...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeAlerts.map((alert) => (
                      <div key={alert._id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative group overflow-hidden">
                        <div className={`absolute top-0 right-0 w-2 h-full ${alert.type === 'ABOVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <p className="text-2xl font-black text-slate-900">{alert.symbol}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Asset</p>
                           </div>
                           <button 
                              onClick={() => handleDelete(alert._id)}
                              className="text-slate-200 hover:text-rose-500 transition-colors"
                           >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between items-end">
                              <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trigger Price</p>
                                 <p className="text-xl font-black text-slate-900">₹{alert.targetPrice.toLocaleString()}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${alert.type === 'ABOVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {alert.type}
                              </span>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </section>

             {/* Triggered Alerts */}
             <section>
                <div className="flex items-center gap-4 mb-8">
                   <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Trigger History</h2>
                   <div className="flex-1 h-px bg-slate-100"></div>
                </div>
                
                <div className="space-y-4">
                   {triggeredAlerts.length === 0 ? (
                     <p className="text-slate-300 font-medium italic text-sm">Historical records will appear here.</p>
                   ) : (
                     triggeredAlerts.map((alert) => (
                        <div key={alert._id} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between group">
                           <div className="flex items-center gap-6">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${alert.type === 'ABOVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                              </div>
                              <div>
                                 <p className="text-slate-900 font-black tracking-tight">{alert.symbol} reached {alert.type} target of ₹{alert.targetPrice.toLocaleString()}</p>
                                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(alert.updatedAt).toLocaleString()}</p>
                              </div>
                           </div>
                           <button onClick={() => handleDelete(alert._id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">Clear</button>
                        </div>
                     ))
                   )}
                </div>
             </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;