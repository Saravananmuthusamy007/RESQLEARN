const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  order: {
    type: Number,
    required: true,
    unique: true
  },
  videoUrl: {
    type: String
  },
  instructions: [{
    type: String
  }],
  practicalThreshold: {
    type: Number,
    default: 75
  },
  mcqThreshold: {
    type: Number,
    default: 70
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Level', levelSchema);
