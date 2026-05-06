import mongoose from 'mongoose';
import User from './models/User.js';
import Portfolio from './models/Portfolio.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPortfolio() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    
    const user = await User.findOne({ email: 'ravi@gmail.com' });
    if (!user) {
      console.log('User not found.');
      process.exit(0);
    }

    const portfolio = await Portfolio.find({ user: user._id });
    console.log(`Portfolio for ${user.email}:`);
    portfolio.forEach(p => {
      console.log(`- ${p.symbol}: Qty=${p.quantity}, AvgBuyPrice=${p.buyPrice}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkPortfolio();
