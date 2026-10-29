import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userName: {
    type: String,
    trim: true,
    default: ''
  },
  userCollege: {
    type: String,
    trim: true,
    default: ''
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String // Cloudinary URLs or base64 paths
  }]
}, { timestamps: true });

// Prevent a registered user from duplicate entries on the same product (sparse so guests without user ID can submit)
reviewSchema.index({ user: 1, product: 1 }, { unique: true, sparse: true });

export const Review = mongoose.model('Review', reviewSchema);
