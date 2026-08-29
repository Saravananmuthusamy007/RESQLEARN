const express = require('express');
const router = express.Router();
const { getMasterCertificate, getCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

// Master First-Aid Completion Certificate (when ALL levels completed)
router.get('/master', protect, getMasterCertificate);

// Fallback level certificate endpoint
router.get('/:levelId', protect, getCertificate);

module.exports = router;
