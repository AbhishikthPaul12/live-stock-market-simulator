import { NavLink } from "react-router-dom";

function Navbar() {
  const baseStyle = "px-3 py-1";
  const activeStyle = "bg-white text-black rounded";

  return (
    <div className="bg-black text-white p-4 flex gap-4">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? baseStyle + " " + activeStyle : " "
        }>
        Dashboard
      </NavLink>

      <NavLink
        to="/market"
        className={({ isActive }) =>
          isActive ? baseStyle + " " + activeStyle : " "
        }>
        Market
      </NavLink>

      <NavLink
        to="/portfolio"
        className={({ isActive }) =>
          isActive ? baseStyle + " " + activeStyle : " "
        }>
        Portfolio
      </NavLink>

      <NavLink
        to="/leaderboard"
        className={({ isActive }) =>
          isActive ? baseStyle + " " + activeStyle : " "
        }>
        Leaderboard
      </NavLink>

      <NavLink
        to="/alerts"
        className={({ isActive }) =>
          isActive ? baseStyle + " " + activeStyle : " "
        }>
        Alerts
      </NavLink>

      <NavLink
       to="/transactions"
       className={({ isActive }) =>
          isActive ? baseStyle + " " + activeStyle : " "
        }>
        Transactions</NavLink>

      <NavLink
      to="/watchlist"
      className={({ isActive }) =>
          isActive ? baseStyle + " " + activeStyle : " "
        }>
        Watchlist</NavLink>

    </div>
  );
}

export default Navbar