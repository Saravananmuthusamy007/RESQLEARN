import SimulationAttempt from '../models/SimulationAttempt.js';
import Level from '../models/Level.js';
import Mastery from '../models/Mastery.js';
import ActivityLog from '../models/ActivityLog.js';
import { calculatePracticalScore } from '../services/scoring/scoringEngine.js';
import { saveTelemetryBatch } from '../services/telemetry/telemetryService.js';

// @desc    Ingest simulation telemetry events & compute deterministic practical score
// @route   POST /api/simulations/complete
// @access  Private
export const completeSimulation = async (req, res) => {
  try {
    const {
      levelId,
      levelNumber,
      actionAccuracy,
      sequenceScore,
      timeScore,
      mistakes,
      criticalErrors,
      telemetryEvents,
      isDemo = false,
    } = req.body;

    const level = await Level.findOne({ levelNumber: parseInt(levelNumber, 10) });
    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found.' });
    }

    // Deterministic backend calculation
    const scoreResult = calculatePracticalScore({
      actionAccuracy,
      sequenceScore,
      timeScore,
      mistakes,
      criticalErrors,
      telemetryEvents,
      levelConfig: level.scoringConfig,
    });

    // If this is an Admin Demo Play or explicitly marked demo, do not persist to learner progress tables
    if (isDemo || req.user.role === 'admin' && req.body.demoMode) {
      return res.json({
        success: true,
        isDemo: true,
        scoring: scoreResult,
        message: 'Admin Demo Play simulation completed. No learner progress modified.',
      });
    }

    // Persist official simulation attempt for learner
    const attempt = await SimulationAttempt.create({
      learner: req.user._id,
      level: level._id,
      levelNumber: level.levelNumber,
      levelVersion: level.currentVersion || 1,
      telemetry: (telemetryEvents || []).slice(-100), // store up to 100 most recent events
      practicalScore: scoreResult.practicalScore,
      actionAccuracy: scoreResult.actionAccuracy,
      sequenceScore: scoreResult.sequenceScore,
      timeScore: scoreResult.timeScore,
      mistakes: scoreResult.mistakes,
      criticalErrors: scoreResult.criticalErrors,
      weakAreas: scoreResult.weakAreas,
      strengths: scoreResult.strengths,
      isPassed: scoreResult.isPassed,
      isDemo: false,
    });

    // Save batch telemetry time-series events in background
    if (telemetryEvents && telemetryEvents.length > 0) {
      saveTelemetryBatch({
        learnerId: req.user._id,
        levelId: level._id,
        simulationAttemptId: attempt._id,
        events: telemetryEvents,
      }).catch(err => console.error('Telemetry batch save error:', err.message));
    }

    // Update Mastery record with the attempt and highest practical score
    let mastery = await Mastery.findOne({ learner: req.user._id, levelNumber: level.levelNumber });
    if (!mastery) {
      mastery = await Mastery.create({
        learner: req.user._id,
        level: level._id,
        levelNumber: level.levelNumber,
        practicalScore: scoreResult.practicalScore,
        assessmentScore: 0,
        status: 'in_progress',
        attempts: 1,
      });
    } else {
      mastery.practicalScore = Math.max(mastery.practicalScore || 0, scoreResult.practicalScore);
      mastery.attempts = (mastery.attempts || 0) + 1;
      if (mastery.status === 'locked') mastery.status = 'in_progress';
      await mastery.save();
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'SIMULATION_COMPLETED',
      entity: 'SimulationAttempt',
      entityId: attempt._id.toString(),
      metadata: {
        levelNumber: level.levelNumber,
        score: scoreResult.practicalScore,
        isPassed: scoreResult.isPassed,
      },
    });

    res.json({
      success: true,
      attemptId: attempt._id,
      scoring: scoreResult,
      canProceedToAssessment: scoreResult.isPassed, // >= 75% threshold
    });
  } catch (err) {
    console.error('Complete simulation error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error processing simulation completion.',
    });
  }
};

// @desc    Get recent simulation attempts for a level or learner
// @route   GET /api/simulations/history/:levelNumber
// @access  Private
export const getSimulationHistory = async (req, res) => {
  try {
    const levelNumber = parseInt(req.params.levelNumber, 10);
    const attempts = await SimulationAttempt.find({
      learner: req.user._id,
      levelNumber,
      isDemo: false,
    }).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      attempts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching simulation history.',
    });
  }
};

export default {
  completeSimulation,
  getSimulationHistory,
};
