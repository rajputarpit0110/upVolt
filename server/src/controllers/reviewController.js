import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { uploadImageToCloudinary } from '../config/cloudinary.js';

// Get eligible products for a user to review
export const getEligibleProducts = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all completed orders for this user
    const orders = await Order.find({ user: userId, orderStatus: 'completed' });

    if (!orders || orders.length === 0) {
      return res.status(200).json({ success: true, products: [] });
    }

    // Extract all product IDs from these orders
    const productIds = new Set();
    orders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          if (item.product) {
            productIds.add(item.product.toString());
          }
        });
      }
    });

    if (productIds.size === 0) {
      return res.status(200).json({ success: true, products: [] });
    }

    // Check which of these products the user has already reviewed
    const existingReviews = await Review.find({
      user: userId,
      product: { $in: Array.from(productIds) }
    });

    const reviewedProductIds = new Set(existingReviews.map(r => r.product.toString()));

    // Filter out already reviewed products
    const eligibleProductIds = Array.from(productIds).filter(id => !reviewedProductIds.has(id));

    if (eligibleProductIds.length === 0) {
      return res.status(200).json({ success: true, products: [] });
    }

    // Fetch product details for the eligible ones
    const products = await Product.find({ _id: { $in: eligibleProductIds } })
      .select('_id name image');

    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching eligible products:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, rating, comment, images } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product, rating, and comment are required.' });
    }

    // 1. Verify eligibility (ordered and completed)
    const hasOrdered = await Order.findOne({
      user: userId,
      orderStatus: 'completed',
      'items.product': productId
    });

    if (!hasOrdered) {
      return res.status(403).json({ success: false, message: 'You can only review products you have purchased and received.' });
    }

    // 2. Check if already reviewed
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
    }

    // 3. Process images
    let uploadedImages = [];
    if (images && Array.isArray(images) && images.length > 0) {
      // images could be base64 strings or direct cloudinary URLs
      const uniqueImages = [...new Set(images)];
      uploadedImages = await Promise.all(
        uniqueImages.map(img => {
          if (img.startsWith('data:image')) {
            return uploadImageToCloudinary(img, 'upvolt/reviews');
          }
          return img; // Already uploaded
        })
      );
    }

    // 4. Create review
    const review = await Review.create({
      user: userId,
      product: productId,
      rating: Number(rating),
      comment: comment.trim(),
      images: uploadedImages
    });

    // 5. Update Product rating and reviewsCount
    const product = await Product.findById(productId);
    if (product) {
      const oldRating = product.rating || 5.0;
      const count = product.reviewsCount || 0;
      const newRating = ((oldRating * count) + Number(rating)) / (count + 1);

      product.rating = Math.round(newRating * 10) / 10;
      product.reviewsCount = count + 1;
      await product.save();
    }

    // Populate user info for immediate display
    await review.populate('user', 'name image avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name image avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ product: productId });

    res.status(200).json({
      success: true,
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
