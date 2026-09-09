const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  levelId: {
    type: String,
    enum: ['1', '2', '3', '4', '5', 'master'],
    required: true
  },
  levelTitle: {
    type: String,
    required: true
  },
  order: {
    type: Number
  },
  verificationCode: {
    type: String,
    required: true,
    unique: true
  },
  practicalScore: {
    type: Number,
    default: 85
  },
  mcqScore: {
    type: Number,
    default: 80
  },
  issuer: {
    type: String,
    default: 'Adaptive First-Aid Certification Board & Emergency Medical Council'
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only have one certificate per levelId
certificateSchema.index({ user: 1, levelId: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
