const express = require('express');
const router = express.Router();
const { getNextSet, submitAnswers } = require('../controllers/mcqController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:levelId/next-set', protect, getNextSet);
router.post('/:levelId/submit', protect, submitAnswers);

module.exports = router;
