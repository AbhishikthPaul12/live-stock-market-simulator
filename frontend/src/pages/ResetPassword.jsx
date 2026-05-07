import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/auth.js";

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      alert("Password reset successful! Please login with your new password.");
      navigate("/");
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
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Set New Password</h2>
          <p className="text-slate-500 text-sm font-medium mt-2">Create a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-900 font-bold placeholder-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-900 font-bold placeholder-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            ) : "Reset Password"}
          </button>

          <p className="text-center">
            <Link to="/" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
              Cancel
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
