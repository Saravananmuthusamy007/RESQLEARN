const express = require('express');
const router = express.Router();
const { getCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:levelId', protect, getCertificate);

module.exports = router;
