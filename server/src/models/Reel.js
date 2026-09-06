import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Reel title is required'],
    trim: true
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL or path is required'],
    trim: true
  },
  components: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Beginner Friendly', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  likes: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addedByName: {
    type: String,
    default: 'upVolt Core'
  },
  addedByUsername: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const Reel = mongoose.model('Reel', reelSchema);
