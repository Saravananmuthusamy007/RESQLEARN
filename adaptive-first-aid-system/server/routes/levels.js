const express = require('express');
const router = express.Router();
const { getLevels, getLevelById, createLevel, updateLevel, deleteLevel } = require('../controllers/levelController');
const { generateDynamicQuizHandler, submitDynamicQuizHandler } = require('../controllers/dynamicQuizController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Protected routes (Learners & Admins)
router.get('/', protect, getLevels);
router.get('/:id', protect, getLevelById);

// Dynamic Gemini-driven MCQ Generation & Grading Lifecycle
router.post('/:levelId/generate-dynamic-quiz', protect, generateDynamicQuizHandler);
router.post('/:levelId/submit-dynamic-quiz', protect, submitDynamicQuizHandler);

// Admin-only routes
router.post('/', protect, authorize('admin'), createLevel);
router.put('/:id', protect, authorize('admin'), updateLevel);
router.delete('/:id', protect, authorize('admin'), deleteLevel);

module.exports = router;
