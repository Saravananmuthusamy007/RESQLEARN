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
    required: true
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
  compositeScore: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PracticalAttempt', practicalAttemptSchema);
