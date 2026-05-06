import { useEffect, useState } from "react";
import { getTransactions } from "../api/data.js";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch = txn.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "ALL" || txn.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Transactions</h1>
            <p className="text-slate-500 mt-1 font-medium">Track your trading history and performance.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search symbol..."
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-3 h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              {["ALL", "BUY", "SELL"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    filterType === type
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50">
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-widest">Date & Time</th>
                    <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-widest">Asset</th>
                    <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-widest">Type</th>
                    <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-widest text-right">Quantity</th>
                    <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-widest text-right">Price</th>
                    <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTransactions.map((txn, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="p-4 text-sm font-medium text-slate-600">
                        {new Date(txn.createdAt).toLocaleDateString()}
                        <span className="block text-xs text-slate-400 font-normal mt-0.5">
                          {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-700 border border-slate-200 text-sm">
                            {txn.symbol[0]}
                          </div>
                          <span className="font-extrabold text-slate-900 tracking-tight">{txn.symbol}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${
                            txn.type === "BUY"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-700">{txn.quantity}</td>
                      <td className="p-4 text-right text-slate-600 font-mono text-sm">
                        ₹{parseFloat(txn.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right font-black text-slate-900 font-mono">
                        ₹{(txn.quantity * txn.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-24 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                <svg
                  className="w-12 h-12 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No transactions found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your filters or search term to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transactions;