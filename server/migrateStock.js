import { connectDB } from './src/config/db.js';
import mongoose from 'mongoose';
import { Product } from './src/models/Product.js';

import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await connectDB();
  const result = await Product.updateMany(
    { stockQuantity: { $exists: false } },
    { $set: { stockQuantity: 100 } }
  );
  console.log('Migration complete:', result);
  mongoose.disconnect();
}
migrate().catch(console.error);
