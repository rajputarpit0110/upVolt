import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a base64 string to Cloudinary
 * @param {string} base64Image - The base64 image string starting with data:image/...
 * @param {string} folder - The destination folder in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (base64Image, folder = 'upvolt') => {
  try {
    if (!base64Image || !base64Image.startsWith('data:image')) {
      return base64Image; // Return as is if it's already a URL or empty
    }

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

export default cloudinary;
