import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const isDryRun = process.argv.includes('--dry-run');

// Verify Cloudinary configuration safely without exposing secrets
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration missing in environment variables.');
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

const CLIENT_PUBLIC_DIR = path.resolve(__dirname, '../../client/public');
const SERVER_PUBLIC_DIR = path.resolve(__dirname, '../public');

/**
 * Resolve a local relative path (e.g. /images/... or /uploads/...) to an absolute file path
 */
const resolveLocalFile = (relPath) => {
  if (!relPath || typeof relPath !== 'string') return null;
  const cleanPath = relPath.replace(/^\/+/, '');
  
  const inClient = path.join(CLIENT_PUBLIC_DIR, cleanPath);
  if (fs.existsSync(inClient)) return inClient;

  const inServer = path.join(SERVER_PUBLIC_DIR, cleanPath);
  if (fs.existsSync(inServer)) return inServer;

  return null;
};

/**
 * Upload an image source (Base64 string or local file path) to Cloudinary
 */
const uploadToCloudinary = async (source, folder, publicIdHint) => {
  const options = {
    folder: `upvolt/${folder}`,
    resource_type: 'image',
    quality: 'auto:good',
    fetch_format: 'auto'
  };

  if (publicIdHint) {
    options.public_id = publicIdHint;
    options.overwrite = false; // Idempotent: don't overwrite if exists
  }

  const result = await cloudinary.uploader.upload(source, options);
  if (!result || !result.secure_url || !result.secure_url.startsWith('https://')) {
    throw new Error('Cloudinary did not return a verified HTTPS URL.');
  }
  return result.secure_url;
};

async function runMigration() {
  console.log('============================================================');
  console.log(`🚀 DATABASE IMAGE MIGRATION TO CLOUDINARY [Mode: ${isDryRun ? 'DRY-RUN (No DB changes)' : 'LIVE EXECUTION'}]`);
  console.log(`☁️ Cloudinary Cloud: ${cloudName}`);
  console.log('============================================================\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB successfully.\n');

  const stats = {
    mentors: { scanned: 0, base64: 0, local: 0, alreadyCloudinary: 0, migrated: 0, failed: 0 },
    products: { scanned: 0, base64: 0, local: 0, alreadyCloudinary: 0, migrated: 0, failed: 0 },
    categories: { scanned: 0, base64: 0, local: 0, alreadyCloudinary: 0, migrated: 0, failed: 0 }
  };

  const plannedChanges = [];

  // 1. Scan and migrate MENTORS
  console.log('🔍 Scanning `mentors` collection...');
  const mentorsCol = mongoose.connection.db.collection('mentors');
  const mentors = await mentorsCol.find().toArray();
  stats.mentors.scanned = mentors.length;

  for (const m of mentors) {
    const img = m.image || '';
    const isBase64 = img.startsWith('data:image');
    const isCloudinary = img.includes('res.cloudinary.com');
    const isLocal = !isCloudinary && !isBase64 && (img.startsWith('/images/') || img.startsWith('/uploads/') || img.startsWith('images/'));

    if (isCloudinary) {
      stats.mentors.alreadyCloudinary++;
      continue;
    }

    if (isBase64) {
      stats.mentors.base64++;
      const sizeKB = (Buffer.byteLength(img, 'utf8') / 1024).toFixed(1);
      const hint = `mentor_${m.name ? m.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : m._id}`;

      plannedChanges.push({
        collection: 'mentors',
        id: m._id,
        name: m.name,
        type: `Base64 (${sizeKB} KB)`,
        source: img,
        folder: 'mentors',
        hint
      });
    } else if (isLocal) {
      stats.mentors.local++;
      const resolved = resolveLocalFile(img);
      if (resolved) {
        const statsObj = fs.statSync(resolved);
        const sizeKB = (statsObj.size / 1024).toFixed(1);
        const hint = `mentor_${m.name ? m.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : m._id}`;

        plannedChanges.push({
          collection: 'mentors',
          id: m._id,
          name: m.name,
          type: `Local File (${sizeKB} KB)`,
          source: resolved,
          folder: 'mentors',
          hint
        });
      }
    }
  }

  // 2. Scan and migrate PRODUCTS
  console.log('🔍 Scanning `products` collection...');
  const productsCol = mongoose.connection.db.collection('products');
  const products = await productsCol.find().toArray();
  stats.products.scanned = products.length;

  for (const p of products) {
    const img = p.image || '';
    const isBase64 = img.startsWith('data:image');
    const isCloudinary = img.includes('res.cloudinary.com');
    const isLocal = !isCloudinary && !isBase64 && (img.startsWith('/images/') || img.startsWith('/uploads/') || img.startsWith('images/'));

    if (isCloudinary) {
      stats.products.alreadyCloudinary++;
      continue;
    }

    if (isBase64) {
      stats.products.base64++;
      const sizeKB = (Buffer.byteLength(img, 'utf8') / 1024).toFixed(1);
      const hint = `prod_${p.sku || p._id}`;

      plannedChanges.push({
        collection: 'products',
        id: p._id,
        name: p.name,
        type: `Base64 (${sizeKB} KB)`,
        source: img,
        folder: 'products',
        hint
      });
    } else if (isLocal) {
      stats.products.local++;
      const resolved = resolveLocalFile(img);
      if (resolved) {
        const statsObj = fs.statSync(resolved);
        const sizeKB = (statsObj.size / 1024).toFixed(1);
        const hint = `prod_${p.sku ? p.sku.toLowerCase().replace(/[^a-z0-9]/g, '_') : p._id}`;

        plannedChanges.push({
          collection: 'products',
          id: p._id,
          name: p.name,
          type: `Local File (${sizeKB} KB)`,
          source: resolved,
          folder: 'products',
          hint
        });
      }
    }
  }

  // 3. Scan and migrate CATEGORIES
  console.log('🔍 Scanning `categories` collection...');
  const categoriesCol = mongoose.connection.db.collection('categories');
  const categories = await categoriesCol.find().toArray();
  stats.categories.scanned = categories.length;

  for (const c of categories) {
    const img = c.image || '';
    const isBase64 = img.startsWith('data:image');
    const isCloudinary = img.includes('res.cloudinary.com');
    const isLocal = !isCloudinary && !isBase64 && (img.startsWith('/images/') || img.startsWith('/uploads/') || img.startsWith('images/'));

    if (isCloudinary) {
      stats.categories.alreadyCloudinary++;
      continue;
    }

    if (isBase64) {
      stats.categories.base64++;
      const sizeKB = (Buffer.byteLength(img, 'utf8') / 1024).toFixed(1);
      const hint = `cat_${c.slug || c._id}`;

      plannedChanges.push({
        collection: 'categories',
        id: c._id,
        name: c.name,
        type: `Base64 (${sizeKB} KB)`,
        source: img,
        folder: 'categories',
        hint
      });
    } else if (isLocal) {
      stats.categories.local++;
      const resolved = resolveLocalFile(img);
      if (resolved) {
        const statsObj = fs.statSync(resolved);
        const sizeKB = (statsObj.size / 1024).toFixed(1);
        const hint = `cat_${c.slug || c._id}`;

        plannedChanges.push({
          collection: 'categories',
          id: c._id,
          name: c.name,
          type: `Local File (${sizeKB} KB)`,
          source: resolved,
          folder: 'categories',
          hint
        });
      }
    }
  }

  console.log(`\n📋 Identified ${plannedChanges.length} candidate record(s) requiring Cloudinary migration:`);
  plannedChanges.forEach((ch, idx) => {
    console.log(`  ${idx + 1}. [${ch.collection}] "${ch.name}" (${ch.type})`);
  });

  if (isDryRun) {
    console.log('\n============================================================');
    console.log('🏁 DRY-RUN COMPLETE. No changes were made to MongoDB.');
    console.log('Run without `--dry-run` to execute Cloudinary uploads and database updates.');
    console.log('============================================================');
    await mongoose.disconnect();
    return;
  }

  // Live execution
  console.log('\n⚡ Starting live migration to Cloudinary...');
  for (const ch of plannedChanges) {
    try {
      console.log(`\n⏳ Uploading for [${ch.collection}] "${ch.name}"...`);
      const newUrl = await uploadToCloudinary(ch.source, ch.folder, ch.hint);
      console.log(`  ✅ Cloudinary HTTPS URL obtained: ${newUrl}`);

      // Update MongoDB only after successful verification
      const targetCol = mongoose.connection.db.collection(ch.collection);
      const updateRes = await targetCol.updateOne(
        { _id: ch.id },
        { $set: { image: newUrl } }
      );

      if (updateRes.matchedCount === 1) {
        console.log(`  💾 MongoDB document updated successfully.`);
        stats[ch.collection].migrated++;
      } else {
        console.warn(`  ⚠️ MongoDB update matched 0 documents for ID ${ch.id}`);
        stats[ch.collection].failed++;
      }
    } catch (err) {
      console.error(`  ❌ Migration failed for [${ch.collection}] "${ch.name}":`, err.message);
      stats[ch.collection].failed++;
    }
  }

  console.log('\n============================================================');
  console.log('🎉 MIGRATION SUMMARY REPORT:');
  console.log('------------------------------------------------------------');
  for (const [col, s] of Object.entries(stats)) {
    console.log(`• ${col}: scanned=${s.scanned}, alreadyCloudinary=${s.alreadyCloudinary}, base64=${s.base64}, local=${s.local}, migrated=${s.migrated}, failed=${s.failed}`);
  }
  console.log('============================================================');

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB.');
}

runMigration().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
