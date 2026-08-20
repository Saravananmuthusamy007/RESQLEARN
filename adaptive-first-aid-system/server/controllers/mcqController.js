const Question = require('../models/Question');
const MCQAttempt = require('../models/MCQAttempt');
const PracticalAttempt = require('../models/PracticalAttempt');
const Level = require('../models/Level');
const Progress = require('../models/Progress');
const { recommendQuestionSet } = require('../services/ruleEngine');

// @desc    Get adaptively selected MCQ question set for level
// @route   GET /api/mcq/:levelId/next-set
// @access  Private (Learner & Admin)
exports.getNextSet = async (req, res) => {
  try {
    const { levelId } = req.params;
    const userId = req.user.id;

    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    // Verify learner has completed practical attempt
    const latestPractical = await PracticalAttempt.findOne({ user: userId, level: levelId }).sort({ createdAt: -1 });
    const previousMcqAttempts = await MCQAttempt.find({ user: userId, level: levelId }).sort({ attemptNumber: 1 });

    // Run Rule Engine recommendation
    const recommendation = recommendQuestionSet(latestPractical, previousMcqAttempts, level);
    const { difficultyMix, focusTags, reason } = recommendation;

    // Target set size = 5 questions
    const setSize = 5;
    const countEasy = Math.max(1, Math.round(setSize * difficultyMix.easy));
    const countMedium = Math.max(1, Math.round(setSize * difficultyMix.medium));
    const countHard = setSize - countEasy - countMedium > 0 ? setSize - countEasy - countMedium : 1;

    // Fetch pool of questions for level
    let allQuestions = await Question.find({ level: levelId });

    if (allQuestions.length === 0) {
      return res.status(404).json({ message: 'No MCQ questions found for this level.' });
    }

    // Helper to score question relevance based on focusTags match
    const getRelevanceScore = (q) => {
      if (!focusTags || focusTags.length === 0) return 0;
      let score = 0;
      if (q.tags && Array.isArray(q.tags)) {
        q.tags.forEach(t => {
          if (focusTags.includes(t)) score += 1;
        });
      }
      return score;
    };

    // Sort questions by relevance score descending
    const poolEasy = allQuestions.filter(q => q.difficulty === 'easy').sort((a, b) => getRelevanceScore(b) - getRelevanceScore(a));
    const poolMedium = allQuestions.filter(q => q.difficulty === 'medium').sort((a, b) => getRelevanceScore(b) - getRelevanceScore(a));
    const poolHard = allQuestions.filter(q => q.difficulty === 'hard').sort((a, b) => getRelevanceScore(b) - getRelevanceScore(a));

    const selectedQuestions = [
      ...poolEasy.slice(0, countEasy),
      ...poolMedium.slice(0, countMedium),
      ...poolHard.slice(0, countHard)
    ];

    // Fill remaining if needed
    if (selectedQuestions.length < setSize) {
      const selectedIds = new Set(selectedQuestions.map(q => q._id.toString()));
      for (const q of allQuestions) {
        if (!selectedIds.has(q._id.toString())) {
          selectedQuestions.push(q);
          selectedIds.add(q._id.toString());
          if (selectedQuestions.length === setSize) break;
        }
      }
    }

    // Sanitize output (exclude correctOptionIndex)
    const sanitizedQuestions = selectedQuestions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      difficulty: q.difficulty,
      tags: q.tags
    }));

    const attemptNumber = previousMcqAttempts.length + 1;

    res.json({
      questions: sanitizedQuestions,
      reason,
      attemptNumber,
      mcqThreshold: level.mcqThreshold,
      totalQuestions: sanitizedQuestions.length
    });
  } catch (error) {
    console.error('Error generating adaptive MCQ question set:', error.message);
    res.status(500).json({ message: 'Server error generating question set' });
  }
};

// @desc    Submit MCQ answer set and grade attempt
// @route   POST /api/mcq/:levelId/submit
// @access  Private (Learner & Admin)
exports.submitAnswers = async (req, res) => {
  try {
    const { levelId } = req.params;
    const userId = req.user.id;
    const { answers } = req.body; // Array of { questionId, selectedOption }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers payload is required.' });
    }

    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    let correctCount = 0;
    const gradedQuestions = [];

    for (const ans of answers) {
      const qDoc = await Question.findById(ans.questionId);
      if (!qDoc) continue;

      const isCorrect = qDoc.correctOptionIndex === Number(ans.selectedOption);
      if (isCorrect) correctCount++;

      gradedQuestions.push({
        question: qDoc._id,
        selectedOption: Number(ans.selectedOption),
        correct: isCorrect,
        tagsFromQuestion: qDoc.tags || []
      });
    }

    const totalQuestions = gradedQuestions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= level.mcqThreshold;

    const previousAttemptsCount = await MCQAttempt.countDocuments({ user: userId, level: levelId });
    const attemptNumber = previousAttemptsCount + 1;

    const attempt = new MCQAttempt({
      user: userId,
      level: levelId,
      questions: gradedQuestions,
      score,
      attemptNumber,
      passed
    });

    await attempt.save();

    // Update Progress model
    let progress = await Progress.findOne({ user: userId, level: levelId });
    if (!progress) {
      progress = new Progress({ user: userId, level: levelId, unlocked: true });
    }

    if (passed) {
      progress.mcqPassed = true;
    }

    // Check if both practical and MCQ are passed -> Level completed!
    let levelCompleted = false;
    let nextLevelUnlocked = false;

    if (progress.practicalPassed && progress.mcqPassed) {
      progress.levelCompleted = true;
      progress.completedAt = Date.now();
      levelCompleted = true;

      // Auto-unlock next level if available!
      const nextLevel = await Level.findOne({ order: level.order + 1 });
      if (nextLevel) {
        let nextProgress = await Progress.findOne({ user: userId, level: nextLevel._id });
        if (!nextProgress) {
          nextProgress = new Progress({
            user: userId,
            level: nextLevel._id,
            unlocked: true
          });
        } else {
          nextProgress.unlocked = true;
        }
        await nextProgress.save();
        nextLevelUnlocked = true;
      }
    }

    await progress.save();

    // Build question-level breakdown for summary
    const detailedResults = await Promise.all(
      gradedQuestions.map(async (gq) => {
        const qObj = await Question.findById(gq.question);
        return {
          questionId: gq.question,
          questionText: qObj.questionText,
          options: qObj.options,
          selectedOption: gq.selectedOption,
          correctOptionIndex: qObj.correctOptionIndex,
          correct: gq.correct,
          explanation: qObj.explanation || 'Review emergency first-aid guidelines.'
        };
      })
    );

    res.status(201).json({
      attempt,
      score,
      passed,
      mcqThreshold: level.mcqThreshold,
      correctCount,
      totalQuestions,
      results: detailedResults,
      levelCompleted,
      nextLevelUnlocked
    });
  } catch (error) {
    console.error('Error submitting MCQ assessment:', error.message);
    res.status(500).json({ message: 'Server error grading MCQ assessment' });
  }
};
