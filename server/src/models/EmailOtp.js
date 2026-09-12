import mongoose from 'mongoose';

const emailOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otpHash: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['registration', 'login', 'password-reset', 'email-verification'],
    default: 'registration'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Automatic MongoDB TTL cleanup upon expiration
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  lastSentAt: {
    type: Date,
    default: Date.now
  },
  userData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

export const EmailOtp = mongoose.model('EmailOtp', emailOtpSchema);
