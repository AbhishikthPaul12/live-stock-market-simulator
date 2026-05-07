import mongoose from 'mongoose';
import Transaction from './models/Transaction.js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function checkLatestTx() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
    
    const latest = await Transaction.findOne({}).sort({ createdAt: -1 });
    console.log('Latest Transaction:', JSON.stringify(latest, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkLatestTx();
