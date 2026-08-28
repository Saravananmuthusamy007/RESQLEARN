const PracticalAttempt = require('../models/PracticalAttempt');
const Level = require('../models/Level');
const Progress = require('../models/Progress');

// @desc    Submit practical simulation attempt data
// @route   POST /api/practical/:levelId/attempt
// @access  Private (Learner & Admin)
exports.submitAttempt = async (req, res) => {
  try {
    const { levelId } = req.params;
    const userId = req.user.id;
    const {
      actionCorrectness,
      targetAccuracy,
      sequenceCorrect,
      sequenceAccuracy: rawSeqAcc,
      responseTimeMs,
      mistakes = 0,
      attempts = 1,
      finalScore: inputFinalScore,
      weakAreas = [],
      actions = []
    } = req.body;

    if (actionCorrectness === undefined || targetAccuracy === undefined) {
      return res.status(400).json({ message: 'Missing required simulation attempt parameters.' });
    }

    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    // Verify level is unlocked for user (or user is admin)
    if (req.user.role !== 'admin') {
      const userProgress = await Progress.findOne({ user: userId, level: levelId });
      if (!userProgress || !userProgress.unlocked) {
        return res.status(403).json({ message: 'Level is locked. Complete previous level first.' });
      }
    }

    const seqAcc = rawSeqAcc !== undefined ? Number(rawSeqAcc) : (sequenceCorrect ? 100 : 50);
    const seqBool = sequenceCorrect !== undefined ? Boolean(sequenceCorrect) : (seqAcc >= 80);

    // Calculate response time score (100 if < 30s, decreasing to 0 at 120s)
    const respTimeSec = Number(responseTimeMs || 0) / 1000;
    const timeScore = Math.max(0, Math.min(100, 100 - (respTimeSec - 30) * (100 / 90)));

    // Calculate attempt score
    const attemptScore = Math.max(20, 100 - (Number(attempts) - 1) * 20);

    // Weighted Score: action (30%), target (25%), sequence (20%), time (15%), attempt (10%)
    const calculatedScore = Math.round(
      (Number(actionCorrectness) * 0.30) +
      (Number(targetAccuracy) * 0.25) +
      (seqAcc * 0.20) +
      (timeScore * 0.15) +
      (attemptScore * 0.10)
    );

    const compositeScore = inputFinalScore !== undefined ? Math.round(Number(inputFinalScore)) : calculatedScore;
    const practicalThreshold = level.practicalThreshold || 75;
    const passed = compositeScore >= practicalThreshold;

    // Increment attempt count in DB
    const previousAttemptsCount = await PracticalAttempt.countDocuments({ user: userId, level: levelId });
    const attemptNumber = previousAttemptsCount + 1;

    // Identify weak areas if not passed from client
    const derivedWeakAreas = [...weakAreas];
    if (Number(targetAccuracy) < 60 && !derivedWeakAreas.includes('Target identification')) {
      derivedWeakAreas.push('Target identification');
    }
    if (seqAcc < 60 && !derivedWeakAreas.includes('Action sequence')) {
      derivedWeakAreas.push('Action sequence');
    }
    if (Number(actionCorrectness) < 70 && !derivedWeakAreas.includes('Procedure accuracy')) {
      derivedWeakAreas.push('Procedure accuracy');
    }

    // Create attempt record
    const attempt = new PracticalAttempt({
      user: userId,
      level: levelId,
      actionCorrectness: Number(actionCorrectness),
      targetAccuracy: Number(targetAccuracy),
      sequenceCorrect: seqBool,
      sequenceAccuracy: seqAcc,
      responseTimeMs: Number(responseTimeMs || 0),
      attemptNumber,
      mistakes: Number(mistakes),
      attempts: Number(attempts),
      compositeScore,
      finalScore: compositeScore,
      passed,
      weakAreas: derivedWeakAreas,
      actions
    });

    await attempt.save();

    // Update Progress model
    let progress = await Progress.findOne({ user: userId, level: levelId });
    if (!progress) {
      progress = new Progress({
        user: userId,
        level: levelId,
        unlocked: true
      });
    }

    if (passed) {
      progress.practicalPassed = true;
    }
    await progress.save();

    // Feedback messages
    const feedback = [];
    if (!seqBool) {
      feedback.push('Sequence Error: Follow the correct step order for emergency response.');
    }
    if (Number(actionCorrectness) < 80) {
      feedback.push(`Action Precision Low (${actionCorrectness}%): Focus on proper technique execution.`);
    }
    if (Number(targetAccuracy) < 80) {
      feedback.push(`Target Positioning Inaccurate (${targetAccuracy}%): Place hands/equipment on exact target zones.`);
    }
    if (feedback.length === 0 && passed) {
      feedback.push('Outstanding Performance! Excellent technique, accuracy, and procedure timing.');
    }

    res.status(201).json({
      attempt,
      passed,
      compositeScore,
      finalScore: compositeScore,
      practicalThreshold,
      feedback,
      weakAreas: derivedWeakAreas,
      practicalPassed: progress.practicalPassed
    });
  } catch (error) {
    console.error('Error submitting practical attempt:', error.message);
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

    const attempts = await PracticalAttempt.find({ user: userId, level: levelId }).sort({ attemptNumber: 1 });
    res.json(attempts);
  } catch (error) {
    console.error('Error fetching practical attempts history:', error.message);
    res.status(500).json({ message: 'Server error fetching attempt history' });
  }
};
