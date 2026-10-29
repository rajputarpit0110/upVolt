import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { uploadImageToCloudinary } from '../config/cloudinary.js';

// Get eligible products for a user to review (based on past orders)
export const getEligibleProducts = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(200).json({ success: true, products: [] });
    }

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
      .select('_id name image price category');

    return res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching eligible products:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Create or update a real review
export const createReview = async (req, res) => {
  try {
    const user = req.user;
    const userId = user?._id;
    const { productId, rating, comment, images, reviewerName, reviewerCollege } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product, rating (1-5), and review comment are required.' });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars.' });
    }

    // 1. Check if user has ordered and completed the order for Verified Buyer status
    let isVerifiedPurchase = false;
    if (userId) {
      const hasOrdered = await Order.findOne({
        user: userId,
        orderStatus: 'completed',
        'items.product': productId
      });
      isVerifiedPurchase = Boolean(hasOrdered);
    }

    // 2. Check if user already reviewed this product -> update existing if found
    let review = null;
    if (userId) {
      review = await Review.findOne({ user: userId, product: productId });
    }

    // 3. Process image attachments
    let uploadedImages = [];
    if (images && Array.isArray(images) && images.length > 0) {
      const uniqueImages = [...new Set(images.filter(Boolean))];
      uploadedImages = await Promise.all(
        uniqueImages.map(async (img) => {
          if (typeof img === 'string' && img.startsWith('data:image')) {
            try {
              return await uploadImageToCloudinary(img, 'upvolt/reviews');
            } catch (err) {
              console.warn('Cloudinary upload fallback:', err.message);
              return img;
            }
          }
          return img;
        })
      );
    }

    const finalName = user?.name || reviewerName?.trim() || 'Verified Student Maker';
    const finalCollege = user?.college || reviewerCollege?.trim() || 'Engineering Student';

    if (review) {
      // Update existing review
      review.rating = Number(rating);
      review.comment = comment.trim();
      if (uploadedImages.length > 0) {
        review.images = uploadedImages;
      }
      review.isVerifiedPurchase = isVerifiedPurchase || review.isVerifiedPurchase;
      if (!review.userName) review.userName = finalName;
      if (!review.userCollege) review.userCollege = finalCollege;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        user: userId || undefined,
        userName: finalName,
        userCollege: finalCollege,
        product: productId,
        rating: Number(rating),
        comment: comment.trim(),
        images: uploadedImages,
        isVerifiedPurchase
      });
    }

    // 4. Accurately recalculate Product average rating and total reviewsCount
    const allProductReviews = await Review.find({ product: productId });
    const product = await Product.findById(productId);
    if (product) {
      if (allProductReviews.length > 0) {
        const totalStars = allProductReviews.reduce((sum, r) => sum + r.rating, 0);
        product.rating = Math.round((totalStars / allProductReviews.length) * 10) / 10;
        product.reviewsCount = allProductReviews.length;
      } else {
        product.rating = Number(rating);
        product.reviewsCount = 1;
      }
      await product.save();
    }

    if (review.user) {
      await review.populate('user', 'name image avatar college');
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your real review has been published successfully.',
      review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name image avatar college')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ product: productId });

    // Calculate rating breakdown & average
    let averageRating = 5.0;
    if (total > 0) {
      const allRatings = await Review.find({ product: productId }).select('rating');
      const sum = allRatings.reduce((acc, curr) => acc + (curr.rating || 5), 0);
      averageRating = Math.round((sum / total) * 10) / 10;
    }

    return res.status(200).json({
      success: true,
      reviews,
      total,
      averageRating,
      totalPages: Math.max(1, Math.ceil(total / Number(limit))),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
