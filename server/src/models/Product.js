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
    default: 'CampusCircuit Admin'
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

export const Product = mongoose.model('Product', productSchema);
