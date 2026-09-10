import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    default: 'https://res.cloudinary.com/uzyiejkw/image/upload/v1789023175/upvolt/products/file_hnbypp.jpg'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdByName: {
    type: String,
    default: 'upVolt Admin'
  }
}, {
  timestamps: true
});

categorySchema.index({ order: 1, name: 1 });
categorySchema.index({ isActive: 1 });

export const Category = mongoose.model('Category', categorySchema);
