const express = require('express');
const router = express.Router();
const { submitAttempt, getAttemptHistory } = require('../controllers/practicalController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:levelId/attempt', protect, submitAttempt);
router.post('/attempt', protect, submitAttempt);
router.get('/:levelId/attempts', protect, getAttemptHistory);

module.exports = router;
