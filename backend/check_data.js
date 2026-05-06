import mongoose from 'mongoose';
import User from './models/User.js';
import Transaction from './models/Transaction.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    
    const lastTransaction = await Transaction.findOne({}).sort({ createdAt: -1 });
    if (!lastTransaction) {
      console.log('No transactions found.');
      process.exit(0);
    }

    const user = await User.findById(lastTransaction.user);
    console.log(`User: ${user.email}`);
    console.log(`Wallet Balance: ${user.walletBalance}`);
    console.log(`Realized Profit: ${user.realizedProfit}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
