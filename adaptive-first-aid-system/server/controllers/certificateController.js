const Level = require('../models/Level');
const Progress = require('../models/Progress');
const User = require('../models/User');
const PracticalAttempt = require('../models/PracticalAttempt');
const MCQAttempt = require('../models/MCQAttempt');
const Certificate = require('../models/Certificate');

// Helper to issue or update Certificate in MongoDB
const upsertCertificateRecord = async ({
  userId,
  userName,
  userEmail,
  levelId,
  levelTitle,
  order,
  verificationCode,
  practicalScore,
  mcqScore,
  issuer,
  completedAt
}) => {
  try {
    let cert = await Certificate.findOne({ user: userId, levelId });
    if (!cert) {
      cert = new Certificate({
        user: userId,
        userName,
        userEmail,
        levelId,
        levelTitle,
        order,
        verificationCode,
        practicalScore,
        mcqScore,
        issuer,
        completedAt: completedAt || new Date()
      });
      await cert.save();
    }
    return cert;
  } catch (err) {
    console.error('Error upserting certificate in MongoDB:', err.message);
    return null;
  }
};

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
    const issuer = 'Adaptive First-Aid Certification Board & Emergency Medical Council';

    // Store in MongoDB
    await upsertCertificateRecord({
      userId,
      userName: user.name,
      userEmail: user.email,
      levelId: 'master',
      levelTitle: 'Master Certificate of First-Aid Proficiency & Emergency Response',
      order: 99,
      verificationCode,
      practicalScore: avgPracticalScore,
      mcqScore: avgMcqScore,
      issuer,
      completedAt: masterCompletedAt
    });

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
      issuer
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
    let level = null;

    if (levelId.length === 24) {
      level = await Level.findById(levelId);
    } else {
      level = await Level.findOne({ order: parseInt(levelId, 10) });
    }

    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const progress = await Progress.findOne({ user: userId, level: level._id });
    if (!progress || !progress.levelCompleted) {
      return res.status(403).json({ message: 'You have not completed both practical and MCQ assessments for this level yet.' });
    }

    const user = await User.findById(userId).select('name email avatar');
    const practical = await PracticalAttempt.findOne({ user: userId, level: level._id, passed: true }).sort({ createdAt: -1 });
    const mcq = await MCQAttempt.findOne({ user: userId, level: level._id, passed: true }).sort({ createdAt: -1 });

    const completedAt = progress.completedAt || new Date();
    const verificationCode = `CERT-FA-LVL${level.order}-${userId.toString().substring(18).toUpperCase()}-${new Date(completedAt).getTime().toString(36).toUpperCase()}`;
    const practicalScore = practical ? practical.compositeScore : 85;
    const mcqScore = mcq ? mcq.score : 80;
    const issuer = 'Adaptive First-Aid Certification Board';

    // Store in MongoDB
    await upsertCertificateRecord({
      userId,
      userName: user.name,
      userEmail: user.email,
      levelId: String(level.order),
      levelTitle: level.title,
      order: level.order,
      verificationCode,
      practicalScore,
      mcqScore,
      issuer,
      completedAt
    });

    res.json({
      learnerName: user.name,
      learnerEmail: user.email,
      avatar: user.avatar,
      levelTitle: level.title,
      order: level.order,
      levelId: String(level.order),
      completedAt,
      verificationCode,
      practicalScore,
      mcqScore,
      issuer
    });
  } catch (error) {
    console.error('Error issuing level certificate:', error.message);
    res.status(500).json({ message: 'Server error generating certificate' });
  }
};

// @desc    Get all earned certificates (individual levels 1-5 + master) for a user
// @route   GET /api/certificates/user/:userId
// @access  Private (Learner & Admin)
exports.getUserCertificates = async (req, res) => {
  try {
    const targetUserId = req.params.userId === 'me' ? req.user.id : req.params.userId;

    // Permissions check: Learner can view own certificates, Admin can view any
    if (req.user.role !== 'admin' && req.user.id !== targetUserId) {
      return res.status(403).json({ message: 'Not authorized to view these certificates' });
    }

    const user = await User.findById(targetUserId).select('name email avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Auto-sync completed levels with Certificate collection in MongoDB
    const allLevels = await Level.find().sort({ order: 1 });
    const userProgressList = await Progress.find({ user: targetUserId, levelCompleted: true });

    for (const prog of userProgressList) {
      const lvl = allLevels.find(l => l._id.toString() === prog.level.toString());
      if (lvl) {
        const practical = await PracticalAttempt.findOne({ user: targetUserId, level: lvl._id, passed: true }).sort({ createdAt: -1 });
        const mcq = await MCQAttempt.findOne({ user: targetUserId, level: lvl._id, passed: true }).sort({ createdAt: -1 });
        const completedAt = prog.completedAt || new Date();
        const verificationCode = `CERT-FA-LVL${lvl.order}-${targetUserId.toString().substring(18).toUpperCase()}-${new Date(completedAt).getTime().toString(36).toUpperCase()}`;

        await upsertCertificateRecord({
          userId: targetUserId,
          userName: user.name,
          userEmail: user.email,
          levelId: String(lvl.order),
          levelTitle: lvl.title,
          order: lvl.order,
          verificationCode,
          practicalScore: practical ? practical.compositeScore : 85,
          mcqScore: mcq ? mcq.score : 80,
          issuer: 'Adaptive First-Aid Certification Board',
          completedAt
        });
      }
    }

    // Check if master certificate is eligible
    if (allLevels.length > 0 && userProgressList.length >= allLevels.length) {
      const practicalAttempts = await PracticalAttempt.find({ user: targetUserId, passed: true });
      const mcqAttempts = await MCQAttempt.find({ user: targetUserId, passed: true });

      let totalPracticalScore = 0;
      practicalAttempts.forEach(pa => { totalPracticalScore += (pa.compositeScore || 85); });
      const avgPracticalScore = practicalAttempts.length > 0 ? Math.round(totalPracticalScore / practicalAttempts.length) : 85;

      let totalMcqScore = 0;
      mcqAttempts.forEach(ma => { totalMcqScore += (ma.score || 80); });
      const avgMcqScore = mcqAttempts.length > 0 ? Math.round(totalMcqScore / mcqAttempts.length) : 80;

      const latestDate = userProgressList.reduce((latest, curr) => {
        const currDate = curr.completedAt ? new Date(curr.completedAt) : new Date();
        return currDate > latest ? currDate : latest;
      }, new Date(0));

      const masterCompletedAt = latestDate.getTime() > 0 ? latestDate : new Date();
      const verificationCode = `CERT-FA-MASTER-${targetUserId.toString().substring(18).toUpperCase()}-${masterCompletedAt.getTime().toString(36).toUpperCase()}`;

      await upsertCertificateRecord({
        userId: targetUserId,
        userName: user.name,
        userEmail: user.email,
        levelId: 'master',
        levelTitle: 'Master Certificate of First-Aid Proficiency & Emergency Response',
        order: 99,
        verificationCode,
        practicalScore: avgPracticalScore,
        mcqScore: avgMcqScore,
        issuer: 'Adaptive First-Aid Certification Board & Emergency Medical Council',
        completedAt: masterCompletedAt
      });
    }

    // Fetch all certificates stored in MongoDB for this user
    const certificates = await Certificate.find({ user: targetUserId }).sort({ order: 1, createdAt: 1 });

    res.json({
      learner: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      count: certificates.length,
      certificates
    });
  } catch (error) {
    console.error('Error fetching user certificates:', error.message);
    res.status(500).json({ message: 'Server error fetching user certificates' });
  }
};
