import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded regardless of import order
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

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
 * Uploads a base64 string to Cloudinary
 * @param {string} base64Image - The base64 image string starting with data:image/...
 * @param {string} folder - The destination folder in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (base64Image, folder = 'upvolt') => {
  try {
    if (!base64Image || typeof base64Image !== 'string' || !base64Image.startsWith('data:image')) {
      return base64Image; // Return as is if it's already a URL or empty
    }

    checkAndConfigureCloudinary();

    // cloudinary.uploader.upload supports base64 strings directly
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'image'
    });

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image. Please check Cloudinary configuration.');
  }
};

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
export default cloudinary;
