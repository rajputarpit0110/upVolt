import { connectDB } from './server/src/config/db.js';
import mongoose from 'mongoose';
import { Product } from './server/src/models/Product.js';

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
