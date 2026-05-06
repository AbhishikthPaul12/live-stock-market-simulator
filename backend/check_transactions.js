import mongoose from 'mongoose';
import Transaction from './models/Transaction.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkTransactions() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    
    const user = await User.findOne({ email: 'ravi@gmail.com' });
    if (!user) {
      console.log('User not found.');
      process.exit(0);
    }

    const transactions = await Transaction.find({ user: user._id }).sort({ createdAt: 1 });
    console.log(`Transactions for ${user.email}:`);
    transactions.forEach(t => {
      console.log(`- ${t.type} ${t.symbol}: Qty=${t.quantity}, Price=${t.price}, Total=${t.price * t.quantity}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkTransactions();
