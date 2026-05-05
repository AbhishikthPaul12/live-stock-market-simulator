import Portfolio from "../models/Portfolio.js";

export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user._id;

    const portfolio = await Portfolio.find({ user: userId });

    res.json(portfolio);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};