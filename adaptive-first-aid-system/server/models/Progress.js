const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
  unlocked: {
    type: Boolean,
    default: false
  },
  practicalPassed: {
    type: Boolean,
    default: false
  },
  mcqPassed: {
    type: Boolean,
    default: false
  },
  levelCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
});

// Compound unique index on user and level
progressSchema.index({ user: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
