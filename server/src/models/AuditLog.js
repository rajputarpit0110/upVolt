import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'PRODUCT_ADDED',
      'PRODUCT_UPDATED',
      'PRODUCT_DELETED',
      'ORDER_STATUS_UPDATED',
      'ADMIN_PASSWORD_RESET',
      'MENTOR_ADDED',
      'MENTOR_DELETED',
      'COUPON_CREATED',
      'COUPON_DELETED',
      'REEL_CREATED',
      'REEL_DELETED',
      'DELIVERY_SETTINGS_UPDATED'
    ],
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  adminRole: {
    type: String,
    enum: ['admin', 'master_admin'],
    required: true
  },
  adminUsername: {
    type: String,
    default: ''
  },
  targetType: {
    type: String,
    enum: ['Product', 'Order', 'User', 'System', 'Mentor', 'Coupon', 'Reel', 'Settings'],
    required: true
  },
  targetId: {
    type: String
  },
  targetName: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
