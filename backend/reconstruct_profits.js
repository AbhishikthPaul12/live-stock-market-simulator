import mongoose from 'mongoose';
import User from './models/User.js';
import Transaction from './models/Transaction.js';
import Portfolio from './models/Portfolio.js';
import dotenv from 'dotenv';

dotenv.config();

async function reconstructProfits() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Reconstructing profits from transaction history...');

    const users = await User.find({});
    for (const user of users) {
      const transactions = await Transaction.find({ user: user._id }).sort({ createdAt: 1 });
      
      let totalRealized = 0;
      const holdings = {}; // To track avg price per user

      for (const t of transactions) {
        if (t.type === 'BUY') {
          const old = holdings[t.symbol] || { qty: 0, avg: 0 };
          const newQty = old.qty + t.quantity;
          const newAvg = ((old.avg * old.qty) + (t.price * t.quantity)) / newQty;
          holdings[t.symbol] = { qty: newQty, avg: newAvg };
        } else if (t.type === 'SELL') {
          const old = holdings[t.symbol] || { qty: 0, avg: 0 };
          const profit = (t.price - old.avg) * t.quantity;
          totalRealized += profit;
          old.qty -= t.quantity;
          holdings[t.symbol] = old;
        }
      }

      user.realizedProfit = totalRealized;
      await user.save();
      console.log(`Updated ${user.email}: Realized Profit = ${totalRealized}`);
    }

    console.log('Reconstruction complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

reconstructProfits();
