import User from '../models/User.js';
import Level from '../models/Level.js';
import SimulationAttempt from '../models/SimulationAttempt.js';
import Assessment from '../models/Assessment.js';
import Mastery from '../models/Mastery.js';
import Certificate from '../models/Certificate.js';
import Feedback from '../models/Feedback.js';

// @desc    Get aggregate analytics for Admin dashboard & Recharts
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = async (req, res) => {
  try {
    const totalLearners = await User.countDocuments({ role: 'learner' });
    const totalCertificates = await Certificate.countDocuments();
    const totalSimAttempts = await SimulationAttempt.countDocuments({ isDemo: false });
    const totalAssessments = await Assessment.countDocuments();

    // 1. Level-wise performance & learner distribution
    const levelStats = [];
    for (let lvl = 1; lvl <= 5; lvl++) {
      const attempts = await SimulationAttempt.find({ levelNumber: lvl, isDemo: false });
      const assessments = await Assessment.find({ levelNumber: lvl });
      const masteries = await Mastery.find({ levelNumber: lvl });

      const completedCount = masteries.filter(m => m.status === 'completed').length;
      const inProgressCount = masteries.filter(m => m.status === 'in_progress').length;
      const unlockedCount = masteries.filter(m => m.status === 'unlocked').length;

      const avgPractical = attempts.length > 0
        ? Math.round((attempts.reduce((sum, a) => sum + a.practicalScore, 0) / attempts.length) * 10) / 10
        : 0;

      const avgAssessment = assessments.length > 0
        ? Math.round((assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length) * 10) / 10
        : 0;

      const passedAttempts = attempts.filter(a => a.isPassed).length;
      const passRate = attempts.length > 0
        ? Math.round((passedAttempts / attempts.length) * 100)
        : 0;

      levelStats.push({
        levelNumber: lvl,
        name: `Level ${lvl}`,
        totalAttempts: attempts.length,
        completedLearners: completedCount,
        inProgressLearners: inProgressCount,
        unlockedLearners: unlockedCount,
        avgPracticalScore: avgPractical,
        avgAssessmentScore: avgAssessment,
        passRate,
      });
    }

    // 2. Score distribution cohorts (<75, 75-80, 81-90, 91-100)
    const allAttempts = await SimulationAttempt.find({ isDemo: false });
    const distribution = [
      { range: '< 75% (Retry)', count: 0 },
      { range: '75–80% (Basic)', count: 0 },
      { range: '81–90% (Moderate)', count: 0 },
      { range: '91–100% (Advanced)', count: 0 },
    ];

    allAttempts.forEach(att => {
      const s = att.practicalScore;
      if (s < 75) distribution[0].count++;
      else if (s <= 80) distribution[1].count++;
      else if (s <= 90) distribution[2].count++;
      else distribution[3].count++;
    });

    // 3. Common Weak Areas frequency aggregation
    const weakAreaCounts = {};
    allAttempts.forEach(att => {
      (att.weakAreas || []).forEach(area => {
        // Clean text
        const key = area.length > 45 ? area.substring(0, 42) + '...' : area;
        weakAreaCounts[key] = (weakAreaCounts[key] || 0) + 1;
      });
    });

    const commonWeakAreas = Object.entries(weakAreaCounts)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 4. Feedback Ratings Breakdown
    const feedbacks = await Feedback.find();
    const ratingBreakdown = [
      { rating: '5 Stars', count: 0 },
      { rating: '4 Stars', count: 0 },
      { rating: '3 Stars', count: 0 },
      { rating: '2 Stars', count: 0 },
      { rating: '1 Star', count: 0 },
    ];
    let totalRatingSum = 0;
    feedbacks.forEach(f => {
      totalRatingSum += f.rating;
      if (f.rating === 5) ratingBreakdown[0].count++;
      else if (f.rating === 4) ratingBreakdown[1].count++;
      else if (f.rating === 3) ratingBreakdown[2].count++;
      else if (f.rating === 2) ratingBreakdown[3].count++;
      else if (f.rating === 1) ratingBreakdown[4].count++;
    });
    const avgFeedbackRating = feedbacks.length > 0
      ? Math.round((totalRatingSum / feedbacks.length) * 10) / 10
      : 5.0;

    res.json({
      success: true,
      summary: {
        totalLearners,
        totalCertificates,
        totalSimAttempts,
        totalAssessments,
        avgFeedbackRating,
        totalFeedbackCount: feedbacks.length,
      },
      levelStats,
      scoreDistribution: distribution,
      commonWeakAreas,
      ratingBreakdown,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error generating analytics.',
    });
  }
};

// @desc    Get paginated learners with search and progress overview
// @route   GET /api/admin/learners
// @access  Private (Admin)
export const getLearners = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const query = { role: 'learner' };

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const learners = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await User.countDocuments(query);

    // Populate progress and certificates for each learner
    const enrichedLearners = await Promise.all(
      learners.map(async l => {
        const masteries = await Mastery.find({ learner: l._id }).sort({ levelNumber: 1 });
        const completedLevels = masteries.filter(m => m.status === 'completed').map(m => m.levelNumber);
        const cert = await Certificate.findOne({ learner: l._id });
        const attemptCount = await SimulationAttempt.countDocuments({ learner: l._id, isDemo: false });

        return {
          id: l._id,
          name: l.name,
          email: l.email,
          profile: l.profile,
          completedLevels,
          completedCount: completedLevels.length,
          certificateId: cert ? cert.certificateId : null,
          isCertified: !!cert,
          attemptCount,
          masteryOverview: masteries.map(m => ({
            levelNumber: m.levelNumber,
            practicalScore: m.practicalScore,
            assessmentScore: m.assessmentScore,
            status: m.status,
          })),
          createdAt: l.createdAt,
        };
      })
    );

    res.json({
      success: true,
      learners: enrichedLearners,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching learner list.',
    });
  }
};

// @desc    Get detailed history and attempt telemetry for a specific learner
// @route   GET /api/admin/learners/:id
// @access  Private (Admin)
export const getLearnerDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Learner not found.' });
    }

    const masteries = await Mastery.find({ learner: user._id }).sort({ levelNumber: 1 });
    const attempts = await SimulationAttempt.find({ learner: user._id, isDemo: false }).sort({ createdAt: -1 });
    const assessments = await Assessment.find({ learner: user._id }).sort({ completedAt: -1 });
    const certificate = await Certificate.findOne({ learner: user._id });

    res.json({
      success: true,
      learner: user,
      masteries,
      attempts,
      assessments,
      certificate,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching learner details.',
    });
  }
};

export default {
  getAnalytics,
  getLearners,
  getLearnerDetails,
};
