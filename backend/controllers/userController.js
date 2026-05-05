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