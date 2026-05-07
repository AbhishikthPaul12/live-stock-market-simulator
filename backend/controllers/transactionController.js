import Transaction from "../models/Transaction.js";

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(`[TX_FETCH] User ${userId} is fetching transaction history`);

    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 });

    console.log(`[TX_FETCH] Found ${transactions.length} transactions for user ${userId}`);
    res.json(transactions);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};