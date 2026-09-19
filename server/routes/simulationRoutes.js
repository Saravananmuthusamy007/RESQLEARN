import express from 'express';
import { completeSimulation, getSimulationHistory } from '../controllers/simulationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/complete', protect, completeSimulation);
router.get('/history/:levelNumber', protect, getSimulationHistory);

export default router;
