import express from 'express';
import { generateAssessment, submitAssessment } from '../controllers/assessmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateAssessment);
router.post('/submit', protect, submitAssessment);

export default router;
