import Level from '../models/Level.js';
import Mastery from '../models/Mastery.js';
import SimulationAttempt from '../models/SimulationAttempt.js';
import { chatWithLearnerAI, chatWithAdminAI } from '../ai/geminiService.js';
import { getComprehensivePlatformAnalytics } from '../ai/adminAnalyticsService.js';

/**
 * @desc    Chat with Learner AI (Real Gemini API with Level & Progress Context)
 * @route   POST /api/learning-partner/chat
 * @access  Private (Learner)
 */
export const chatWithLearner = async (req, res) => {
  try {
    const { message, levelId, conversationHistory = [], history = [] } = req.body;
    const userMessage = message?.trim();

    if (!userMessage) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    const turns = conversationHistory.length > 0 ? conversationHistory : history;

    // 1. Identify Level Context
    let level = null;
    if (levelId) {
      // levelId could be level number (e.g. 1 or '1' or 'level1') or MongoDB ObjectId
      if (typeof levelId === 'number' || (!isNaN(levelId) && !levelId.toString().includes('6'))) {
        level = await Level.findOne({ levelNumber: Number(levelId) });
      } else if (levelId.toString().startsWith('level')) {
        const num = parseInt(levelId.replace('level', ''), 10);
        if (!isNaN(num)) {
          level = await Level.findOne({ levelNumber: num });
        }
      } else {
        level = await Level.findById(levelId).catch(() => null);
      }
    }

    // If no level specified, find learner's current active level from Mastery
    if (!level) {
      const activeMastery = await Mastery.findOne({
        learner: req.user._id,
        status: { $in: ['unlocked', 'in_progress'] },
      }).sort({ levelNumber: 1 });

      const targetLevelNum = activeMastery ? activeMastery.levelNumber : 1;
      level = await Level.findOne({ levelNumber: targetLevelNum });
    }

    // Default to Level 1 if still not resolved
    if (!level) {
      level = await Level.findOne({ levelNumber: 1 });
    }

    // 2. Retrieve Learner Performance Data for this level
    let learnerPerformance = {
      practicalScore: 0,
      assessmentScore: 0,
      mistakes: 0,
      weakAreas: [],
      strengths: [],
    };

    if (level) {
      const latestAttempt = await SimulationAttempt.findOne({
        learner: req.user._id,
        levelNumber: level.levelNumber,
      }).sort({ completedAt: -1 });

      const levelMastery = await Mastery.findOne({
        learner: req.user._id,
        levelNumber: level.levelNumber,
      });

      if (latestAttempt) {
        learnerPerformance = {
          practicalScore: latestAttempt.practicalScore,
          assessmentScore: levelMastery?.assessmentScore || 0,
          mistakes: latestAttempt.mistakes,
          weakAreas: latestAttempt.weakAreas || [],
          strengths: latestAttempt.strengths || [],
        };
      } else if (levelMastery) {
        learnerPerformance = {
          practicalScore: levelMastery.practicalScore || 0,
          assessmentScore: levelMastery.assessmentScore || 0,
          mistakes: 0,
          weakAreas: [],
          strengths: [],
        };
      }
    }

    // 3. Invoke Real Gemini Service
    const aiResult = await chatWithLearnerAI({
      message: userMessage,
      conversationHistory: turns,
      levelContext: level ? level.toObject() : {},
      learnerPerformance,
    });

    const replyText = aiResult.reply || aiResult.message || 'Educational simulation guidance.';

    res.json({
      success: true,
      reply: replyText,
      message: replyText,
      source: aiResult.source,
      currentLevel: level ? { levelNumber: level.levelNumber, title: level.title } : null,
    });
  } catch (err) {
    console.error('[Learner AI Controller Error]:', err);
    res.status(500).json({
      success: false,
      message: 'The AI Learning Partner is temporarily unavailable. Please try again shortly.',
      reply: 'The AI Learning Partner is temporarily unavailable. Please try again shortly.',
    });
  }
};

/**
 * @desc    Chat with Admin AI (Real Gemini API Grounded in Live MongoDB Data)
 * @route   POST /api/admin/ai/chat
 * @access  Private (Admin)
 */
export const chatWithAdmin = async (req, res) => {
  try {
    const { message, conversationHistory = [], history = [] } = req.body;
    const adminMessage = message?.trim();

    if (!adminMessage) {
      return res.status(400).json({ success: false, message: 'Question cannot be empty.' });
    }

    const turns = conversationHistory.length > 0 ? conversationHistory : history;

    // 1. Retrieve FRESH live analytics from MongoDB
    const liveAnalytics = await getComprehensivePlatformAnalytics();

    // 2. Invoke Real Gemini Service with live analytics ground truth
    const aiResult = await chatWithAdminAI({
      message: adminMessage,
      conversationHistory: turns,
      analyticsData: liveAnalytics,
    });

    const replyText = aiResult.reply || aiResult.message || 'The AI analytics assistant is temporarily unavailable.';

    res.json({
      success: true,
      reply: replyText,
      message: replyText,
      source: aiResult.source,
      dataTimestamp: liveAnalytics.timestamp,
    });
  } catch (err) {
    console.error('[Admin AI Controller Error]:', err);
    res.status(500).json({
      success: false,
      message: 'The AI analytics assistant is temporarily unavailable.',
      reply: 'The AI analytics assistant is temporarily unavailable.',
    });
  }
};

export default {
  chatWithLearner,
  chatWithAdmin,
};
