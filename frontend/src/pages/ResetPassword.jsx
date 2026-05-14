import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { verifyResetToken, resetPassword } from "../api/auth.js";
import { useToast } from "../context/ToastContext";

export default function ResetPassword() {
  const { addToast } = useToast();
  const { token: urlToken } = useParams();
  const [tokenInput, setTokenInput] = useState(urlToken || "");
  const [tokenVerified, setTokenVerified] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleVerifyToken(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyResetToken(tokenInput);
      setTokenVerified(true);
      setVerifiedToken(tokenInput);
      addToast("Token verified successfully", "success");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token");
      addToast(err.response?.data?.message || "Invalid or expired token", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetPassword({ token: verifiedToken, newPassword });
      // Clear any stale user data so the app redirects to login, not dashboard
      localStorage.removeItem("user");
      addToast("Password reset successful! Please login with your new password.", "success");
      // Force a full page reload to reset App state and show the login page
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      addToast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            {tokenVerified ? "Set New Password" : "Verify Token"}
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-2">
            {tokenVerified
              ? "Create a strong password for your account."
              : "Enter your reset token to continue."}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
            !tokenVerified
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
              : "bg-emerald-100 text-emerald-600"
          }`}>
            {tokenVerified ? "✓" : "1"}
            <span>Verify</span>
          </div>
          <div className="w-6 h-0.5 bg-slate-200"></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
            tokenVerified
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
              : "bg-slate-100 text-slate-400"
          }`}>
            2
            <span>Reset</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold text-center">
            {error}
          </div>
        )}

        {!tokenVerified ? (
          /* STEP 1: Token Verification */
          <form onSubmit={handleVerifyToken} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                Reset Token
              </label>
              <input
                type="text"
                placeholder="8-CHAR CODE (e.g. ABC123XY)"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-900 font-bold placeholder-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none tracking-[0.2em] text-center text-xl uppercase"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                required
                maxLength={8}
                autoFocus
              />
              <p className="text-[10px] text-slate-400 mt-2 ml-1 font-medium">
                Enter the token you received on the previous page.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !tokenInput.trim()}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : "Verify Token"}
            </button>

            <p className="text-center">
              <Link to="/forgot-password" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                ← Back
              </Link>
            </p>
          </form>
        ) : (
          /* STEP 2: New Password */
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Token verified badge */}
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-center">
              <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500">Token Verified</p>
              <p className="text-sm font-bold mt-1 tracking-widest">{verifiedToken}</p>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">New Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-900 font-bold placeholder-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoFocus
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Retype password"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-900 font-bold placeholder-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
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
        )}
      </div>
    </div>
  );
}
