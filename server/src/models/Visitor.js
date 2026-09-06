import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ip: {
    type: String,
    default: '127.0.0.1'
  },
  city: {
    type: String,
    default: 'New Delhi'
  },
  region: {
    type: String,
    default: 'Delhi'
  },
  country: {
    type: String,
    default: 'India'
  },
  countryCode: {
    type: String,
    default: 'IN'
  },
  device: {
    type: String,
    enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
    default: 'Desktop'
  },
  browser: {
    type: String,
    default: 'Chrome'
  },
  os: {
    type: String,
    default: 'macOS'
  },
  currentPage: {
    type: String,
    default: '/'
  },
  referrer: {
    type: String,
    default: ''
  },
  lastActive: {
    type: Date,
    default: Date.now,
    index: true
  },
  firstSeen: {
    type: Date,
    default: Date.now
  },
  totalVisits: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

export const Visitor = mongoose.model('Visitor', visitorSchema);
