const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/questions', protect, adminOnly, getQuestions);
router.post('/questions', protect, adminOnly, createQuestion);
router.put('/questions/:id', protect, adminOnly, updateQuestion);
router.delete('/questions/:id', protect, adminOnly, deleteQuestion);

module.exports = router;
