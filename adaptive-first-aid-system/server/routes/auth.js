const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../middleware/validators');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', authLimiter, registerValidator, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, loginValidator, login);

// @route   POST /api/auth/forgot-password
// @desc    Verify email for password reset
// @access  Public
router.post('/forgot-password', authLimiter, forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password with new password
// @access  Public
router.post('/reset-password', authLimiter, resetPassword);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, getMe);

module.exports = router;

