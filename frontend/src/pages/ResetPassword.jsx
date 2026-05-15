import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/auth.js";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const { addToast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const email = sessionStorage.getItem("reset_email");
  const otp = sessionStorage.getItem("reset_otp");

  useEffect(() => {
    if (!email || !otp) {
      navigate("/forgot-password");
    }
  }, [email, otp, navigate]);

  async function handleResetPassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 6) {
      addToast("Password must be at least 6 characters", "error");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword });
      addToast("Password reset successful!", "success");
      
      // Cleanup session storage
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_otp");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      addToast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  // Password strength logic (simple)
  const getStrength = () => {
    if (!newPassword) return 0;
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    return strength;
  };

  const strength = getStrength();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6 font-['Inter']">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15V17M12 7V11M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">New Password</h2>
          <p className="text-slate-500 text-sm font-medium mt-3">Enter a strong password to secure your trading account.</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">New Password</label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-900 font-bold placeholder-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            
            {/* Strength indicator */}
            <div className="mt-3 flex gap-1 px-1">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={`h-1.5 flex-grow rounded-full transition-all duration-500 ${
                    i <= strength 
                      ? (strength <= 2 ? "bg-amber-400" : "bg-emerald-500") 
                      : "bg-slate-100"
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 ml-1 font-medium uppercase tracking-wider">
              {strength === 0 ? "Enter password" : strength <= 2 ? "Weak Password" : "Strong Password"}
            </p>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Retype password"
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
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Update Password"}
          </button>

          <p className="text-center">
            <Link to="/" className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
              Cancel & Exit
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
