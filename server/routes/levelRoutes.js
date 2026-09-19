import express from 'express';
import { getLevels, getLevelById, updateLevel } from '../controllers/levelController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getLevels);
router.get('/:id', protect, getLevelById);
router.put('/:id', protect, authorize('admin'), updateLevel);

export default router;
