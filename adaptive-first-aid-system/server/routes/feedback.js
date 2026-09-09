const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { submitFeedback } = require('../controllers/feedbackController');

// Optional auth helper to attach user if bearer token is present
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = decoded;
    } catch (e) {
      // Ignore token verification failure for optional auth
    }
  }
  next();
};

// Learner feedback submission
router.post('/', optionalAuth, submitFeedback);

module.exports = router;
