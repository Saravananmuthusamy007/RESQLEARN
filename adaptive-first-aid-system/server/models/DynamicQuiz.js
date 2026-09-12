const mongoose = require('mongoose');

const dynamicQuestionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [(val) => val.length === 4, 'Must have exactly 4 options']
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  difficulty: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced'],
    required: true
  },
  clinicalRationale: {
    type: String,
    required: true
  }
}, { _id: false });

const dynamicQuizSchema = new mongoose.Schema({
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
  levelOrder: {
    type: Number,
    required: true
  },
  simulationScore: {
    type: Number,
    required: true
  },
  simulationAttempt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticalAttempt'
  },
  weakTags: [{
    type: String
  }],
  difficultyTier: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced'],
    required: true
  },
  questions: {
    type: [dynamicQuestionSchema],
    required: true,
    validate: [(val) => val.length === 5, 'Must have exactly 5 questions']
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically expire after 24 hours
  }
});

// Index for quick lookup of active quiz by user and level
dynamicQuizSchema.index({ user: 1, level: 1, isCompleted: 1 });

module.exports = mongoose.model('DynamicQuiz', dynamicQuizSchema);
