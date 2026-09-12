const User = require('../models/User');
const Level = require('../models/Level');
const Progress = require('../models/Progress');
const PracticalAttempt = require('../models/PracticalAttempt');
const MCQAttempt = require('../models/MCQAttempt');
const Question = require('../models/Question');
const Feedback = require('../models/Feedback');
const Certificate = require('../models/Certificate');

// @desc    Get system-wide analytics & aggregated metrics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
exports.getAnalytics = async (req, res) => {
  try {
    const totalLearners = await User.countDocuments({ role: 'learner' });
    const totalLevels = await Level.countDocuments({});

    // Average Practical Score
    const practicalAgg = await PracticalAttempt.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$compositeScore' }, count: { $sum: 1 } } }
    ]);
    const avgPracticalScore = practicalAgg.length > 0 ? Math.round(practicalAgg[0].avgScore) : 0;

    // Average MCQ Score
    const mcqAgg = await MCQAttempt.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$score' }, count: { $sum: 1 } } }
    ]);
    const avgMcqScore = mcqAgg.length > 0 ? Math.round(mcqAgg[0].avgScore) : 0;

    // Overall Completion Rate (% learners who completed Level 1 or all levels)
    const completedProgresses = await Progress.countDocuments({ levelCompleted: true });
    const overallCompletionRate = totalLearners > 0 ? Math.min(100, Math.round((completedProgresses / (totalLearners * (totalLevels || 1))) * 100)) : 0;

    // Per-Level Statistics Breakdown
    const levels = await Level.find().sort({ order: 1 });
    const levelStats = await Promise.all(
      levels.map(async (lvl) => {
        const completedCount = await Progress.countDocuments({ level: lvl._id, levelCompleted: true });
        const pAgg = await PracticalAttempt.aggregate([
          { $match: { level: lvl._id } },
          { $group: { _id: null, avg: { $avg: '$compositeScore' } } }
        ]);
        const mAgg = await MCQAttempt.aggregate([
          { $match: { level: lvl._id } },
          { $group: { _id: null, avg: { $avg: '$score' } } }
        ]);

        return {
          levelId: lvl._id,
          title: lvl.title,
          order: lvl.order,
          learnersCompleted: completedCount,
          avgPractical: pAgg.length > 0 ? Math.round(pAgg[0].avg) : 0,
          avgMcq: mAgg.length > 0 ? Math.round(mAgg[0].avg) : 0
        };
      })
    );

    // Common Learner Weaknesses Aggregation
    const failedPracticals = await PracticalAttempt.find({ passed: false });
    const failedMcqs = await MCQAttempt.find({ passed: false }).populate('questions.question');

    const weaknessCounts = {
      'Protocol Sequence Error': 0,
      'Action Precision Low': 0,
      'Target Positioning Inaccurate': 0,
      'Execution Slow': 0,
      'Safety & Risk Assessment': 0
    };

    failedPracticals.forEach(att => {
      if (!att.sequenceCorrect) weaknessCounts['Protocol Sequence Error'] += 1;
      if (att.actionCorrectness < 80) weaknessCounts['Action Precision Low'] += 1;
      if (att.targetAccuracy < 80) weaknessCounts['Target Positioning Inaccurate'] += 1;
      if (att.responseTimeMs > 60000) weaknessCounts['Execution Slow'] += 1;
    });

    failedMcqs.forEach(att => {
      if (att.questions) {
        att.questions.forEach(q => {
          if (!q.correct && q.tagsFromQuestion && q.tagsFromQuestion.includes('safety')) {
            weaknessCounts['Safety & Risk Assessment'] += 1;
          }
        });
      }
    });

    const commonWeaknesses = Object.entries(weaknessCounts).map(([label, count]) => ({
      label,
      count
    }));

    // Recent Attempts Log
    const recentPractical = await PracticalAttempt.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email').populate('level', 'title order');
    const recentMcq = await MCQAttempt.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email').populate('level', 'title order');

    res.json({
      totalLearners,
      totalLevels,
      overallCompletionRate,
      avgPracticalScore,
      avgMcqScore,
      levelStats,
      commonWeaknesses,
      recentPractical,
      recentMcq
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error.message);
    res.status(500).json({ message: 'Server error fetching analytics data' });
  }
};

// @desc    Get all questions for admin management
// @route   GET /api/admin/questions
// @access  Private (Admin only)
exports.getQuestions = async (req, res) => {
  try {
    const { levelId, difficulty } = req.query;
    let query = {};
    if (levelId) query.level = levelId;
    if (difficulty) query.difficulty = difficulty;

    const questions = await Question.find(query).populate('level', 'title order').sort({ level: 1, createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching admin questions:', error.message);
    res.status(500).json({ message: 'Server error fetching questions' });
  }
};

// @desc    Create a new question
// @route   POST /api/admin/questions
// @access  Private (Admin only)
exports.createQuestion = async (req, res) => {
  try {
    const { level, questionText, options, correctOptionIndex, difficulty, tags, explanation } = req.body;

    if (!level || !questionText || !options || options.length !== 4 || correctOptionIndex === undefined || !difficulty) {
      return res.status(400).json({ message: 'Please provide all required fields (level, questionText, 4 options, correctOptionIndex, difficulty).' });
    }

    const newQuestion = new Question({
      level,
      questionText,
      options,
      correctOptionIndex: Number(correctOptionIndex),
      difficulty,
      tags: tags || [],
      explanation: explanation || ''
    });

    await newQuestion.save();
    const populated = await Question.findById(newQuestion._id).populate('level', 'title order');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating question:', error.message);
    res.status(500).json({ message: 'Server error creating question' });
  }
};

// @desc    Update an existing question
// @route   PUT /api/admin/questions/:id
// @access  Private (Admin only)
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionText, options, correctOptionIndex, difficulty, tags, explanation } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (questionText) question.questionText = questionText;
    if (options && options.length === 4) question.options = options;
    if (correctOptionIndex !== undefined) question.correctOptionIndex = Number(correctOptionIndex);
    if (difficulty) question.difficulty = difficulty;
    if (tags) question.tags = tags;
    if (explanation !== undefined) question.explanation = explanation;

    await question.save();
    const updated = await Question.findById(id).populate('level', 'title order');
    res.json(updated);
  } catch (error) {
    console.error('Error updating question:', error.message);
    res.status(500).json({ message: 'Server error updating question' });
  }
};

// @desc    Delete a question
// @route   DELETE /api/admin/questions/:id
// @access  Private (Admin only)
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    await question.deleteOne();
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error.message);
    res.status(500).json({ message: 'Server error deleting question' });
  }
};

// @desc    Get real-time aggregated KPI metrics for top cards
// @route   GET /api/admin/metrics
// @access  Private (Admin only)
exports.getMetrics = async (req, res) => {
  try {
    const totalLearners = await User.countDocuments({ role: 'learner' });
    const totalLevels = await Level.countDocuments({});

    // Average Practical Score aggregation pipeline
    const practicalAgg = await PracticalAttempt.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$compositeScore' },
          totalAttempts: { $sum: 1 }
        }
      }
    ]);
    const avgPracticalScore = practicalAgg.length > 0 ? Math.round(practicalAgg[0].avgScore) : 0;
    const totalPracticalAttempts = practicalAgg.length > 0 ? practicalAgg[0].totalAttempts : 0;

    // Average MCQ Quiz Score aggregation pipeline
    const mcqAgg = await MCQAttempt.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' },
          totalAttempts: { $sum: 1 }
        }
      }
    ]);
    const avgMcqScore = mcqAgg.length > 0 ? Math.round(mcqAgg[0].avgScore) : 0;
    const totalMcqAttempts = mcqAgg.length > 0 ? mcqAgg[0].totalAttempts : 0;

    // Master Certificates Issued aggregation pipeline
    // Count learners who have completed all levels in the curriculum
    const reqLevelCount = totalLevels > 0 ? totalLevels : 5;
    const masterCertAgg = await Progress.aggregate([
      { $match: { levelCompleted: true } },
      {
        $group: {
          _id: '$user',
          completedCount: { $sum: 1 }
        }
      },
      {
        $match: {
          completedCount: { $gte: reqLevelCount }
        }
      },
      {
        $count: 'issuedCount'
      }
    ]);
    const masterCertificatesIssued = masterCertAgg.length > 0 ? masterCertAgg[0].issuedCount : 0;

    // Overall Completion Rate calculation
    const completedProgresses = await Progress.countDocuments({ levelCompleted: true });
    const maxPossibleCompletions = totalLearners * reqLevelCount;
    const overallCompletionRate = maxPossibleCompletions > 0
      ? Math.min(100, Math.round((completedProgresses / maxPossibleCompletions) * 100))
      : 0;

    res.json({
      totalLearners,
      masterCertificatesIssued,
      avgPracticalScore,
      avgMcqScore,
      overallCompletionRate,
      totalLevels,
      totalPracticalAttempts,
      totalMcqAttempts
    });
  } catch (error) {
    console.error('Error calculating admin metrics:', error.message);
    res.status(500).json({ message: 'Server error computing aggregated metrics' });
  }
};

// @desc    Get learners roster with search, pagination, and progress metrics
// @route   GET /api/admin/learners
// @access  Private (Admin only)
exports.getLearners = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const totalLevels = await Level.countDocuments({});

    // Filter by learner role and optional search query on name or email
    const query = { role: 'learner' };
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const totalMatching = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const learners = await Promise.all(
      users.map(async (u) => {
        const progresses = await Progress.find({ user: u._id, levelCompleted: true });
        const practicalCount = await PracticalAttempt.countDocuments({ user: u._id, passed: true });
        const mcqCount = await MCQAttempt.countDocuments({ user: u._id, passed: true });
        const completedLevelsCount = progresses.length;
        const isMasterEligible = completedLevelsCount >= totalLevels && totalLevels > 0;

        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatar: u.avatar || 'avatar-1',
          phone: u.phone || '',
          bio: u.bio || '',
          emergencyContactName: u.emergencyContactName || '',
          emergencyContactPhone: u.emergencyContactPhone || '',
          medicalNotes: u.medicalNotes || '',
          createdAt: u.createdAt,
          completedLevelsCount,
          totalLevelsCount: totalLevels,
          practicalPassedCount: practicalCount,
          mcqPassedCount: mcqCount,
          isMasterEligible,
          masterCertificateStatus: isMasterEligible ? 'Issued' : 'In Progress'
        };
      })
    );

    res.json({
      learners,
      pagination: {
        total: totalMatching,
        page: pageNum,
        pages: Math.ceil(totalMatching / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching learners roster:', error.message);
    res.status(500).json({ message: 'Server error fetching learners roster' });
  }
};

// @desc    Get detailed analytics for a single learner
// @route   GET /api/admin/learners/:id/analytics
// @access  Private (Admin only)
exports.getLearnerAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const learner = await User.findById(id).select('-password');
    if (!learner) {
      return res.status(404).json({ message: 'Learner not found' });
    }

    const levels = await Level.find().sort({ order: 1 });
    const practicalAttempts = await PracticalAttempt.find({ user: id })
      .populate('level', 'title order practicalThreshold')
      .sort({ createdAt: -1 });

    const mcqAttempts = await MCQAttempt.find({ user: id })
      .populate('level', 'title order mcqThreshold')
      .sort({ createdAt: -1 });

    const progresses = await Progress.find({ user: id }).populate('level', 'title order');

    // Aggregate learner weaknesses
    const weakTags = {};
    practicalAttempts.forEach(pa => {
      if (!pa.sequenceCorrect) weakTags['Protocol Sequence'] = (weakTags['Protocol Sequence'] || 0) + 1;
      if (pa.actionCorrectness < 80) weakTags['Action Precision'] = (weakTags['Action Precision'] || 0) + 1;
      if (pa.targetAccuracy < 80) weakTags['Target Identification'] = (weakTags['Target Identification'] || 0) + 1;
      if (pa.responseTimeMs > 60000) weakTags['Response Speed'] = (weakTags['Response Speed'] || 0) + 1;
      if (pa.weakAreas && Array.isArray(pa.weakAreas)) {
        pa.weakAreas.forEach(w => {
          weakTags[w] = (weakTags[w] || 0) + 1;
        });
      }
    });

    res.json({
      learner: {
        id: learner._id,
        name: learner.name,
        email: learner.email,
        avatar: learner.avatar || 'avatar-1',
        role: learner.role,
        createdAt: learner.createdAt
      },
      levels,
      progresses,
      practicalAttempts,
      mcqAttempts,
      weaknesses: Object.entries(weakTags).map(([area, count]) => ({ area, count }))
    });
  } catch (error) {
    console.error('Error fetching learner analytics:', error.message);
    res.status(500).json({ message: 'Server error fetching learner analytics' });
  }
};

// @desc    Toggle Master Certificate status (Issue or Revoke) for learner
// @route   PUT /api/admin/learners/:id/certificate
// @access  Private (Admin only)
exports.toggleMasterCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'issue' | 'revoke'

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Learner not found' });
    }

    const allLevels = await Level.find().sort({ order: 1 });

    if (action === 'issue') {
      // Mark all levels as completed for this learner
      for (const lvl of allLevels) {
        let prog = await Progress.findOne({ user: id, level: lvl._id });
        if (!prog) {
          prog = new Progress({ user: id, level: lvl._id });
        }
        prog.unlocked = true;
        prog.practicalPassed = true;
        prog.mcqPassed = true;
        prog.levelCompleted = true;
        prog.completedAt = new Date();
        await prog.save();
      }

      return res.json({
        message: `Master Certificate successfully issued to ${user.name}!`,
        status: 'Issued',
        isMasterEligible: true
      });
    } else if (action === 'revoke') {
      // Revoke by marking highest level incomplete
      const highestLevel = allLevels[allLevels.length - 1];
      if (highestLevel) {
        let prog = await Progress.findOne({ user: id, level: highestLevel._id });
        if (prog) {
          prog.levelCompleted = false;
          prog.mcqPassed = false;
          await prog.save();
        }
      }

      return res.json({
        message: `Master Certificate revoked for ${user.name}.`,
        status: 'In Progress',
        isMasterEligible: false
      });
    } else {
      return res.status(400).json({ message: "Invalid action. Must be 'issue' or 'revoke'." });
    }
  } catch (error) {
    console.error('Error toggling master certificate:', error.message);
    res.status(500).json({ message: 'Server error updating certificate status' });
  }
};

// @desc    Reset learner progress and assessment attempts back to Level 1
// @route   POST /api/admin/learners/:id/reset-progress
// @access  Private (Admin only)
exports.resetLearnerProgress = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Learner not found' });
    }

    // Remove all previous progress records
    await Progress.deleteMany({ user: id });

    // Re-initialize Level 1 as the only unlocked level
    const level1 = await Level.findOne({ order: 1 });
    if (level1) {
      const newL1Progress = new Progress({
        user: id,
        level: level1._id,
        unlocked: true,
        practicalPassed: false,
        mcqPassed: false,
        levelCompleted: false
      });
      await newL1Progress.save();
    }

    // Delete practical & MCQ attempt histories to start fresh
    await PracticalAttempt.deleteMany({ user: id });
    await MCQAttempt.deleteMany({ user: id });

    res.json({
      message: `Training progress and test attempts for ${user.name} have been completely reset to Level 1.`,
      resetUser: user.name
    });
  } catch (error) {
    console.error('Error resetting learner progress:', error.message);
    res.status(500).json({ message: 'Server error resetting learner progress' });
  }
};

// @desc    Get all users (learners & admins) with profile & progress metrics (Backwards Compatibility)
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const totalLevels = await Level.countDocuments({});
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const userProfiles = await Promise.all(
      users.map(async (u) => {
        const progresses = await Progress.find({ user: u._id, levelCompleted: true });
        const practicalCount = await PracticalAttempt.countDocuments({ user: u._id, passed: true });
        const mcqCount = await MCQAttempt.countDocuments({ user: u._id, passed: true });
        const completedLevelsCount = progresses.length;
        const isMasterEligible = completedLevelsCount >= totalLevels && totalLevels > 0;

        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatar: u.avatar || 'avatar-1',
          phone: u.phone || '',
          bio: u.bio || '',
          emergencyContactName: u.emergencyContactName || '',
          emergencyContactPhone: u.emergencyContactPhone || '',
          medicalNotes: u.medicalNotes || '',
          createdAt: u.createdAt,
          completedLevelsCount,
          totalLevelsCount: totalLevels,
          practicalPassedCount: practicalCount,
          mcqPassedCount: mcqCount,
          isMasterEligible,
          masterCertificateStatus: isMasterEligible ? 'Issued' : 'In Progress'
        };
      })
    );

    res.json(userProfiles);
  } catch (error) {
    console.error('Error fetching admin users:', error.message);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// @desc    Get submitted user feedback with pagination, filtering, and search
// @route   GET /api/admin/feedback
// @access  Private (Admin only)
exports.getFeedbackList = async (req, res) => {
  try {
    const { levelId, rating, status, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (levelId && levelId !== 'all') {
      query.levelId = String(levelId);
    }

    if (rating && rating !== 'all') {
      query.rating = Number(rating);
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$or = [
        { userName: { $regex: search.trim(), $options: 'i' } },
        { userEmail: { $regex: search.trim(), $options: 'i' } },
        { comment: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Feedback.countDocuments(query);
    const feedbackList = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Summary statistics
    const allRatingsAgg = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const avgOverallRating = allRatingsAgg.length > 0 ? Number(allRatingsAgg[0].avgRating.toFixed(1)) : 0;
    const unreadCount = await Feedback.countDocuments({ status: 'unread' });

    res.json({
      feedback: feedbackList,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      avgOverallRating,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching admin feedback:', error.message);
    res.status(500).json({ message: 'Server error fetching feedback list' });
  }
};

// @desc    Update feedback status (read / unread / archived)
// @route   PUT /api/admin/feedback/:id
// @access  Private (Admin only)
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['unread', 'read', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be unread, read, or archived.' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      message: `Feedback status updated to ${status}`,
      feedback
    });
  } catch (error) {
    console.error('Error updating feedback status:', error.message);
    res.status(500).json({ message: 'Server error updating feedback status' });
  }
};

// @desc    Get level-by-level progression funnel, drop-offs, user distribution, and completion rates
// @route   GET /api/admin/analytics/progression
// @access  Private (Admin only)
exports.getProgressionAnalytics = async (req, res) => {
  try {
    const totalLearners = await User.countDocuments({ role: 'learner' });
    const levels = await Level.find().sort({ order: 1 });

    // Active learners: learners who have attempted at least one practical or MCQ
    const activeLearnerIds = await PracticalAttempt.distinct('user');
    const mcqLearnerIds = await MCQAttempt.distinct('user');
    const unionActiveIds = new Set([...activeLearnerIds.map(String), ...mcqLearnerIds.map(String)]);
    const totalActivePlayers = unionActiveIds.size;

    // Overall aggregate performance metrics across practical attempts
    const practicalPerfAgg = await PracticalAttempt.aggregate([
      {
        $group: {
          _id: null,
          avgResponseTimeMs: { $avg: '$responseTimeMs' },
          avgTargetAccuracy: { $avg: '$targetAccuracy' },
          avgActionCorrectness: { $avg: '$actionCorrectness' },
          avgSequenceAccuracy: { $avg: '$sequenceAccuracy' },
          avgCompositeScore: { $avg: '$compositeScore' },
          totalAttempts: { $sum: 1 }
        }
      }
    ]);

    const aggregateMetrics = practicalPerfAgg.length > 0 ? {
      avgResponseSpeedSec: Number((practicalPerfAgg[0].avgResponseTimeMs / 1000).toFixed(1)),
      avgTargetAccuracy: Math.round(practicalPerfAgg[0].avgTargetAccuracy || 0),
      avgActionCorrectness: Math.round(practicalPerfAgg[0].avgActionCorrectness || 0),
      avgPracticalAccuracy: Math.round(((practicalPerfAgg[0].avgTargetAccuracy || 0) + (practicalPerfAgg[0].avgActionCorrectness || 0)) / 2),
      avgCompositeScore: Math.round(practicalPerfAgg[0].avgCompositeScore || 0),
      totalPracticalAttempts: practicalPerfAgg[0].totalAttempts
    } : {
      avgResponseSpeedSec: 0,
      avgTargetAccuracy: 0,
      avgActionCorrectness: 0,
      avgPracticalAccuracy: 0,
      avgCompositeScore: 0,
      totalPracticalAttempts: 0
    };

    // Calculate level-by-level progression funnel
    let previousLevelCompletions = totalLearners;
    const funnelSteps = [];

    for (let i = 0; i < levels.length; i++) {
      const lvl = levels[i];
      const levelId = lvl._id;

      // Count unlocked learners
      const unlockedCount = await Progress.countDocuments({ level: levelId, unlocked: true });
      // Count completed learners
      const completedCount = await Progress.countDocuments({ level: levelId, levelCompleted: true });
      // Count practical passed
      const practicalPassedCount = await Progress.countDocuments({ level: levelId, practicalPassed: true });
      // Count MCQ passed
      const mcqPassedCount = await Progress.countDocuments({ level: levelId, mcqPassed: true });

      // Average attempts per learner for this level
      const practicalAttemptAgg = await PracticalAttempt.aggregate([
        { $match: { level: levelId } },
        { $group: { _id: '$user', attempts: { $sum: 1 } } },
        { $group: { _id: null, avgAttempts: { $avg: '$attempts' } } }
      ]);
      const avgPracticalAttempts = practicalAttemptAgg.length > 0 ? Number(practicalAttemptAgg[0].avgAttempts.toFixed(1)) : 1.0;

      const mcqAttemptAgg = await MCQAttempt.aggregate([
        { $match: { level: levelId } },
        { $group: { _id: '$user', attempts: { $sum: 1 } } },
        { $group: { _id: null, avgAttempts: { $avg: '$attempts' } } }
      ]);
      const avgMcqAttempts = mcqAttemptAgg.length > 0 ? Number(mcqAttemptAgg[0].avgAttempts.toFixed(1)) : 1.0;

      // Drop-off from previous level
      const dropOffCount = Math.max(0, previousLevelCompletions - completedCount);
      const dropOffRate = previousLevelCompletions > 0 ? Math.round((dropOffCount / previousLevelCompletions) * 100) : 0;
      const completionPercentage = totalLearners > 0 ? Math.round((completedCount / totalLearners) * 100) : 0;

      // Average response time and accuracy for this specific level
      const lvlPracticalAgg = await PracticalAttempt.aggregate([
        { $match: { level: levelId } },
        {
          $group: {
            _id: null,
            avgResponseTimeMs: { $avg: '$responseTimeMs' },
            avgAccuracy: { $avg: '$targetAccuracy' },
            avgScore: { $avg: '$compositeScore' }
          }
        }
      ]);

      const levelAvgSpeedSec = lvlPracticalAgg.length > 0 ? Number((lvlPracticalAgg[0].avgResponseTimeMs / 1000).toFixed(1)) : 0;
      const levelAvgAccuracy = lvlPracticalAgg.length > 0 ? Math.round(lvlPracticalAgg[0].avgAccuracy) : 0;

      funnelSteps.push({
        order: lvl.order,
        levelId: lvl._id,
        title: lvl.title,
        unlockedCount,
        completedCount,
        practicalPassedCount,
        mcqPassedCount,
        completionPercentage,
        dropOffCount,
        dropOffRate,
        avgPracticalAttempts,
        avgMcqAttempts,
        avgResponseSpeedSec: levelAvgSpeedSec,
        avgPracticalAccuracy: levelAvgAccuracy
      });

      previousLevelCompletions = completedCount;
    }

    // Master completion count (completed all levels)
    const masterCertificatesCount = await Certificate.countDocuments({ levelId: 'master' });

    res.json({
      overview: {
        totalLearnersStarted: totalLearners,
        totalActivePlayers,
        activePercentage: totalLearners > 0 ? Math.round((totalActivePlayers / totalLearners) * 100) : 0,
        masterCertificatesCount,
        masterCompletionRate: totalLearners > 0 ? Math.round((masterCertificatesCount / totalLearners) * 100) : 0
      },
      aggregateMetrics,
      funnel: funnelSteps
    });
  } catch (error) {
    console.error('Error computing progression analytics:', error.message);
    res.status(500).json({ message: 'Server error computing progression analytics' });
  }
};

