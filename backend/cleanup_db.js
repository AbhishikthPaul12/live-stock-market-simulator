import mongoose from 'mongoose';
import User from './models/User.js';
import Portfolio from './models/Portfolio.js';
import dotenv from 'dotenv';

dotenv.config();

async function cleanDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to DB for cleanup...');

    // Fix Users
    const users = await User.find({});
    for (const user of users) {
      let updated = false;
      if (isNaN(user.realizedProfit) || user.realizedProfit === null) {
        user.realizedProfit = 0;
        updated = true;
      }
      if (isNaN(user.walletBalance) || user.walletBalance === null) {
        user.walletBalance = 100000;
        updated = true;
      }
      if (updated) {
        await user.save();
        console.log(`Fixed user: ${user.email}`);
      }
    }

    // Fix Portfolios
    const portfolios = await Portfolio.find({});
    for (const p of portfolios) {
      let updated = false;
      if (isNaN(p.buyPrice) || p.buyPrice === null) {
        p.buyPrice = 150; // Default fallback
        updated = true;
      }
      if (isNaN(p.quantity) || p.quantity === null) {
        p.quantity = 0;
        updated = true;
      }
      if (updated) {
        await p.save();
        console.log(`Fixed portfolio entry for: ${p.symbol}`);
      }
    }

    console.log('Cleanup complete.');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
}

cleanDB();
