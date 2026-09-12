import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  badge: { type: String, default: null },
  inStock: { type: Boolean, default: true },
  sku: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  images: [{ type: String }],
  description: { type: String, required: true },
  specifications: { type: Map, of: String },
  tags: [{ type: String }],
  perfectFor: [{ type: String }],
  youtubeUrl: { type: String, default: null },
  researchUrl: { type: String, default: null },
  datasheetUrl: { type: String, default: null },
  documentationUrl: { type: String, default: null },
  howToUse: {
    overview: { type: String },
    steps: [{ type: String }],
    pinoutSummary: { type: String },
    sampleCode: { type: String }
  },
  whereToUse: [{
    title: { type: String },
    description: { type: String },
    category: { type: String }
  }],
  safetyPrecautions: [{ type: String }],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  addedByName: {
    type: String,
    default: 'upVolt Admin'
  },
  addedByEmail: {
    type: String
  },
  addedByUsername: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

// High performance indexes for 10,000+ concurrent users scaling
productSchema.index({ category: 1, price: 1 });
productSchema.index({ category: 1, rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ badge: 1 });

// Guard: Disallow storing raw Base64 images in MongoDB to preserve bandwidth & DB limits
productSchema.pre('save', async function () {
  if (this.image && typeof this.image === 'string' && this.image.startsWith('data:image')) {
    throw new Error('Raw Base64 images cannot be saved directly to MongoDB. Upload to Cloudinary first.');
  }
  if (Array.isArray(this.images)) {
    for (const img of this.images) {
      if (typeof img === 'string' && img.startsWith('data:image')) {
        throw new Error('Raw Base64 images cannot be saved in product gallery. Upload to Cloudinary first.');
      }
    }
  }
});

export const Product = mongoose.model('Product', productSchema);
