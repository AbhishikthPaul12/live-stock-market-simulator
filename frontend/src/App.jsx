import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import RootLayout from "./RootLayout"
import Dashboard from "./pages/Dashboard"
import Market from "./pages/Market"
import Portfolio from "./pages/Portfolio"
import Leaderboard from "./pages/Leaderboard"
import Alerts from "./pages/Alerts"
import Transactions from "./pages/Transactions"   
import Watchlist from "./pages/Watchlist";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="market" element={<Market />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App