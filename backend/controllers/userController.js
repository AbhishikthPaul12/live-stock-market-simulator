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

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      walletBalance: updatedUser.walletBalance,
      realizedProfit: updatedUser.realizedProfit,
      message: "Profile updated successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};