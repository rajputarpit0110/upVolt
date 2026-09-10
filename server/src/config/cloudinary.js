import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded regardless of import order
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Configure and verify Cloudinary credentials
 */
export const checkAndConfigureCloudinary = () => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const api_key = process.env.CLOUDINARY_API_KEY?.trim();
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
      secure: true
    });
    return true;
  }
  return false;
};

// Initial config check
if (checkAndConfigureCloudinary()) {
  console.log(`☁️ Cloudinary configured successfully (Cloud: ${process.env.CLOUDINARY_CLOUD_NAME})`);
} else {
  console.log('📦 Media Storage: Local uploads active (Add Cloudinary keys to .env to enable Cloud CDN)');
}

/**
 * Upload a file buffer to Cloudinary (with local fallback if unconfigured or error)
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Options (folder, filename, resource_type)
 * @returns {Promise<{ url: string, public_id: string, format: string, bytes: number, provider: string }>}
 */
export const uploadFileBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const isConfigured = checkAndConfigureCloudinary();

    if (isConfigured) {
      const uploadOptions = {
        folder: options.folder || 'upvolt/products',
        resource_type: options.resource_type || 'auto',
        // Auto optimize image quality and format
        quality: 'auto:good',
        fetch_format: 'auto',
        use_filename: true,
        unique_filename: true
      };

      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
          console.warn('⚠️ Cloudinary upload stream error, falling back locally:', error.message);
          saveLocally(buffer, options).then(resolve).catch(reject);
        } else {
          console.log('✅ Cloudinary upload success:', result.secure_url);
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            bytes: result.bytes,
            provider: 'cloudinary'
          });
        }
      });

      stream.on('error', (err) => {
        console.warn('⚠️ Cloudinary stream error:', err.message);
        saveLocally(buffer, options).then(resolve).catch(reject);
      });

      stream.end(buffer);
      return;
    }

    // Fallback locally
    saveLocally(buffer, options).then(resolve).catch(reject);
  });
};

/**
 * Fallback to saving file locally on the server filesystem
 */
const saveLocally = async (buffer, options = {}) => {
  const ext = options.filename ? path.extname(options.filename) : '.jpg';
  const cleanBase = options.filename
    ? path.basename(options.filename, ext).replace(/[^a-zA-Z0-9_-]/g, '')
    : 'upload';
  const fileName = `${Date.now()}-${cleanBase}${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  await fs.promises.writeFile(filePath, buffer);

  // Return absolute URL or path suitable for both local dev and production
  const backendHost = process.env.BACKEND_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '');
  const url = `${backendHost}/uploads/${fileName}`;

  return {
    url,
    public_id: fileName,
    format: ext.replace('.', ''),
    bytes: buffer.length,
    provider: 'local'
  };
};

export { cloudinary };
