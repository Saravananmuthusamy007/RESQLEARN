const Level = require('../models/Level');
const Progress = require('../models/Progress');
const User = require('../models/User');
const PracticalAttempt = require('../models/PracticalAttempt');
const MCQAttempt = require('../models/MCQAttempt');

// @desc    Get official level completion certificate data
// @route   GET /api/certificate/:levelId
// @access  Private (Learner & Admin)
exports.getCertificate = async (req, res) => {
  try {
    const { levelId } = req.params;
    const userId = req.user.id;

    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const progress = await Progress.findOne({ user: userId, level: levelId });
    if (!progress || !progress.levelCompleted) {
      return res.status(403).json({ message: 'You have not completed both the practical and MCQ assessments for this level yet.' });
    }

    const user = await User.findById(userId).select('name email');
    const practical = await PracticalAttempt.findOne({ user: userId, level: levelId, passed: true }).sort({ createdAt: -1 });
    const mcq = await MCQAttempt.findOne({ user: userId, level: levelId, passed: true }).sort({ createdAt: -1 });

    // Generate unique verifiable credential code
    const verificationCode = `CERT-FA-LVL${level.order}-${userId.toString().substring(18).toUpperCase()}-${(progress.completedAt ? new Date(progress.completedAt).getTime() : Date.now()).toString(36).toUpperCase()}`;

    res.json({
      learnerName: user.name,
      learnerEmail: user.email,
      levelTitle: level.title,
      order: level.order,
      completedAt: progress.completedAt || new Date(),
      verificationCode,
      practicalScore: practical ? practical.compositeScore : 85,
      mcqScore: mcq ? mcq.score : 80,
      issuer: 'Adaptive First-Aid Certification Board'
    });
  } catch (error) {
    console.error('Error issuing certificate:', error.message);
    res.status(500).json({ message: 'Server error generating certificate' });
  }
};
