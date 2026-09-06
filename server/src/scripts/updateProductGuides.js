import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { Product } from '../models/Product.js';
import { PRODUCT_GUIDES } from '../data/productGuides.js';

export { PRODUCT_GUIDES };

async function updateAllProductGuides() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campuscircuit';
    console.log(`Connecting to MongoDB at: ${mongoUri.substring(0, 25)}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully!');

    let updatedCount = 0;

    for (const [sku, guide] of Object.entries(PRODUCT_GUIDES)) {
      const result = await Product.updateOne(
        { sku: sku },
        {
          $set: {
            youtubeUrl: guide.youtubeUrl,
            researchUrl: guide.researchUrl,
            datasheetUrl: guide.datasheetUrl,
            documentationUrl: guide.documentationUrl,
            howToUse: guide.howToUse,
            whereToUse: guide.whereToUse,
            safetyPrecautions: guide.safetyPrecautions
          }
        }
      );

      if (result.matchedCount > 0) {
        console.log(`✅ Updated guides for SKU [${sku}]: Matched & updated`);
        updatedCount++;
      } else {
        console.log(`⚠️ SKU [${sku}] not found in database`);
      }
    }

    console.log(`\n🎉 Finished updating guides for ${updatedCount} products in MongoDB!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating product guides:', err);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  updateAllProductGuides();
}
