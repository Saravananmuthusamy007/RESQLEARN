import { processPartnerMessage } from '../ai/learningPartner.js';
import User from '../models/User.js';
import SimulationAttempt from '../models/SimulationAttempt.js';
import Mastery from '../models/Mastery.js';

// @desc    Chat with AI Learning Partner (Learner or Admin)
// @route   POST /api/learning-partner/chat
// @access  Private
export const chatWithPartner = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    let platformContext = {};
    if (req.user.role === 'admin') {
      const learnerCount = await User.countDocuments({ role: 'learner' });
      const completedCount = await Mastery.countDocuments({ status: 'completed' });
      platformContext = {
        totalLearners: learnerCount,
        totalCompletedLevelModules: completedCount,
      };
    }

    const response = await processPartnerMessage({
      message: message.trim(),
      history,
      userRole: req.user.role,
      platformContext,
    });

    res.json({
      success: true,
      message: response.text,
      source: response.source,
    });
  } catch (err) {
    console.error('AI Chat error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error communicating with AI Learning Partner.',
    });
  }
};

export default {
  chatWithPartner,
};
