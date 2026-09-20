import User from '../models/User.js';
import Level from '../models/Level.js';
import Mastery from '../models/Mastery.js';
import SimulationAttempt from '../models/SimulationAttempt.js';
import Assessment from '../models/Assessment.js';
import Certificate from '../models/Certificate.js';
import Feedback from '../models/Feedback.js';

/**
 * 1. User Statistics
 */
export async function getTotalLearners() {
  const totalLearners = await User.countDocuments({ role: 'learner' });
  const totalAdmins = await User.countDocuments({ role: 'admin' });
  const completedLearners = await Certificate.countDocuments();
  const activeLearnerIds = await SimulationAttempt.distinct('learner');

  return {
    totalLearners,
    activeLearners: activeLearnerIds.length,
    completedAllLevelsLearners: completedLearners,
    totalAdmins,
  };
}

/**
 * 2. Learners By Level
 */
export async function getLearnersByLevel() {
  const levels = await Level.find().sort({ levelNumber: 1 });
  const levelBreakdown = [];

  for (const lvl of levels) {
    const counts = await Mastery.aggregate([
      { $match: { levelNumber: lvl.levelNumber } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusMap = { locked: 0, unlocked: 0, in_progress: 0, completed: 0 };
    counts.forEach((c) => {
      if (statusMap[c._id] !== undefined) {
        statusMap[c._id] = c.count;
      }
    });

    levelBreakdown.push({
      levelNumber: lvl.levelNumber,
      title: lvl.title,
      ...statusMap,
      totalEnrolled: statusMap.unlocked + statusMap.in_progress + statusMap.completed,
    });
  }

  return levelBreakdown;
}

/**
 * 3. Level Completion Statistics
 */
export async function getLevelCompletionStats() {
  const totalLearners = await User.countDocuments({ role: 'learner' });
  const levels = await Level.find().sort({ levelNumber: 1 });
  const stats = [];

  for (const lvl of levels) {
    const completedCount = await Mastery.countDocuments({
      levelNumber: lvl.levelNumber,
      status: 'completed',
    });

    const completionRate = totalLearners > 0
      ? Number(((completedCount / totalLearners) * 100).toFixed(1))
      : 0;

    stats.push({
      levelNumber: lvl.levelNumber,
      title: lvl.title,
      completedCount,
      completionRatePercent: completionRate,
    });
  }

  // Identify highest and lowest completion
  const sorted = [...stats].sort((a, b) => a.completionRatePercent - b.completionRatePercent);
  const lowestCompletionLevel = sorted[0] || null;
  const highestCompletionLevel = sorted[sorted.length - 1] || null;

  return {
    levelStats: stats,
    lowestCompletionLevel,
    highestCompletionLevel,
  };
}

/**
 * 4. Practical Score Statistics
 */
export async function getAveragePracticalScore() {
  const overallAgg = await SimulationAttempt.aggregate([
    {
      $group: {
        _id: null,
        avgScore: { $avg: '$practicalScore' },
        maxScore: { $max: '$practicalScore' },
        minScore: { $min: '$practicalScore' },
        avgAccuracy: { $avg: '$actionAccuracy' },
        avgSequence: { $avg: '$sequenceScore' },
        avgTime: { $avg: '$timeScore' },
        totalAttempts: { $sum: 1 },
      },
    },
  ]);

  const levelAgg = await SimulationAttempt.aggregate([
    {
      $group: {
        _id: '$levelNumber',
        avgScore: { $avg: '$practicalScore' },
        attemptCount: { $sum: 1 },
        passCount: {
          $sum: { $cond: [{ $gte: ['$practicalScore', 75] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const perLevel = levelAgg.map((item) => ({
    levelNumber: item._id,
    avgScore: Number(item.avgScore.toFixed(1)),
    attemptCount: item.attemptCount,
    passCount: item.passCount,
    passRatePercent: item.attemptCount > 0 ? Number(((item.passCount / item.attemptCount) * 100).toFixed(1)) : 0,
  }));

  const overall = overallAgg[0] || {
    avgScore: 0,
    maxScore: 0,
    minScore: 0,
    avgAccuracy: 0,
    avgSequence: 0,
    avgTime: 0,
    totalAttempts: 0,
  };

  return {
    overallAveragePracticalScore: Number(overall.avgScore.toFixed(1)),
    highestPracticalScore: overall.maxScore,
    lowestPracticalScore: overall.minScore,
    totalSimulationAttempts: overall.totalAttempts,
    averageAccuracy: Number(overall.avgAccuracy.toFixed(1)),
    averageSequence: Number(overall.avgSequence.toFixed(1)),
    averagePacing: Number(overall.avgTime.toFixed(1)),
    perLevelAverages: perLevel,
  };
}

/**
 * 5. Assessment Score Statistics
 */
export async function getAverageAssessmentScore() {
  const agg = await Assessment.aggregate([
    {
      $group: {
        _id: null,
        avgScore: { $avg: '$score' },
        maxScore: { $max: '$score' },
        minScore: { $min: '$score' },
        totalAssessments: { $sum: 1 },
        passCount: {
          $sum: { $cond: [{ $gte: ['$score', 70] }, 1, 0] },
        },
      },
    },
  ]);

  const perLevelAgg = await Assessment.aggregate([
    {
      $group: {
        _id: '$levelNumber',
        avgScore: { $avg: '$score' },
        count: { $sum: 1 },
        passCount: {
          $sum: { $cond: [{ $gte: ['$score', 70] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const overall = agg[0] || {
    avgScore: 0,
    maxScore: 0,
    minScore: 0,
    totalAssessments: 0,
    passCount: 0,
  };

  const failCount = overall.totalAssessments - overall.passCount;
  const passRatePercent = overall.totalAssessments > 0
    ? Number(((overall.passCount / overall.totalAssessments) * 100).toFixed(1))
    : 0;

  return {
    overallAverageAssessmentScore: Number(overall.avgScore.toFixed(1)),
    totalAssessments: overall.totalAssessments,
    passCount: overall.passCount,
    failCount,
    passRatePercent,
    perLevelAssessmentAverages: perLevelAgg.map((lvl) => ({
      levelNumber: lvl._id,
      avgScore: Number(lvl.avgScore.toFixed(1)),
      count: lvl.count,
      passRatePercent: lvl.count > 0 ? Number(((lvl.passCount / lvl.count) * 100).toFixed(1)) : 0,
    })),
  };
}

/**
 * 6. Common Mistakes
 */
export async function getCommonMistakes() {
  const mistakesAgg = await SimulationAttempt.aggregate([
    { $match: { mistakes: { $gt: 0 } } },
    {
      $group: {
        _id: '$levelNumber',
        totalMistakes: { $sum: '$mistakes' },
        attemptsWithMistakes: { $sum: 1 },
        avgMistakesPerAttempt: { $avg: '$mistakes' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return mistakesAgg.map((item) => ({
    levelNumber: item._id,
    totalMistakes: item.totalMistakes,
    attemptsWithMistakes: item.attemptsWithMistakes,
    avgMistakes: Number(item.avgMistakesPerAttempt.toFixed(1)),
  }));
}

/**
 * 7. Common Weak Areas
 */
export async function getCommonWeakAreas() {
  const weakAreasAgg = await SimulationAttempt.aggregate([
    { $unwind: '$weakAreas' },
    { $group: { _id: '$weakAreas', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  return weakAreasAgg.map((w) => ({
    weakArea: w._id,
    frequencyCount: w.count,
  }));
}

/**
 * 8. Certificate Statistics
 */
export async function getCertificateStats() {
  const totalCertificates = await Certificate.countDocuments();
  const totalLearners = await User.countDocuments({ role: 'learner' });
  const certificationRate = totalLearners > 0
    ? Number(((totalCertificates / totalLearners) * 100).toFixed(1))
    : 0;

  const recentCertificates = await Certificate.find()
    .sort({ completionDate: -1 })
    .limit(5)
    .select('certificateId learnerName overallScore completionDate sha256Hash');

  return {
    totalCertificatesIssued: totalCertificates,
    certificationRatePercent: certificationRate,
    recentCertificates,
  };
}

/**
 * 9. Feedback Statistics
 */
export async function getFeedbackStats() {
  const totalFeedbackCount = await Feedback.countDocuments();
  const ratingAgg = await Feedback.aggregate([
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const categoriesAgg = await Feedback.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const ratingDistribution = await Feedback.aggregate([
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  return {
    totalFeedbackCount,
    averageRating: ratingAgg[0] ? Number(ratingAgg[0].avgRating.toFixed(1)) : 5.0,
    categoryDistribution: categoriesAgg.map((c) => ({ category: c._id, count: c.count })),
    ratingDistribution: ratingDistribution.map((r) => ({ rating: r._id, count: r.count })),
  };
}

/**
 * 10. Attempt Statistics
 */
export async function getAttemptStats() {
  const totalAttempts = await SimulationAttempt.countDocuments();
  const passedAttempts = await SimulationAttempt.countDocuments({ practicalScore: { $gte: 75 } });
  const failedAttempts = totalAttempts - passedAttempts;
  const passRate = totalAttempts > 0 ? Number(((passedAttempts / totalAttempts) * 100).toFixed(1)) : 0;

  return {
    totalSimulationAttempts: totalAttempts,
    passedPracticalAttempts: passedAttempts,
    failedPracticalAttempts: failedAttempts,
    practicalPassRatePercent: passRate,
  };
}

/**
 * 11. Mastery Statistics
 */
export async function getMasteryStats() {
  const masteryCounts = await Mastery.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const map = { locked: 0, unlocked: 0, in_progress: 0, completed: 0 };
  masteryCounts.forEach((m) => {
    if (map[m._id] !== undefined) map[m._id] = m.count;
  });

  return map;
}

/**
 * 12. Master Analytics Aggregator
 * Retrieves full live platform state from MongoDB for Gemini Admin Assistant grounding
 */
export async function getComprehensivePlatformAnalytics() {
  const [
    userStats,
    learnersByLevel,
    completionStats,
    practicalScores,
    assessmentScores,
    commonMistakes,
    commonWeakAreas,
    certificateStats,
    feedbackStats,
    attemptStats,
  ] = await Promise.all([
    getTotalLearners(),
    getLearnersByLevel(),
    getLevelCompletionStats(),
    getAveragePracticalScore(),
    getAverageAssessmentScore(),
    getCommonMistakes(),
    getCommonWeakAreas(),
    getCertificateStats(),
    getFeedbackStats(),
    getAttemptStats(),
  ]);

  return {
    timestamp: new Date().toISOString(),
    users: userStats,
    levelEnrollmentAndProgress: learnersByLevel,
    levelCompletion: completionStats,
    practicalSimulationMetrics: practicalScores,
    mcqAssessmentMetrics: assessmentScores,
    frequentMistakes: commonMistakes,
    frequentWeakAreas: commonWeakAreas,
    certifications: certificateStats,
    feedback: feedbackStats,
    attempts: attemptStats,
  };
}

export default {
  getTotalLearners,
  getLearnersByLevel,
  getLevelCompletionStats,
  getAveragePracticalScore,
  getAverageAssessmentScore,
  getCommonMistakes,
  getCommonWeakAreas,
  getCertificateStats,
  getFeedbackStats,
  getAttemptStats,
  getMasteryStats,
  getComprehensivePlatformAnalytics,
};
