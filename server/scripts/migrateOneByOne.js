import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Product } from '../src/models/Product.js';
import { uploadFileBuffer } from '../src/config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const UPLOADS_DIR = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const runMigration = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000
    });
    console.log('✅ Connected to MongoDB');

    // Get list of all product IDs
    const idList = await Product.find({}, { _id: 1, name: 1 }).lean();
    console.log(`Found ${idList.length} total products to inspect.`);

    let migratedCount = 0;
    let bytesSaved = 0;

    for (let i = 0; i < idList.length; i++) {
      const item = idList[i];
      const prod = await Product.findById(item._id);
      if (!prod) continue;

      let changed = false;

      // 1. Check primary image
      if (prod.image && (prod.image.startsWith('data:') || prod.image.length > 500)) {
        const matches = prod.image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          bytesSaved += prod.image.length;

          const uploadResult = await uploadFileBuffer(buffer, {
            filename: `${prod.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${prod._id}-main.${ext}`,
            folder: 'upvolt/products'
          });

          prod.image = uploadResult.url;
          changed = true;
          console.log(`[${i + 1}/${idList.length}] Converted main image for "${prod.name}" -> ${uploadResult.url}`);
        }
      }

      // 2. Check images array
      if (Array.isArray(prod.images) && prod.images.length > 0) {
        const updatedImages = [];
        for (let idx = 0; idx < prod.images.length; idx++) {
          const imgStr = prod.images[idx];
          if (imgStr && (imgStr.startsWith('data:') || imgStr.length > 500)) {
            const matches = imgStr.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
            if (matches) {
              const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
              const buffer = Buffer.from(matches[2], 'base64');
              bytesSaved += imgStr.length;

              const uploadResult = await uploadFileBuffer(buffer, {
                filename: `${prod.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${prod._id}-${idx}.${ext}`,
                folder: 'upvolt/products'
              });

              updatedImages.push(uploadResult.url);
              changed = true;
              console.log(`[${i + 1}/${idList.length}] Converted gallery[${idx}] for "${prod.name}" -> ${uploadResult.url}`);
            } else {
              updatedImages.push(imgStr);
            }
          } else {
            updatedImages.push(imgStr);
          }
        }
        prod.images = updatedImages;
      }

      if (changed) {
        await prod.save();
        migratedCount++;
      }
    }

    console.log(`\n========================================`);
    console.log(`🎉 Migration Completed Successfully!`);
    console.log(`Products Cleaned: ${migratedCount}`);
    console.log(`Total Base64 Data Stripped from DB: ${(bytesSaved / 1024 / 1024).toFixed(2)} MB`);
    console.log(`========================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

runMigration();
