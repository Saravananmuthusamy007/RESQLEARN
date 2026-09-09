const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getMetrics,
  getLearners,
  getLearnerAnalytics,
  toggleMasterCertificate,
  resetLearnerProgress,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getUsers,
  getFeedbackList,
  updateFeedbackStatus,
  getProgressionAnalytics
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Dashboard & Aggregation Metrics
router.get('/metrics', protect, adminOnly, getMetrics);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/analytics/progression', protect, adminOnly, getProgressionAnalytics);

// Feedback Inbox & Moderation
router.get('/feedback', protect, adminOnly, getFeedbackList);
router.put('/feedback/:id', protect, adminOnly, updateFeedbackStatus);

// Learners Roster & Management
router.get('/learners', protect, adminOnly, getLearners);
router.get('/learners/:id/analytics', protect, adminOnly, getLearnerAnalytics);
router.put('/learners/:id/certificate', protect, adminOnly, toggleMasterCertificate);
router.post('/learners/:id/reset-progress', protect, adminOnly, resetLearnerProgress);
router.get('/users', protect, adminOnly, getUsers);

// Question Bank CRUD Operations
router.get('/questions', protect, adminOnly, getQuestions);
router.post('/questions', protect, adminOnly, createQuestion);
router.put('/questions/:id', protect, adminOnly, updateQuestion);
router.delete('/questions/:id', protect, adminOnly, deleteQuestion);

module.exports = router;
