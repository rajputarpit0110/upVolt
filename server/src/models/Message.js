import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sender name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Sender email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxLength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxLength: [3000, 'Message cannot exceed 3000 characters']
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied'],
    default: 'unread'
  },
  ip: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for fast sorting by creation date and status filtering
messageSchema.index({ createdAt: -1 });
messageSchema.index({ status: 1 });

export const Message = mongoose.model('Message', messageSchema);
