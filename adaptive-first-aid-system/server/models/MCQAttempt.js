const mongoose = require('mongoose');

const mcqAttemptSchema = new mongoose.Schema({
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
  questions: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedOption: {
      type: Number,
      required: true
    },
    correct: {
      type: Boolean,
      required: true
    },
    tagsFromQuestion: [{
      type: String
    }]
  }],
  score: {
    type: Number,
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
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

module.exports = mongoose.model('MCQAttempt', mcqAttemptSchema);
