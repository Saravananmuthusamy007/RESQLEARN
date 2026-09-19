import express from 'express';
import { getAnalytics, getLearners, getLearnerDetails } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/learners', getLearners);
router.get('/learners/:id', getLearnerDetails);

export default router;
