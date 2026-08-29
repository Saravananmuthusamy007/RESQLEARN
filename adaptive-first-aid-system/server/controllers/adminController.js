const User = require('../models/User');
const Level = require('../models/Level');
const Progress = require('../models/Progress');
const PracticalAttempt = require('../models/PracticalAttempt');
const MCQAttempt = require('../models/MCQAttempt');
const Question = require('../models/Question');

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

// @desc    Get all users (learners & admins) with profile & progress metrics
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
          isMasterEligible
        };
      })
    );

    res.json(userProfiles);
  } catch (error) {
    console.error('Error fetching admin users:', error.message);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

