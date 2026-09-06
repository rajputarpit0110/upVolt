import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String },
  sku: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  customerPhone: { type: String, required: true },
  shippingAddress: {
    address: { type: String, required: true },
    collegeName: { type: String, default: '' },
    hostelName: { type: String, default: '' },
    roomNo: { type: String, default: '' },
    city: { type: String, default: 'Delhi' },
    state: { type: String, default: 'Delhi' },
    pincode: { type: String, required: true }
  },
  deliveryType: {
    type: String,
    enum: ['normal', 'fast'],
    default: 'normal'
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'razorpay', 'upi', 'card'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [
    {
      status: { type: String, required: true },
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: String, default: 'System' },
      note: { type: String }
    }
  ]
}, {
  timestamps: true
});

export const Order = mongoose.model('Order', orderSchema);
