const mongoose = require('mongoose');
const PracticalAttempt = require('../models/PracticalAttempt');
const Level = require('../models/Level');
const Progress = require('../models/Progress');
const { evaluatePracticalSimulation } = require('../services/geminiEvaluator');

// @desc    Submit practical simulation attempt data & evaluate with Gemini
// @route   POST /api/practical/:levelId/attempt or POST /api/practical/attempt
// @access  Private (Learner & Admin)
exports.submitAttempt = async (req, res) => {
  try {
    const rawLevelId = req.params.levelId || req.body.levelId;
    const userId = req.user.id;

    const {
      actions = [],
      metrics: inputMetrics,
      actionCorrectness: rawActionCorr,
      targetAccuracy: rawTargetAcc,
      sequenceCorrect,
      sequenceAccuracy: rawSeqAcc,
      responseTimeMs,
      mistakes = 0,
      attempts: rawAttempts = 1,
      finalScore: inputFinalScore,
      weakAreas = []
    } = req.body;

    // Resolve Level document either by MongoDB ObjectId or numeric order
    let level = null;
    if (rawLevelId && mongoose.Types.ObjectId.isValid(rawLevelId)) {
      level = await Level.findById(rawLevelId);
    }
    if (!level && rawLevelId) {
      const orderNum = Number(rawLevelId);
      if (!isNaN(orderNum)) {
        level = await Level.findOne({ order: orderNum });
      }
    }

    if (!level) {
      return res.status(404).json({ message: `Level not found for identifier: ${rawLevelId}` });
    }

    const levelDocId = level._id;

    // Verify level is unlocked for user (or user is admin)
    if (req.user.role !== 'admin') {
      const userProgress = await Progress.findOne({ user: userId, level: levelDocId });
      if (!userProgress || !userProgress.unlocked) {
        return res.status(403).json({ message: 'Level is locked. Complete previous level first.' });
      }
    }

    // Prepare structured telemetry metrics
    const resolvedMetrics = {
      totalResponseTime: inputMetrics?.totalResponseTime !== undefined
        ? Number(inputMetrics.totalResponseTime)
        : (responseTimeMs ? Number((responseTimeMs / 1000).toFixed(1)) : 20),
      attempts: inputMetrics?.attempts !== undefined
        ? Number(inputMetrics.attempts)
        : Number(rawAttempts || 1),
      sequenceErrors: inputMetrics?.sequenceErrors !== undefined
        ? Number(inputMetrics.sequenceErrors)
        : (sequenceCorrect === false ? 1 : 0),
      incorrectTargets: inputMetrics?.incorrectTargets !== undefined
        ? Number(inputMetrics.incorrectTargets)
        : Number(mistakes || 0)
    };

    // Evaluate telemetry using Google Gemini API (@google/genai) with clinical fallback
    const evaluation = await evaluatePracticalSimulation({
      levelId: level.order,
      actions,
      metrics: resolvedMetrics,
      level
    });

    const PASS_THRESHOLD = 75;
    const practicalThreshold = Number(level.practicalThreshold) || PASS_THRESHOLD;
    const compositeScore = inputFinalScore !== undefined
      ? Math.round(Number(inputFinalScore))
      : evaluation.compositeScore;
    const passed = compositeScore >= practicalThreshold;

    // Increment attempt count in DB
    const previousAttemptsCount = await PracticalAttempt.countDocuments({ user: userId, level: levelDocId });
    const attemptNumber = previousAttemptsCount + 1;

    // Merge identified weak areas
    const combinedWeakAreas = [
      ...new Set([
        ...(Array.isArray(weakAreas) ? weakAreas : []),
        ...(Array.isArray(evaluation.weakAreas) ? evaluation.weakAreas : [])
      ])
    ];

    // Create attempt record with full telemetry & Gemini evaluation details
    const attempt = new PracticalAttempt({
      user: userId,
      level: levelDocId,
      actionCorrectness: evaluation.actionAccuracyScore ?? (rawActionCorr !== undefined ? Number(rawActionCorr) : 80),
      targetAccuracy: evaluation.targetAccuracyScore ?? (rawTargetAcc !== undefined ? Number(rawTargetAcc) : 80),
      sequenceCorrect: evaluation.sequenceScore >= 75,
      sequenceAccuracy: evaluation.sequenceScore,
      responseTimeMs: Math.round(resolvedMetrics.totalResponseTime * 1000),
      attemptNumber,
      mistakes: resolvedMetrics.incorrectTargets,
      attempts: resolvedMetrics.attempts,
      compositeScore,
      finalScore: compositeScore,
      passed,
      weakAreas: combinedWeakAreas,
      actions: actions.map(a => ({
        step: a.step || a.action,
        target: a.target || 'target_zone',
        action: a.action || a.step,
        timestamp: a.timestamp || Date.now(),
        correct: a.correct !== false,
        targetAccuracy: a.targetAccuracy || 100,
        feedback: a.feedback || '',
        details: a.details || null
      })),
      metrics: resolvedMetrics,
      geminiEvaluation: {
        clinicalCritique: evaluation.clinicalCritique,
        remediation: evaluation.remediation,
        recommendedDifficulty: evaluation.recommendedMCQDifficulty,
        difficultyMix: evaluation.difficultyMix,
        recommendedFocusTags: evaluation.recommendedFocusTags,
        aiEvaluated: evaluation.aiEvaluated
      }
    });

    await attempt.save();

    // Update Progress model
    let progress = await Progress.findOne({ user: userId, level: levelDocId });
    if (!progress) {
      progress = new Progress({
        user: userId,
        level: levelDocId,
        unlocked: true
      });
    }

    if (passed) {
      progress.practicalPassed = true;
    }
    await progress.save();

    res.status(201).json({
      attempt,
      passed,
      compositeScore,
      finalScore: compositeScore,
      practicalThreshold,
      clinicalCritique: evaluation.clinicalCritique,
      remediation: evaluation.remediation,
      feedback: [evaluation.clinicalCritique],
      weakAreas: combinedWeakAreas,
      recommendedMCQDifficulty: evaluation.recommendedMCQDifficulty,
      difficultyMix: evaluation.difficultyMix,
      recommendedFocusTags: evaluation.recommendedFocusTags,
      aiEvaluated: evaluation.aiEvaluated,
      practicalPassed: progress.practicalPassed
    });
  } catch (error) {
    console.error('Error submitting practical attempt with Gemini evaluation:', error.message);
    res.status(500).json({ message: 'Server error processing simulation attempt' });
  }
};

// @desc    Get attempt history for learner on specific level
// @route   GET /api/practical/:levelId/attempts
// @access  Private (Learner & Admin)
exports.getAttemptHistory = async (req, res) => {
  try {
    const { levelId } = req.params;
    const userId = req.user.id;

    let targetLevelId = levelId;
    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      const orderNum = Number(levelId);
      if (!isNaN(orderNum)) {
        const found = await Level.findOne({ order: orderNum });
        if (found) targetLevelId = found._id;
      }
    }

    const attempts = await PracticalAttempt.find({ user: userId, level: targetLevelId }).sort({ attemptNumber: 1 });
    res.json(attempts);
  } catch (error) {
    console.error('Error fetching practical attempts history:', error.message);
    res.status(500).json({ message: 'Server error fetching attempt history' });
  }
};
