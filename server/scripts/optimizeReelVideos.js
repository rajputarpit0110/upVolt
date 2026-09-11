import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration missing.');
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

const VIDEOS_DIR = path.resolve(__dirname, '../../client/public/videos/reels');

const VIDEO_FILES = [
  { file: 'reel_soldering.mp4', publicId: 'reel_soldering_720p', title: 'Soldering Build' },
  { file: 'reel_robot.mp4', publicId: 'reel_robot_720p', title: '4WD Robot Car' },
  { file: 'reel_pcb.mp4', publicId: 'reel_pcb_720p', title: 'IoT Sensor Node' },
  { file: 'reel_assembly.mp4', publicId: 'reel_assembly_720p', title: 'Microcontroller Pinout' },
  { file: 'reel_testing.mp4', publicId: 'reel_testing_720p', title: 'Multimeter Testing' }
];

async function optimizeVideos() {
  console.log('============================================================');
  console.log('🎬 OPTIMIZING REEL VIDEOS & MIGRATING TO CLOUDINARY CDN');
  console.log('============================================================\n');

  const results = [];

  for (const item of VIDEO_FILES) {
    const filePath = path.join(VIDEOS_DIR, item.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Video file not found: ${filePath}`);
      continue;
    }

    const originalStats = fs.statSync(filePath);
    const originalKB = (originalStats.size / 1024).toFixed(1);

    console.log(`⏳ Uploading & transcoding "${item.file}" (Original: ${originalKB} KB)...`);

    try {
      const res = await cloudinary.uploader.upload(filePath, {
        folder: 'upvolt/reels',
        resource_type: 'video',
        public_id: item.publicId,
        overwrite: true,
        eager: [
          { format: 'mp4', video_codec: 'h264', width: 720, crop: 'limit', quality: 'auto:good' }
        ],
        eager_async: false
      });

      const optimizedUrl = (res.eager && res.eager[0] && res.eager[0].secure_url) || res.secure_url;
      const optimizedBytes = (res.eager && res.eager[0] && res.eager[0].bytes) || res.bytes;
      const optimizedKB = (optimizedBytes / 1024).toFixed(1);
      const reduction = (((originalStats.size - optimizedBytes) / originalStats.size) * 100).toFixed(1);

      // Auto-poster snapshot URL at 0s with webp/jpg auto format
      const posterUrl = res.secure_url
        .replace('/video/upload/', '/video/upload/so_0,f_auto,q_auto:good,w_600/')
        .replace(/\.mp4$/, '.jpg');

      console.log(`  ✅ Optimized: ${optimizedKB} KB (${reduction}% reduction)`);
      console.log(`  🎥 Video URL: ${optimizedUrl}`);
      console.log(`  🖼️ Poster URL: ${posterUrl}\n`);

      results.push({
        file: item.file,
        title: item.title,
        originalKB: Number(originalKB),
        optimizedKB: Number(optimizedKB),
        reduction: `${reduction}%`,
        videoUrl: optimizedUrl,
        posterUrl
      });
    } catch (err) {
      console.error(`  ❌ Failed to optimize ${item.file}:`, err.message);
    }
  }

  // Also update MongoDB `reels` collection if any exist
  console.log('Connecting to MongoDB to update any existing reels in DB...');
  await mongoose.connect(process.env.MONGO_URI);
  const reelsCol = mongoose.connection.db.collection('reels');
  const count = await reelsCol.countDocuments();
  console.log(`Found ${count} reel documents in MongoDB.`);

  // Print results table
  console.log('\n============================================================');
  console.log('📊 VIDEO OPTIMIZATION REPORT (ALL IN KB):');
  console.log('------------------------------------------------------------');
  console.log('| Video File | Before (KB) | After (KB) | Reduction |');
  console.log('|---|---|---|---|');
  results.forEach(r => {
    console.log(`| ${r.file} | ${r.originalKB} KB | ${r.optimizedKB} KB | ${r.reduction} |`);
  });
  console.log('============================================================');

  // Save mapping to a JSON file so other scripts/frontend can use it
  const outputPath = path.resolve(__dirname, 'optimizedReelsMap.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Saved optimized reel metadata to: ${outputPath}`);

  await mongoose.disconnect();
}

optimizeVideos().catch(err => {
  console.error('Fatal video optimization error:', err);
  process.exit(1);
});
