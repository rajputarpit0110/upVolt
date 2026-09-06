import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'global'
  },
  deliverySettings: {
    normalDeliveryFee: {
      type: Number,
      default: 40
    },
    fastDeliveryFee: {
      type: Number,
      default: 99
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 499
    },
    normalDeliveryNote: {
      type: String,
      default: 'Standard Delivery (2-3 Days across Delhi)'
    },
    fastDeliveryNote: {
      type: String,
      default: 'Express Superfast Delivery (Within 24 Hours)'
    }
  },
  statsSettings: {
    type: [
      {
        id: { type: String, default: 'stat-1' },
        icon: { type: String, default: 'users' },
        number: { type: String, default: '5000+' },
        label: { type: String, default: 'Students Trust Us' }
      }
    ],
    default: [
      { id: 'stat-1', icon: 'users', number: '5000+', label: 'Students Trust Us' },
      { id: 'stat-2', icon: 'graduation', number: '100+', label: 'Colleges Reached' },
      { id: 'stat-3', icon: 'package', number: '1000+', label: 'Products Delivered' },
      { id: 'stat-4', icon: 'heart', number: '4.8/5', label: 'Student Satisfaction' }
    ]
  }
}, { timestamps: true });

export const Settings = mongoose.model('Settings', settingsSchema);
