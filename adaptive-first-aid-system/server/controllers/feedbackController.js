const Feedback = require('../models/Feedback');
const Level = require('../models/Level');

// @desc    Submit learner feedback on a level
// @route   POST /api/feedback
// @access  Public / Authenticated
exports.submitFeedback = async (req, res) => {
  try {
    const { levelId, rating, difficulty = 'Just Right', comment = '', userName, userEmail } = req.body;

    if (!levelId) {
      return res.status(400).json({ message: 'Level ID is required.' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    const userId = req.user ? req.user.id : (req.body.userId || null);
    const resolvedName = req.user ? req.user.name : (userName || 'Anonymous Learner');
    const resolvedEmail = req.user ? req.user.email : (userEmail || 'learner@resqlearn.local');

    const feedback = new Feedback({
      user: userId,
      userId: userId ? userId.toString() : null,
      userName: resolvedName,
      userEmail: resolvedEmail,
      levelId: String(levelId),
      rating: Number(rating),
      difficulty,
      comment: comment.trim(),
      status: 'unread'
    });

    await feedback.save();

    res.status(201).json({
      message: 'Thank you for your valuable feedback!',
      feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error.message);
    res.status(500).json({ message: 'Server error submitting feedback' });
  }
};
