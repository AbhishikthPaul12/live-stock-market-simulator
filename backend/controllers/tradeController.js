import Portfolio from "../models/Portfolio.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { getStockPrice } from "../services/stockService.js";

// BUY STOCK
export const buyStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user._id;

    console.log(`[BUY] Attempting purchase for user ${userId}: ${quantity} shares of ${symbol}`);

    if (!symbol || isNaN(quantity) || Number(quantity) <= 0) {
      return res.status(400).json({ message: "Invalid symbol or quantity" });
    }

    // Fetch current price from the simulation engine
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
      // Calculate weighted average buy price with NaN safety
      const oldQty = Number(stock.quantity) || 0;
      const oldPrice = Number(stock.buyPrice) || 0;
      const newQty = Number(quantity) || 0;
      const newPrice = Number(price) || 0;
      
      const totalQuantity = oldQty + newQty;
      let weightedAvgPrice = ((oldPrice * oldQty) + (newPrice * newQty)) / totalQuantity;
      
      if (isNaN(weightedAvgPrice)) weightedAvgPrice = newPrice;

      stock.quantity = totalQuantity;
      stock.buyPrice = weightedAvgPrice;
      await stock.save();
    } else {
      stock = await Portfolio.create({
        user: userId,
        symbol,
        quantity: Number(quantity),
        buyPrice: Number(price)
      });
    }

    // Record transaction using real price
    await Transaction.create({
      user: userId,
      type: "BUY",
      symbol,
      quantity: Number(quantity),
      price: Number(price)
    });

    console.log(`[BUY] Transaction recorded in DB for user ${userId}`);

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

    console.log(`[SELL] Attempting sale for user ${userId}: ${quantity} shares of ${symbol}`);

    if (!symbol || isNaN(quantity) || Number(quantity) <= 0) {
      return res.status(400).json({ message: "Invalid symbol or quantity" });
    }

    // Fetch REAL price securely
    const { price } = await getStockPrice(symbol);
    if (!price || price <= 0) {
      return res.status(400).json({ message: "Invalid stock price from market" });
    }

    const stock = await Portfolio.findOne({ user: userId, symbol });

    if (!stock || stock.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    // Calculate profit before potential deletion with NaN safety
    const sellPrice = Number(price) || 0;
    const buyPrice = Number(stock.buyPrice) || 0;
    const qtySold = Number(quantity) || 0;
    
    let profit = (sellPrice - buyPrice) * qtySold;
    if (isNaN(profit)) profit = 0;

    // Update portfolio
    stock.quantity = (Number(stock.quantity) || 0) - qtySold;

    if (stock.quantity <= 0) {
      await stock.deleteOne();
    } else {
      await stock.save();
    }

    // Update wallet and realized profit with absolute safety
    const user = await User.findById(userId);
    user.walletBalance = (Number(user.walletBalance) || 0) + (sellPrice * qtySold);
    
    const currentRealized = Number(user.realizedProfit) || 0;
    user.realizedProfit = Number((currentRealized + profit).toFixed(6));
    
    await user.save();

    // Fetch FRESH copy to ensure everything is synced before returning
    const updatedUser = await User.findById(userId);

    // Record transaction
    await Transaction.create({
      user: userId,
      type: "SELL",
      symbol,
      quantity: Number(quantity),
      price: Number(price),
      profit: Number(profit.toFixed(6))
    });

    console.log(`[SELL] Transaction recorded in DB for user ${userId}`);

    res.json({ 
      message: "Stock sold successfully", 
      walletBalance: updatedUser.walletBalance,
      realizedProfit: updatedUser.realizedProfit
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