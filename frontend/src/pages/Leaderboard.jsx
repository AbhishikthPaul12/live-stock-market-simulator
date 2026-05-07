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

  const topThree = users.slice(0, 3);
  const remaining = users.slice(3);

  return (
    <div className="p-6 md:p-10 bg-[#fafbff] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-1 bg-indigo-600 rounded-full"></div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600">Global Rankings</span>
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter">Trader Leaderboard</h1>
          <p className="text-slate-500 mt-4 font-medium text-xl max-w-2xl leading-relaxed">
            Celebrating the most strategic minds in the simulation. Rankings are calculated based on <span className="text-slate-900 font-bold underline decoration-indigo-200 underline-offset-4">Total Net Worth</span> (Wallet + Portfolio).
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="h-16 w-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 p-24 rounded-[40px] text-center">
             <h3 className="text-2xl font-black text-slate-900 mb-2">No Active Rankings</h3>
             <p className="text-slate-500">The market is waiting for its first legend.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Top 3 Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              {/* Silver - Rank 2 */}
              {topThree[1] && (
                <div className="order-2 md:order-1 bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 text-center relative pt-16 group hover:-translate-y-2 transition-transform duration-500">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center border-4 border-white shadow-lg shadow-slate-200 group-hover:rotate-6 transition-transform">
                     <span className="text-4xl">🥈</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">{topThree[1].name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Runner Up</p>
                  <div className="bg-slate-50 rounded-2xl py-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Worth</p>
                    <p className="text-2xl font-black text-slate-900">₹{topThree[1].totalWealth.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}

              {/* Gold - Rank 1 */}
              {topThree[0] && (
                <div className="order-1 md:order-2 bg-indigo-600 p-10 rounded-[50px] shadow-2xl shadow-indigo-200 text-center relative pt-20 group hover:-translate-y-4 transition-transform duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-amber-400 rounded-[40px] flex items-center justify-center border-8 border-indigo-600 shadow-2xl group-hover:scale-110 transition-transform">
                     <span className="text-5xl">🥇</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{topThree[0].name}</h3>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-8">Master Trader</p>
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl py-6">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Net Worth</p>
                    <p className="text-3xl font-black text-white">₹{topThree[0].totalWealth.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}

              {/* Bronze - Rank 3 */}
              {topThree[2] && (
                <div className="order-3 md:order-3 bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 text-center relative pt-16 group hover:-translate-y-2 transition-transform duration-500">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center border-4 border-white shadow-lg shadow-orange-100 group-hover:-rotate-6 transition-transform">
                     <span className="text-4xl">🥉</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">{topThree[2].name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Rising Star</p>
                  <div className="bg-slate-50 rounded-2xl py-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Worth</p>
                    <p className="text-2xl font-black text-slate-900">₹{topThree[2].totalWealth.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* List for 4+ */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Global Standings</h4>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{remaining.length} Traders Following</span>
               </div>
               <div className="divide-y divide-slate-50">
                 {remaining.length > 0 ? remaining.map((user, i) => (
                   <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                      <div className="flex items-center gap-8">
                         <span className="text-2xl font-black text-slate-200 w-8">{i + 4}</span>
                         <div>
                            <p className="text-lg font-black text-slate-900">{user.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Participant</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xl font-black text-emerald-600 tracking-tighter">₹{user.totalWealth.toLocaleString('en-IN')}</p>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Wealth</p>
                      </div>
                   </div>
                 )) : (
                   <div className="p-16 text-center text-slate-400 font-medium">
                      Keep trading to expand the leaderboard.
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;