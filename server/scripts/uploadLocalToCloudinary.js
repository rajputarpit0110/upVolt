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

const UPLOADS_DIR = path.join(__dirname, '../public');

const run = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({
      $or: [
        { image: { $regex: '/uploads/' } },
        { images: { $elemMatch: { $regex: '/uploads/' } } }
      ]
    });

    console.log(`Found ${products.length} products with local /uploads/ images to push to Cloudinary.`);

    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      let modified = false;

      // 1. Primary image
      if (prod.image && prod.image.includes('/uploads/')) {
        const relPath = prod.image.replace(/^.*\/uploads\//, 'uploads/');
        const diskPath = path.join(UPLOADS_DIR, relPath);

        if (fs.existsSync(diskPath)) {
          const buffer = await fs.promises.readFile(diskPath);
          const uploadRes = await uploadFileBuffer(buffer, {
            filename: path.basename(diskPath),
            folder: 'upvolt/products'
          });
          prod.image = uploadRes.url;
          modified = true;
          console.log(`[${i + 1}/${products.length}] "${prod.name}" main -> ${uploadRes.url}`);
        }
      }

      // 2. Gallery images
      if (Array.isArray(prod.images)) {
        const newGallery = [];
        for (const imgUrl of prod.images) {
          if (imgUrl && imgUrl.includes('/uploads/')) {
            const relPath = imgUrl.replace(/^.*\/uploads\//, 'uploads/');
            const diskPath = path.join(UPLOADS_DIR, relPath);
            if (fs.existsSync(diskPath)) {
              const buffer = await fs.promises.readFile(diskPath);
              const uploadRes = await uploadFileBuffer(buffer, {
                filename: path.basename(diskPath),
                folder: 'upvolt/products'
              });
              newGallery.push(uploadRes.url);
              modified = true;
            } else {
              newGallery.push(imgUrl);
            }
          } else {
            newGallery.push(imgUrl);
          }
        }
        prod.images = newGallery;
      }

      if (modified) {
        await prod.save();
      }
    }

    console.log('\n🎉 ALL PRODUCTS SUCCESSFULLY MIGRATED TO CLOUDINARY CDN!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration to Cloudinary error:', err);
    process.exit(1);
  }
};

run();
