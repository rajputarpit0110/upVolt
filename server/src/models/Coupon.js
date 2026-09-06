import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    uppercase: true,
    trim: true,
    unique: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
    required: true
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [1, 'Discount value must be at least 1']
  },
  validFrom: {
    type: Date,
    default: Date.now,
    required: [true, 'Valid from date is required']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until / expiry date is required']
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdByName: {
    type: String,
    default: 'CampusCircuit Admin'
  }
}, {
  timestamps: true
});

export const Coupon = mongoose.model('Coupon', couponSchema);
