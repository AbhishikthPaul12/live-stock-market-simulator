import User from "../models/User.js";

export const getUserWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      walletBalance: user.walletBalance
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.watchlist || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToWatchlist = async (req, res) => {
  try {
    const { symbol, name } = req.body;
    const user = await User.findById(req.user._id);

    // Check if already in watchlist
    const exists = user.watchlist.find((item) => item.symbol === symbol);
    if (exists) {
      return res.status(400).json({ message: "Stock already in watchlist" });
    }

    user.watchlist.push({ symbol, name });
    await user.save();

    res.json({ message: "Stock added to watchlist", watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const { symbol } = req.params;
    const user = await User.findById(req.user._id);

    user.watchlist = user.watchlist.filter((item) => item.symbol !== symbol);
    await user.save();

    res.json({ message: "Stock removed from watchlist", watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};