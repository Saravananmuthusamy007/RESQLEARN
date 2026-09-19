import express from 'express';
import { getMyCertificate, verifyCertificate } from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyCertificate);
router.get('/verify/:certificateId', verifyCertificate); // Public route

export default router;
