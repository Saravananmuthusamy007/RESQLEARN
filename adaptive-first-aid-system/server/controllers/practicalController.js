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
    const { actionCorrectness, targetAccuracy, sequenceCorrect, responseTimeMs } = req.body;

    if (actionCorrectness === undefined || targetAccuracy === undefined || sequenceCorrect === undefined) {
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

    // Calculate composite score using formula
    // compositeScore = (actionCorrectness * 0.4) + (targetAccuracy * 0.35) + (sequenceCorrect ? 25 : 0)
    const rawScore = (Number(actionCorrectness) * 0.4) + (Number(targetAccuracy) * 0.35) + (sequenceCorrect ? 25 : 0);
    const compositeScore = Math.min(100, Math.round(rawScore));
    const passed = compositeScore >= level.practicalThreshold;

    // Increment attempt number
    const previousAttemptsCount = await PracticalAttempt.countDocuments({ user: userId, level: levelId });
    const attemptNumber = previousAttemptsCount + 1;

    // Create attempt record
    const attempt = new PracticalAttempt({
      user: userId,
      level: levelId,
      actionCorrectness: Number(actionCorrectness),
      targetAccuracy: Number(targetAccuracy),
      sequenceCorrect: Boolean(sequenceCorrect),
      responseTimeMs: Number(responseTimeMs || 0),
      attemptNumber,
      compositeScore,
      passed
    });

    await attempt.save();

    // Update Progress model if passed
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

    // Build sub-metric targeted feedback
    const feedback = [];
    if (!sequenceCorrect) {
      feedback.push('Protocol Sequence Error: Steps were performed out of order. Review step-by-step action guidelines.');
    }
    if (Number(actionCorrectness) < 80) {
      feedback.push(`Action Precision Low (${actionCorrectness}%): Focus on proper technique depth and chest compression rates.`);
    }
    if (Number(targetAccuracy) < 80) {
      feedback.push(`Target Positioning Inaccurate (${targetAccuracy}%): Ensure exact hand/pad placement on target anatomical zones.`);
    }
    if (responseTimeMs > 60000) {
      feedback.push(`Execution Slow (${Math.round(responseTimeMs / 1000)}s): Practice rapid emergency response protocols.`);
    }
    if (feedback.length === 0 && passed) {
      feedback.push('Excellent Performance! You demonstrated accurate technique, precise target positioning, and correct sequence timing.');
    }

    res.status(201).json({
      attempt,
      passed,
      compositeScore,
      practicalThreshold: level.practicalThreshold,
      feedback,
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
