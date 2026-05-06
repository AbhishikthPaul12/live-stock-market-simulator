import Portfolio from "../models/Portfolio.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { getStockPrice } from "../services/stockService.js";

// BUY STOCK
export const buyStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user._id;

    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid symbol or quantity" });
    }

    // Fetch REAL price securely from Finnhub
    const { price } = await getStockPrice(symbol);
    console.log("API Response:", { price });

    if (!price || price <= 0) {
      return res.status(400).json({ message: "Invalid stock price from market" });
    }

    const totalCost = price * quantity;
    const user = await User.findById(userId);

    if (user.walletBalance < totalCost) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Update wallet
    user.walletBalance -= totalCost;
    await user.save();

    // Check if stock exists in portfolio
    let stock = await Portfolio.findOne({ user: userId, symbol });

    if (stock) {
      // Calculate weighted average buy price
      const totalQuantity = stock.quantity + quantity;
      const weightedAvgPrice = ((stock.buyPrice * stock.quantity) + (price * quantity)) / totalQuantity;
      
      stock.quantity = totalQuantity;
      stock.buyPrice = weightedAvgPrice;
      await stock.save();
    } else {
      stock = await Portfolio.create({
        user: userId,
        symbol,
        quantity,
        buyPrice: price
      });
    }

    // Record transaction using real price
    await Transaction.create({
      user: userId,
      type: "BUY",
      symbol,
      quantity,
      price
    });

    res.json({ message: "Stock purchased successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// SELL STOCK
export const sellStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user._id;

    // Fetch REAL price securely
    const { price } = await getStockPrice(symbol);
    if (!price || price <= 0) {
      return res.status(400).json({ message: "Invalid stock price from market" });
    }

    const stock = await Portfolio.findOne({ user: userId, symbol });

    if (!stock || stock.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    // Calculate profit before potential deletion
    const profit = (Number(price) - Number(stock.buyPrice)) * Number(quantity);

    // Update portfolio
    stock.quantity -= Number(quantity);

    if (stock.quantity === 0) {
      await stock.deleteOne();
    } else {
      await stock.save();
    }

    // Update wallet and realized profit
    const user = await User.findById(userId);
    user.walletBalance += Number(price) * Number(quantity);
    user.realizedProfit = (user.realizedProfit || 0) + profit;
    await user.save();

    // Record transaction
    await Transaction.create({
      user: userId,
      type: "SELL",
      symbol,
      quantity: Number(quantity),
      price: Number(price)
    });

    res.json({ 
      message: "Stock sold successfully", 
      walletBalance: user.walletBalance,
      realizedProfit: user.realizedProfit
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};