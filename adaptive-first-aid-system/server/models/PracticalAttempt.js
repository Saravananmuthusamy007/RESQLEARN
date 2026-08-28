const mongoose = require('mongoose');

const practicalAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  actionCorrectness: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  targetAccuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  sequenceCorrect: {
    type: Boolean,
    default: true
  },
  sequenceAccuracy: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  responseTimeMs: {
    type: Number,
    required: true,
    default: 0
  },
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
  },
  mistakes: {
    type: Number,
    default: 0
  },
  attempts: {
    type: Number,
    default: 1
  },
  compositeScore: {
    type: Number,
    required: true
  },
  finalScore: {
    type: Number
  },
  passed: {
    type: Boolean,
    required: true
  },
  weakAreas: [
    {
      type: String
    }
  ],
  actions: [
    {
      action: String,
      timestamp: Number,
      correct: Boolean,
      targetAccuracy: Number,
      feedback: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PracticalAttempt', practicalAttemptSchema);
