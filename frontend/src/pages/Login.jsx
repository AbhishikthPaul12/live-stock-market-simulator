import { useState } from "react"
import { loginUser, guestLogin } from "../api/auth.js"
import { useNavigate, Link } from "react-router-dom"
import { useToast } from "../context/ToastContext"

function Login({ setUser }) {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    
    // Client-side validation
    if (password.length < 6) {
      addToast("Password must be at least 6 characters long.", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      setUser(data);
      addToast("Successfully logged in!", "success");
      navigate("/dashboard");
    } catch (error) {
      addToast(error.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestLogin() {
    setLoading(true);
    try {
      const data = await guestLogin();
      setUser(data);
      addToast("Welcome! You are exploring in Guest Mode.", "info");
      navigate("/dashboard");
    } catch (error) {
      addToast("Guest access unavailable", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Welcome back</h2>
          <p className="text-slate-400 text-sm font-medium mt-2">Access your institutional trading terminal.</p>
        </div>

        {/* Instant Demo Access (Primary for Resume) */}
        <div className="mb-8">
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 flex flex-col items-center justify-center gap-1 group"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Launch Instant Demo</span>
            </div>
            <span className="text-[9px] opacity-60 font-medium normal-case tracking-normal">No registration required · One-click entry</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-8">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">OR LOGIN TO ACCOUNT</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Email</label>
            <input
              type="email"
              placeholder="user@example.com"
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-900 font-bold placeholder-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-900 font-bold placeholder-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Sign In"}
          </button>
        </form>

        <p className="text-xs font-bold text-slate-400 mt-10 text-center uppercase tracking-widest">
          New to the platform?{" "}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-800 transition-colors ml-1">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
