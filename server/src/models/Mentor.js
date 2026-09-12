import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Mentor name is required'],
    trim: true
  },
  role: {
    type: String,
    default: 'Mentor',
    trim: true
  },
  college: {
    type: String,
    default: '',
    trim: true
  },
  bio: {
    type: String,
    required: [true, 'Mentor bio is required'],
    trim: true
  },
  image: {
    type: String,
    default: '/images/mentors/arjun_sharma.jpg'
  },
  specialties: [{
    type: String,
    trim: true
  }],
  projectsGuided: {
    type: String,
    default: '50+ student projects'
  },
  rating: {
    type: Number,
    default: 4.9
  },
  socialLinks: {
    whatsapp: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    instagram: { type: String, trim: true },
    github: { type: String, trim: true }
  },
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
  }
}, {
  timestamps: true
});

// Guard: Disallow storing raw Base64 images in MongoDB
mentorSchema.pre('save', async function () {
  if (this.image && typeof this.image === 'string' && this.image.startsWith('data:image')) {
    throw new Error('Raw Base64 images cannot be saved directly to MongoDB. Upload to Cloudinary first.');
  }
});

export const Mentor = mongoose.model('Mentor', mentorSchema);
