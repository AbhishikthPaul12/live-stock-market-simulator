function Alerts() {
  const alerts = [
    { message: "TCS crossed ₹4,000.00", type: "success", time: "2m ago" },
    { message: "INFY dropped below ₹1,500.00", type: "error", time: "15m ago" },
    { message: "RELIANCE showing strong bullish momentum", type: "info", time: "1h ago" }
  ];

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Notifications</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg italic opacity-80">Real-time market triggers and account activity.</p>
        </header>

        <div className="space-y-6">
          {alerts.map((alert, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-start gap-6 hover:shadow-xl transition-all group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
                alert.type === 'success' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 
                alert.type === 'error' ? 'bg-rose-50 text-rose-500 border-rose-100' : 
                'bg-indigo-50 text-indigo-500 border-indigo-100'
              }`}>
                {alert.type === 'success' ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                ) : alert.type === 'error' ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    alert.type === 'success' ? 'text-emerald-500' : 
                    alert.type === 'error' ? 'text-rose-500' : 
                    'text-indigo-500'
                  }`}>{alert.type} Signal</span>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{alert.time}</span>
                </div>
                <p className="text-slate-900 font-black text-xl tracking-tight leading-tight">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">End of Transmission</p>
        </div>
      </div>
    </div>
  );
}

export default Alerts;