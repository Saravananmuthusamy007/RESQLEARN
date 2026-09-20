import express from 'express';
import { chatWithLearner } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, chatWithLearner);

export default router;
