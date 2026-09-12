const express = require('express');
const router = express.Router();
const { getMasterCertificate, getCertificate, getUserCertificates } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

// Get all earned certificates for a user (individual levels + master)
router.get('/user/:userId', protect, getUserCertificates);

// Master First-Aid Completion Certificate (when ALL levels completed)
router.get('/master', protect, getMasterCertificate);

// Fallback level certificate endpoint
router.get('/:levelId', protect, getCertificate);

module.exports = router;
