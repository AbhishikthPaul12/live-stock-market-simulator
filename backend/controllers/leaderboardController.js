import User from "../models/User.js";
import Portfolio from "../models/Portfolio.js";
import { getAllStocks } from "../services/stockService.js";

const INITIAL_BALANCE = 100000;

export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select('name walletBalance realizedProfit');
    const allStocks = await getAllStocks();
    
    // Create a price map for O(1) lookup
    const priceMap = allStocks.reduce((acc, stock) => {
      acc[stock.symbol] = stock.price;
      return acc;
    }, {});

    // Fetch all portfolios in one query
    const allPortfolios = await Portfolio.find({});
    const portfoliosByUser = allPortfolios.reduce((acc, item) => {
      if (!acc[item.user]) acc[item.user] = [];
      acc[item.user].push(item);
      return acc;
    }, {});

    const leaderboard = users.map((user) => {
      const userPortfolio = portfoliosByUser[user._id] || [];
      
      let portfolioValue = 0;
      for (const item of userPortfolio) {
        const price = priceMap[item.symbol] || 0;
        portfolioValue += item.quantity * price;
      }
      
      const totalWealth = user.walletBalance + portfolioValue;
      const profit = totalWealth - INITIAL_BALANCE;

      return {
        name: user.name,
        totalWealth: Number(totalWealth.toFixed(2)),
        walletBalance: Number(user.walletBalance.toFixed(2)),
        portfolioValue: Number(portfolioValue.toFixed(2)),
        profit: Number(profit.toFixed(2))
      };
    });


    leaderboard.sort((a, b) => b.profit - a.profit);
    
    res.json(leaderboard.slice(0, 50));
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: error.message });
  }
};