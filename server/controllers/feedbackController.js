import Feedback from '../models/Feedback.js';

// @desc    Submit learner feedback
// @route   POST /api/feedback
// @access  Private
export const submitFeedback = async (req, res) => {
  try {
    const { rating, category, message } = req.body;

    if (!rating || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating (1-5) and feedback message.',
      });
    }

    const feedback = await Feedback.create({
      learner: req.user._id,
      rating: Math.min(5, Math.max(1, Number(rating))),
      category: category || 'General Feedback',
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Your review helps enhance clinical training realism.',
      feedback,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error submitting feedback.',
    });
  }
};

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback
// @access  Private (Admin)
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('learner', 'name email profile')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      feedbacks,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching feedback list.',
    });
  }
};

export default {
  submitFeedback,
  getAllFeedback,
};
