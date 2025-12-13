import mongoose from 'mongoose';

const tutorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  university: {
    type: String,
    required: [true, 'University is required']
  },
  major: {
    type: String,
    required: [true, 'Major is required']
  },
  year: {
    type: String,
    required: [true, 'Year is required'],
    enum: ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'خريج']
  },
  teachingSubjects: [{
    type: String,
    required: true
  }],
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [20, 'Hourly rate must be at least 20 EGP'],
    max: [500, 'Hourly rate cannot exceed 500 EGP']
  },
  tutorBio: {
    type: String,
    maxlength: [1000, 'Tutor bio cannot exceed 1000 characters']
  },
  availability: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  completedSessions: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for searching
tutorSchema.index({ teachingSubjects: 1, hourlyRate: 1, rating: -1 });

const Tutor = mongoose.model('Tutor', tutorSchema);

export default Tutor;
