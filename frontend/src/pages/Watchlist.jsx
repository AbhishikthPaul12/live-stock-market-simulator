import { useState, useEffect } from "react";
import { getWatchlist, removeFromWatchlist } from "../api/data.js";

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchWatchlist() {
    try {
      const data = await getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWatchlist();
  }, []);

  async function removeStock(symbol) {
    try {
      await removeFromWatchlist(symbol);
      setWatchlist(watchlist.filter((item) => item.symbol !== symbol));
    } catch (error) {
      alert("Failed to remove from watchlist");
    }
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Watchlist</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg italic opacity-80">Curated assets for strategic market entry.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="h-12 w-12 border-t-2 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="bg-white border border-slate-200 p-24 rounded-[40px] text-center shadow-sm">
             <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">Watchlist Empty</h3>
             <p className="text-slate-500 max-w-xs mx-auto">Start monitoring stocks by adding them from the market dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {watchlist.map((stock, i) => (
              <div key={i} className="bg-white rounded-[32px] border border-slate-200 p-8 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black overflow-hidden border border-slate-100 mb-6 shadow-sm">
                        <span className="text-slate-400 text-xl">{stock.symbol[0]}</span>
                    </div>
                    <h2 className="font-black text-2xl tracking-tighter text-slate-900 uppercase">{stock.symbol}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 truncate">{stock.name}</p>
                  </div>

                  <div className="mt-10 pt-6 border-t border-slate-50">
                    <button
                      onClick={() => removeStock(stock.symbol)}
                      className="w-full bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete Asset
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;