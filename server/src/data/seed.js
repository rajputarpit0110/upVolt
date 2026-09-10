import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { INITIAL_PRODUCTS } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const ADMIN_ACCOUNTS = [
  {
    name: 'upVolt System',
    email: 'masteradmin@upvolt.com',
    passwordRaw: 'Master@123',
    role: 'master_admin',
    college: 'upVolt HQ'
  },
  {
    name: 'Admin Alpha (Hardware Lead)',
    email: 'admin1@upvolt.com',
    passwordRaw: 'Admin1@123',
    role: 'admin',
    college: 'Electronics & Comm Department'
  },
  {
    name: 'Admin Beta (Inventory Lead)',
    email: 'admin2@upvolt.com',
    passwordRaw: 'Admin2@123',
    role: 'admin',
    college: 'Robotics Innovation Lab'
  }
];

const seedDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/upvolt';
  console.log(`🔌 Connecting to MongoDB for seeding...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);

    // 1. Seed Admins
    console.log(`👤 Seeding Admin Accounts...`);
    for (const admin of ADMIN_ACCOUNTS) {
      const existing = await User.findOne({ email: admin.email });
      if (!existing) {
        // Create user (pre-save hook will hash password)
        await User.create({
          name: admin.name,
          email: admin.email,
          password: admin.passwordRaw,
          role: admin.role,
          college: admin.college
        });
        console.log(`   + Created ${admin.role}: ${admin.email} (PW: ${admin.passwordRaw})`);
      } else {
        // Ensure role is up-to-date
        existing.role = admin.role;
        existing.name = admin.name;
        await existing.save();
        console.log(`   ✓ Verified ${admin.role}: ${admin.email}`);
      }
    }

    // 2. Seed Products
    console.log(`📦 Seeding ${INITIAL_PRODUCTS.length} products...`);
    let inserted = 0;
    let updated = 0;

    for (const productData of INITIAL_PRODUCTS) {
      const result = await Product.updateOne(
        { sku: productData.sku },
        { $set: productData },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        inserted++;
      } else if (result.modifiedCount > 0) {
        updated++;
      }
    }

    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    console.log(`🎉 Seeding complete!`);
    console.log(`   - Newly inserted products: ${inserted}`);
    console.log(`   - Updated products: ${updated}`);
    console.log(`   - Total products in database: ${totalProducts}`);
    console.log(`   - Total users/admins in database: ${totalUsers}`);

    await mongoose.disconnect();
    console.log(`👋 Disconnected from MongoDB cleanly.`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed:`, error);
    process.exit(1);
  }
};

seedDB();
