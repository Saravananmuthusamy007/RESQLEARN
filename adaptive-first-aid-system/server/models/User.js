const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // Do not include in queries by default
  },
  role: {
    type: String,
    enum: ['learner', 'admin'],
    default: 'learner'
  },
  avatar: {
    type: String,
    default: 'avatar-1'
  },
  phone: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: 'Passionate first-aid learner dedicated to saving lives.'
  },
  emergencyContactName: {
    type: String,
    default: ''
  },
  emergencyContactPhone: {
    type: String,
    default: ''
  },
  medicalNotes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
