const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, 'Question must have exactly 4 options']
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  tags: [{
    type: String
  }],
  explanation: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

function arrayLimit(val) {
  return val.length === 4;
}

module.exports = mongoose.model('Question', questionSchema);
