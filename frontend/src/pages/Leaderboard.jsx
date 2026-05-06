import { useEffect, useState } from "react"
import { getLeaderboard } from "../api/data.js"

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getLeaderboard();
        if (Array.isArray(res)) {
          setUsers(res);
        } else if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.log("Leaderboard error:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Leaderboard</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg italic opacity-80">Ranking the top performing traders in the ecosystem.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="h-12 w-12 border-t-2 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white border border-slate-200 p-24 rounded-[40px] text-center shadow-sm">
             <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">No Rankings Yet</h3>
             <p className="text-slate-500 max-w-xs mx-auto">Be the first to climb the rankings by executing profitable trades.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user, i) => {
              const isTopThree = i < 3;
              const rankColors = [
                'bg-amber-100 text-amber-700 border-amber-200',
                'bg-slate-200 text-slate-700 border-slate-300',
                'bg-orange-100 text-orange-700 border-orange-200'
              ];

              return (
                <div
                  key={i}
                  className={`bg-white rounded-3xl border p-6 flex justify-between items-center transition-all hover:shadow-xl hover:-translate-y-0.5 group ${isTopThree ? 'border-indigo-100 shadow-lg shadow-indigo-100/20' : 'border-slate-100 shadow-sm'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border-2 transition-transform group-hover:scale-110 ${isTopThree ? rankColors[i] : 'bg-slate-50 text-slate-400 border-slate-50'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <span className={`font-black text-xl tracking-tight block ${isTopThree ? 'text-slate-900' : 'text-slate-600'}`}>
                        {user.name || "Anonymous Trader"}
                      </span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Participant</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Portfolio Value</span>
                    <span className="font-black text-2xl text-emerald-600 font-mono tracking-tighter">
                      ₹{(user.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;