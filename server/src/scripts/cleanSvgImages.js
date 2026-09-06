import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const checkAndUpdate = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({});
  console.log(`Found ${products.length} products in DB.`);

  let updatedCount = 0;
  for (const p of products) {
    let changed = false;
    if (p.image && p.image.endsWith('.svg')) {
      if (p.image.includes('esp32')) p.image = '/images/realistic/esp32.jpg';
      else if (p.image.includes('arduino')) p.image = '/images/realistic/arduino_uno.jpg';
      else if (p.image.includes('ultrasonic')) p.image = '/images/realistic/ultrasonic.jpg';
      else if (p.image.includes('dht11')) p.image = '/images/realistic/dht11.jpg';
      else if (p.image.includes('rfid')) p.image = '/images/realistic/rfid.jpg';
      else if (p.image.includes('motor')) p.image = '/images/realistic/motor.jpg';
      else if (p.image.includes('robotcar')) p.image = '/images/realistic/robotcar.jpg';
      else p.image = '/images/realistic/arduino_uno.jpg';
      changed = true;
    }

    if (p.images && p.images.length > 0) {
      p.images = p.images.map(img => {
        if (img.endsWith('.svg')) {
          if (img.includes('esp32')) return '/images/realistic/esp32.jpg';
          if (img.includes('arduino')) return '/images/realistic/arduino_uno.jpg';
          if (img.includes('ultrasonic')) return '/images/realistic/ultrasonic.jpg';
          if (img.includes('dht11')) return '/images/realistic/dht11.jpg';
          if (img.includes('rfid')) return '/images/realistic/rfid.jpg';
          if (img.includes('motor')) return '/images/realistic/motor.jpg';
          if (img.includes('robotcar')) return '/images/realistic/robotcar.jpg';
          return '/images/realistic/arduino_uno.jpg';
        }
        return img;
      });
      changed = true;
    } else {
      p.images = [p.image];
      changed = true;
    }

    if (changed) {
      await p.save();
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} products to 100% realistic images.`);
  await mongoose.disconnect();
};

checkAndUpdate();
