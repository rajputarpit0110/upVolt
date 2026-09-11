import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded regardless of import order
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Configure and verify Cloudinary credentials safely without exposing secrets
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
  console.log(`☁️ Cloudinary CDN configured successfully (Cloud: ${process.env.CLOUDINARY_CLOUD_NAME})`);
} else {
  console.warn('⚠️ Cloudinary keys missing in environment variables. Uploads may fail.');
}

/**
 * Uploads a base64 string directly to Cloudinary with automatic optimization
 * @param {string} base64Image - The base64 image string starting with data:image/...
 * @param {string} folder - The destination folder in Cloudinary
 * @returns {Promise<string>} - The secure HTTPS URL of the uploaded image
 */
export const uploadImageToCloudinary = async (base64Image, folder = 'upvolt') => {
  try {
    if (!base64Image || typeof base64Image !== 'string' || !base64Image.startsWith('data:image')) {
      return base64Image; // Return as-is if already a URL or empty
    }

    const isConfigured = checkAndConfigureCloudinary();
    if (!isConfigured) {
      throw new Error('Cloudinary is not configured. Media cannot be stored locally.');
    }

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: `upvolt/${folder.replace(/^upvolt\/?/, '')}`,
      resource_type: 'image',
      quality: 'auto:good',
      fetch_format: 'auto',
      max_width: 1600,
      crop: 'limit'
    });

    if (!result || !result.secure_url) {
      throw new Error('Cloudinary did not return a valid secure URL.');
    }

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error.message);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Upload a file buffer to Cloudinary (image or video) with automatic optimization
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Options (folder, filename, resource_type, width)
 * @returns {Promise<{ url: string, public_id: string, format: string, bytes: number, provider: string }>}
 */
export const uploadFileBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const isConfigured = checkAndConfigureCloudinary();
    if (!isConfigured) {
      return reject(new Error('Cloudinary is required for media storage. Please configure CLOUDINARY_* environment variables.'));
    }

    const isVideo = options.resource_type === 'video' || (options.filename && options.filename.match(/\.(mp4|webm|mov|mkv)$/i));
    const targetFolder = `upvolt/${(options.folder || (isVideo ? 'reels' : 'products')).replace(/^upvolt\/?/, '')}`;

    const uploadOptions = {
      folder: targetFolder,
      resource_type: isVideo ? 'video' : 'image',
      quality: 'auto:good',
      fetch_format: 'auto',
      use_filename: true,
      unique_filename: true
    };

    if (isVideo) {
      uploadOptions.eager = [
        { format: 'mp4', video_codec: 'h264', width: 720, crop: 'limit', quality: 'auto:good' }
      ];
      uploadOptions.eager_async = false;
    } else {
      uploadOptions.width = options.width || 1200;
      uploadOptions.crop = 'limit';
    }

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error('Cloudinary stream upload error:', error.message);
        return reject(new Error(`Cloudinary upload failed: ${error.message}`));
      }

      const finalUrl = (result.eager && result.eager[0] && result.eager[0].secure_url) || result.secure_url;

      resolve({
        url: finalUrl,
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes,
        provider: 'cloudinary'
      });
    });

    stream.end(buffer);
  });
};

/**
 * Generates an optimized Cloudinary delivery URL with responsive transformations
 * @param {string} url - Original Cloudinary URL
 * @param {Object} opts - { width, height, quality, format }
 */
export const getOptimizedCloudinaryUrl = (url, opts = {}) => {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return url;
  }

  const { width, height, quality = 'auto', format = 'auto' } = opts;
  const transforms = [];

  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push('c_limit');

  if (transforms.length === 0) return url;

  const transformString = transforms.join(',');
  return url.replace('/upload/', `/upload/${transformString}/`);
};

export { cloudinary };
export default cloudinary;
