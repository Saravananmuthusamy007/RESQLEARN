const Level = require('../models/Level');
const Progress = require('../models/Progress');
const User = require('../models/User');
const PracticalAttempt = require('../models/PracticalAttempt');
const MCQAttempt = require('../models/MCQAttempt');

// @desc    Get Master First-Aid Completion Certificate data (awarded when ALL levels are completed)
// @route   GET /api/certificate/master
// @access  Private (Learner & Admin)
exports.getMasterCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('name email avatar role createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allLevels = await Level.find().sort({ order: 1 });
    const totalLevels = allLevels.length;

    if (totalLevels === 0) {
      return res.status(404).json({ message: 'No training levels found in system' });
    }

    const userProgressList = await Progress.find({ user: userId });
    const completedProgressList = userProgressList.filter(p => p.levelCompleted);
    const completedLevelsCount = completedProgressList.length;

    const isEligible = completedLevelsCount >= totalLevels && totalLevels > 0;

    // Detailed per-level status for progress tracking inside certificate module
    const levelStatuses = allLevels.map(lvl => {
      const prog = userProgressList.find(p => p.level.toString() === lvl._id.toString());
      return {
        id: lvl._id,
        order: lvl.order,
        title: lvl.title,
        isCompleted: !!(prog && prog.levelCompleted),
        practicalPassed: !!(prog && prog.practicalPassed),
        mcqPassed: !!(prog && prog.mcqPassed)
      };
    });

    if (!isEligible) {
      return res.json({
        isEligible: false,
        learnerName: user.name,
        learnerEmail: user.email,
        avatar: user.avatar,
        completedLevelsCount,
        totalLevelsCount: totalLevels,
        levelStatuses,
        message: `You have completed ${completedLevelsCount} out of ${totalLevels} levels. Complete all levels to unlock your Master Certificate of Completion!`
      });
    }

    // Calculate aggregated master scores across all levels
    const practicalAttempts = await PracticalAttempt.find({ user: userId, passed: true });
    const mcqAttempts = await MCQAttempt.find({ user: userId, passed: true });

    let totalPracticalScore = 0;
    practicalAttempts.forEach(pa => { totalPracticalScore += (pa.compositeScore || 85); });
    const avgPracticalScore = practicalAttempts.length > 0 ? Math.round(totalPracticalScore / practicalAttempts.length) : 85;

    let totalMcqScore = 0;
    mcqAttempts.forEach(ma => { totalMcqScore += (ma.score || 80); });
    const avgMcqScore = mcqAttempts.length > 0 ? Math.round(totalMcqScore / mcqAttempts.length) : 80;

    // Master completion timestamp (latest completed progress date)
    const latestCompletionDate = completedProgressList.reduce((latest, curr) => {
      const currDate = curr.completedAt ? new Date(curr.completedAt) : new Date();
      return currDate > latest ? currDate : latest;
    }, new Date(0));

    const masterCompletedAt = latestCompletionDate.getTime() > 0 ? latestCompletionDate : new Date();
    const verificationCode = `CERT-FA-MASTER-${userId.toString().substring(18).toUpperCase()}-${masterCompletedAt.getTime().toString(36).toUpperCase()}`;

    res.json({
      isEligible: true,
      learnerName: user.name,
      learnerEmail: user.email,
      avatar: user.avatar,
      title: 'Master Certificate of First-Aid Proficiency & Emergency Response',
      completedLevelsCount,
      totalLevelsCount: totalLevels,
      completedAt: masterCompletedAt,
      verificationCode,
      practicalScore: avgPracticalScore,
      mcqScore: avgMcqScore,
      levelStatuses,
      issuer: 'Adaptive First-Aid Certification Board & Emergency Medical Council'
    });
  } catch (error) {
    console.error('Error generating master certificate:', error.message);
    res.status(500).json({ message: 'Server error generating master certificate' });
  }
};

// @desc    Get level certificate data (fallback / level view)
// @route   GET /api/certificate/:levelId
// @access  Private (Learner & Admin)
exports.getCertificate = async (req, res) => {
  try {
    const { levelId } = req.params;
    
    if (levelId === 'master') {
      return exports.getMasterCertificate(req, res);
    }

    const userId = req.user.id;
    const level = await Level.findById(levelId);

    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const progress = await Progress.findOne({ user: userId, level: levelId });
    if (!progress || !progress.levelCompleted) {
      return res.status(403).json({ message: 'You have not completed both practical and MCQ assessments for this level yet.' });
    }

    const user = await User.findById(userId).select('name email avatar');
    const practical = await PracticalAttempt.findOne({ user: userId, level: levelId, passed: true }).sort({ createdAt: -1 });
    const mcq = await MCQAttempt.findOne({ user: userId, level: levelId, passed: true }).sort({ createdAt: -1 });

    const verificationCode = `CERT-FA-LVL${level.order}-${userId.toString().substring(18).toUpperCase()}-${(progress.completedAt ? new Date(progress.completedAt).getTime() : Date.now()).toString(36).toUpperCase()}`;

    res.json({
      learnerName: user.name,
      learnerEmail: user.email,
      avatar: user.avatar,
      levelTitle: level.title,
      order: level.order,
      completedAt: progress.completedAt || new Date(),
      verificationCode,
      practicalScore: practical ? practical.compositeScore : 85,
      mcqScore: mcq ? mcq.score : 80,
      issuer: 'Adaptive First-Aid Certification Board'
    });
  } catch (error) {
    console.error('Error issuing level certificate:', error.message);
    res.status(500).json({ message: 'Server error generating certificate' });
  }
};
