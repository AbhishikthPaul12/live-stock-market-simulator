import { NavLink, useNavigate } from "react-router-dom";

function Navbar({ setUser }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  const linkStyle = ({ isActive }) =>
    isActive
      ? "bg-white text-black px-3 py-1 rounded"
      : "px-3 py-1";

  return (
    <div className="bg-black text-white px-6 py-3 flex justify-between items-center">
      
      {/* LEFT MENU */}
      <div className="flex gap-4">
        <NavLink to="/dashboard" className={linkStyle}>
          Dashboard
        </NavLink>
        <NavLink to="/dashboard/market" className={linkStyle}>
          Market
        </NavLink>
        <NavLink to="/dashboard/portfolio" className={linkStyle}>
          Portfolio
        </NavLink>
        <NavLink to="/dashboard/transactions" className={linkStyle}>
          Transactions
        </NavLink>
        <NavLink to="/dashboard/watchlist" className={linkStyle}>
          Watchlist
        </NavLink>
        <NavLink to="/dashboard/leaderboard" className={linkStyle}>
          Leaderboard
        </NavLink>
        <NavLink to="/dashboard/alerts" className={linkStyle}>
          Alerts
        </NavLink>
      </div>

      {/* RIGHT */}
      <button
        onClick={logout}
        className="bg-red-500 px-4 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );
}

export default Navbar