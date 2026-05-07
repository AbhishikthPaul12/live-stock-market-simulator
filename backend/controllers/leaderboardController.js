import User from "../models/User.js";
import Portfolio from "../models/Portfolio.js";
import { getStockPrice } from "../services/stockService.js";

export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}).select('name walletBalance');
    
    const leaderboard = await Promise.all(users.map(async (user) => {
      const userPortfolio = await Portfolio.find({ user: user._id });
      
      let portfolioValue = 0;
      for (const item of userPortfolio) {
        const { price } = await getStockPrice(item.symbol);
        portfolioValue += item.quantity * price;
      }
      
      return {
        name: user.name,
        totalWealth: user.walletBalance + portfolioValue,
        walletBalance: user.walletBalance,
        portfolioValue: portfolioValue
      };
    }));

    leaderboard.sort((a, b) => b.totalWealth - a.totalWealth);
    
    res.json(leaderboard.slice(0, 50));
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: error.message });
  }
};