import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function checkFieldTypes() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const sample = await db.collection('transactions').findOne({});
    
    if (sample) {
      console.log('Sample Transaction:', JSON.stringify(sample, null, 2));
      console.log('User field type:', typeof sample.user);
      console.log('Is User field an ObjectId?', sample.user instanceof mongoose.Types.ObjectId);
      console.log('Is _id an ObjectId?', sample._id instanceof mongoose.Types.ObjectId);
    } else {
      console.log('No transactions found');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkFieldTypes();
