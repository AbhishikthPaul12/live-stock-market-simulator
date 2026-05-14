import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../context/ToastContext";
import { resetGuestData } from "../api/data";
import AINotifications from "./ai/AINotifications.jsx";

function Navbar({ user, setUser }) {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function logout() {
    // Clear chatbot history for this user to keep it fresh for next session
    if (user) {
      localStorage.removeItem(`ai_chat_history_${user._id || user.id}`);
    }
    
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  async function handleResetGuest() {
    addToast("Resetting demo environment...", "info");
    try {
      await resetGuestData();
      addToast("Demo account reset successfully!", "success");
      // Reload page to refresh all data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      addToast("Failed to reset demo data", "error");
    }
  }

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
      isActive
        ? "bg-slate-900 text-white shadow-lg shadow-slate-200 lg:shadow-none"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", end: true, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { to: "/dashboard/market", label: "Market", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { to: "/dashboard/portfolio", label: "Portfolio", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
    { to: "/dashboard/transactions", label: "Activity", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { to: "/dashboard/watchlist", label: "Watchlist", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg> },
    { to: "/dashboard/leaderboard", label: "Ranking", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
    { to: "/dashboard/alerts", label: "Alerts", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
    { to: "/dashboard/ai-learn", label: "AI Learn", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a2 2 0 01-2.828 0l-.344-.346z" /></svg> },
  ];

  return (
    <>
      <nav className="sticky top-0 z-[60] bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm">
        
        <div className="flex items-center gap-10">
          {/* LOGO */}
          <div className="flex items-center gap-2" onClick={() => navigate("/dashboard")} style={{ cursor: 'pointer' }}>
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase hidden sm:block">STOCK-SIM</span>
            {user?.isGuest && (
              <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border border-amber-200">Demo Mode</span>
            )}
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkStyle}>
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <AINotifications />
            <NavLink to="/dashboard/profile" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors border border-slate-200 overflow-hidden">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </NavLink>
            {user?.isGuest && (
              <button
                onClick={handleResetGuest}
                className="bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
              >
                Reset Demo
              </button>
            )}
            <button
              onClick={logout}
              className="bg-rose-50 text-rose-600 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
            >
              Sign Out
            </button>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 active:scale-90 transition-all"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-[73px] z-50 bg-white lg:hidden overflow-y-auto"
          >
            <div className="p-6 space-y-2">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.to} 
                  to={link.to} 
                  end={link.end} 
                  className={linkStyle}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-active:bg-indigo-600">
                    {link.icon}
                  </div>
                  <span className="text-lg">{link.label}</span>
                </NavLink>
              ))}
              <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-slate-200">
                      <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                      <p className="font-black text-slate-900">Account Profile</p>
                      <p className="text-xs text-slate-500 font-medium tracking-wide">Manage your settings</p>
                    </div>
                  </div>
                  <AINotifications />
                </div>
                {user?.isGuest && (
                  <button
                    onClick={handleResetGuest}
                    className="w-full bg-indigo-50 text-indigo-600 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-indigo-100 active:bg-indigo-600 active:text-white transition-all"
                  >
                    Reset Demo Environment
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="w-full bg-rose-50 text-rose-600 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-rose-100 active:bg-rose-600 active:text-white transition-all"
                >
                  Terminate Session (Sign Out)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;