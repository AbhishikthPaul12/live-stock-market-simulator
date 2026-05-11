import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import RootLayout from "./RootLayout";
import Dashboard from "./pages/Dashboard";
import Market from "./pages/Market";
import Portfolio from "./pages/Portfolio";
import Leaderboard from "./pages/Leaderboard";
import Alerts from "./pages/Alerts";
import Transactions from "./pages/Transactions";
import Watchlist from "./pages/Watchlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AILearn from "./pages/AILearn";

import { ToastProvider } from "./context/ToastContext";
import { SocketProvider } from "./context/SocketContext";

function App() {
  const [user, setUser] = useState(null);

  // Load user on app start
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  return (
    <SocketProvider>
    <ToastProvider>
      <Router>
        <Routes>
          {/* ... existing routes ... */}
          {/* (I'll keep the logic inside unchanged, just wrapping) */}
          <Route
            path="/"
            element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/dashboard" />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token?" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={user ? <RootLayout setUser={setUser} /> : <Navigate to="/" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="market" element={<Market />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="profile" element={<Profile />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="ai-learn" element={<AILearn />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
    </SocketProvider>
  );
}

export default App