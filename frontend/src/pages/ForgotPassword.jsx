import { useState } from "react";
import { forgotPassword } from "../api/auth.js";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState(""); // For simulation

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Reset Password</h2>
          <p className="text-slate-500 text-sm font-medium mt-2">Enter your email to receive a reset token.</p>
        </div>

        {message ? (
          <div className="text-center">
            <div className="mb-8 p-6 bg-emerald-50 text-emerald-700 rounded-3xl border border-emerald-100">
              <p className="font-bold mb-2">{message}</p>
              {resetToken && (
                <div className="mt-4 p-4 bg-white rounded-2xl border border-emerald-200">
                  <p className="text-[10px] uppercase font-black tracking-widest text-emerald-400 mb-1">Your Reset Token (Simulated)</p>
                  <p className="text-2xl font-black tracking-widest">{resetToken}</p>
                </div>
              )}
            </div>
            <Link 
              to={`/reset-password/${resetToken}`} 
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all block"
            >
              Go to Reset Page
            </Link>
            <p className="mt-8">
              <Link to="/" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                Back to Login
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-900 font-bold placeholder-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : "Send Token"}
            </button>

            <p className="text-center">
              <Link to="/" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                Cancel
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
