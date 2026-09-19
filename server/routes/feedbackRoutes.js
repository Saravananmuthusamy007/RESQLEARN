import express from 'express';
import { submitFeedback, getAllFeedback } from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, submitFeedback);
router.get('/', protect, authorize('admin'), getAllFeedback);

export default router;
