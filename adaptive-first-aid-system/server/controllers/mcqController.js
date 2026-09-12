const mongoose = require('mongoose');
const Question = require('../models/Question');
const MCQAttempt = require('../models/MCQAttempt');
const PracticalAttempt = require('../models/PracticalAttempt');
const Level = require('../models/Level');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const DynamicQuiz = require('../models/DynamicQuiz');
const { generateDynamicQuiz } = require('../services/dynamicQuizGenerator');
const { recommendQuestionSet } = require('../services/ruleEngine');

// Helper to resolve level document from ObjectId or numeric order
async function resolveLevel(levelId) {
  if (levelId && mongoose.Types.ObjectId.isValid(levelId)) {
    const doc = await Level.findById(levelId);
    if (doc) return doc;
  }
  const orderNum = Number(levelId);
  if (!isNaN(orderNum)) {
    return await Level.findOne({ order: orderNum });
  }
  return null;
}

// @desc    Get adaptively selected MCQ question set for level with threshold enforcement
// @route   GET /api/mcq/:levelId/next-set
// @access  Private (Learner & Admin)
exports.getNextSet = async (req, res) => {
  try {
    const { levelId } = req.params;
    const userId = req.user.id;

    const level = await resolveLevel(levelId);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const levelDocId = level._id;

    // Threshold Verification: Ensure learner has completed and passed practical simulation
    const latestPractical = await PracticalAttempt.findOne({ user: userId, level: levelDocId }).sort({ createdAt: -1 });

    const practicalThreshold = Number(level.practicalThreshold) || 75;

    if (req.user.role !== 'admin') {
      if (!latestPractical) {
        return res.status(403).json({
          message: 'Practical simulation must be completed before accessing the adaptive MCQ assessment.',
          practicalPassed: false,
          requiredThreshold: practicalThreshold,
          currentScore: 0,
          remediation: 'Complete the hands-on practical simulation for this level to demonstrate clinical competency before unlocking the quiz.'
        });
      }

      const hasPassedPractical = latestPractical.passed || (latestPractical.compositeScore >= practicalThreshold);
      if (!hasPassedPractical) {
        return res.status(403).json({
          message: `Practical simulation threshold not met. You achieved ${latestPractical.compositeScore}%, but at least ${practicalThreshold}% is required to unlock the MCQ assessment.`,
          practicalPassed: false,
          requiredThreshold: practicalThreshold,
          currentScore: latestPractical.compositeScore,
          remediation: latestPractical.geminiEvaluation?.remediation || 'Review procedural clinical guidelines and retry the simulation to achieve passing criteria.',
          weakAreas: latestPractical.weakAreas || []
        });
      }
    }

    const previousMcqAttempts = await MCQAttempt.find({ user: userId, level: levelDocId }).sort({ attemptNumber: 1 });
    const attemptNumber = previousMcqAttempts.length + 1;

    // Check for existing active dynamic quiz session
    let dynamicQuiz = await DynamicQuiz.findOne({
      user: userId,
      level: levelDocId,
      isCompleted: false
    }).sort({ createdAt: -1 });

    // If no active dynamic quiz, generate a new Gemini-driven quiz on the fly
    if (!dynamicQuiz) {
      const simulationScore = latestPractical ? latestPractical.compositeScore : 80;
      const weakTags = latestPractical?.weakAreas || latestPractical?.geminiEvaluation?.recommendedFocusTags || [];

      const quizResult = await generateDynamicQuiz({
        levelOrder: level.order,
        simulationScore,
        weakTags
      });

      dynamicQuiz = new DynamicQuiz({
        user: userId,
        level: levelDocId,
        levelOrder: level.order,
        simulationScore,
        simulationAttempt: latestPractical ? latestPractical._id : null,
        weakTags,
        difficultyTier: quizResult.difficultyTier,
        questions: quizResult.questions
      });

      await dynamicQuiz.save();
    }

    // Sanitize output (exclude correctOptionIndex)
    const sanitizedQuestions = dynamicQuiz.questions.map(q => ({
      _id: q.id,
      id: q.id,
      question: q.question,
      questionText: q.question,
      options: q.options,
      difficulty: q.difficulty,
      clinicalRationale: q.clinicalRationale,
      tags: [q.difficulty]
    }));

    const difficultyTier = dynamicQuiz.difficultyTier || 'intermediate';
    let dynamicReason = `Based on your simulation score of ${dynamicQuiz.simulationScore}%, 5 dynamic ${difficultyTier} MCQs were generated to test clinical competency.`;

    res.json({
      questions: sanitizedQuestions,
      reason: dynamicReason,
      attemptNumber,
      mcqThreshold: level.mcqThreshold || 75,
      totalQuestions: sanitizedQuestions.length,
      adaptiveCategory: difficultyTier,
      difficultyTier,
      simulationScore: dynamicQuiz.simulationScore,
      practicalScore: latestPractical ? latestPractical.compositeScore : 80
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

    const level = await resolveLevel(levelId);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const levelDocId = level._id;

    // Check for active dynamic quiz for this user and level
    let dynamicQuiz = await DynamicQuiz.findOne({
      user: userId,
      level: levelDocId,
      isCompleted: false
    }).sort({ createdAt: -1 });

    if (!dynamicQuiz) {
      dynamicQuiz = await DynamicQuiz.findOne({
        user: userId,
        level: levelDocId
      }).sort({ createdAt: -1 });
    }

    let correctCount = 0;
    const gradedQuestions = [];
    let detailedResults = [];

    if (dynamicQuiz && dynamicQuiz.questions && dynamicQuiz.questions.length > 0) {
      const answerMap = new Map();
      answers.forEach(a => {
        const qId = a.questionId !== undefined ? Number(a.questionId) : Number(a.id);
        answerMap.set(qId, Number(a.selectedOption));
      });

      dynamicQuiz.questions.forEach((q, idx) => {
        const qId = q.id || idx + 1;
        const selectedOption = answerMap.has(qId) ? answerMap.get(qId) : 0;
        const isCorrect = selectedOption === q.correctOptionIndex;
        if (isCorrect) correctCount++;

        gradedQuestions.push({
          dynamicQuestion: {
            id: q.id,
            question: q.question,
            options: q.options,
            difficulty: q.difficulty,
            clinicalRationale: q.clinicalRationale,
            correctOptionIndex: q.correctOptionIndex
          },
          selectedOption,
          correct: isCorrect,
          tagsFromQuestion: [q.difficulty]
        });

        detailedResults.push({
          questionId: q.id,
          id: q.id,
          question: q.question,
          questionText: q.question,
          options: q.options,
          selectedOption,
          correctOptionIndex: q.correctOptionIndex,
          correct: isCorrect,
          explanation: q.clinicalRationale
        });
      });

      dynamicQuiz.isCompleted = true;
      await dynamicQuiz.save();
    } else {
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

        detailedResults.push({
          questionId: qDoc._id,
          questionText: qDoc.questionText,
          options: qDoc.options,
          selectedOption: Number(ans.selectedOption),
          correctOptionIndex: qDoc.correctOptionIndex,
          correct: isCorrect,
          explanation: qDoc.explanation || 'Review emergency first-aid guidelines.'
        });
      }
    }

    const totalQuestions = gradedQuestions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= (level.mcqThreshold || 75);

    const previousAttemptsCount = await MCQAttempt.countDocuments({ user: userId, level: levelDocId });
    const attemptNumber = previousAttemptsCount + 1;

    const attempt = new MCQAttempt({
      user: userId,
      level: levelDocId,
      questions: gradedQuestions,
      score,
      attemptNumber,
      passed
    });

    await attempt.save();

    // Update Progress model
    let progress = await Progress.findOne({ user: userId, level: levelDocId });
    if (!progress) {
      progress = new Progress({ user: userId, level: levelDocId, unlocked: true });
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

      // Auto-issue & persist Certificate for this level in MongoDB
      try {
        const userObj = await User.findById(userId).select('name email');
        const latestPractical = await PracticalAttempt.findOne({ user: userId, level: levelDocId, passed: true }).sort({ createdAt: -1 });
        const practicalScore = latestPractical ? latestPractical.compositeScore : 85;
        const verificationCode = `CERT-FA-LVL${level.order}-${userId.toString().substring(18).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

        await Certificate.findOneAndUpdate(
          { user: userId, levelId: String(level.order) },
          {
            user: userId,
            userName: userObj ? userObj.name : 'Learner',
            userEmail: userObj ? userObj.email : '',
            levelId: String(level.order),
            levelTitle: level.title,
            order: level.order,
            verificationCode,
            practicalScore,
            mcqScore: score,
            issuer: 'Adaptive First-Aid Certification Board',
            completedAt: new Date()
          },
          { upsert: true, new: true }
        );

        // Check if all levels completed -> Issue Master Certificate
        const totalLevels = await Level.countDocuments({});
        const completedCount = await Progress.countDocuments({ user: userId, levelCompleted: true });
        if (completedCount >= totalLevels && totalLevels > 0) {
          const masterCode = `CERT-FA-MASTER-${userId.toString().substring(18).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
          await Certificate.findOneAndUpdate(
            { user: userId, levelId: 'master' },
            {
              user: userId,
              userName: userObj ? userObj.name : 'Learner',
              userEmail: userObj ? userObj.email : '',
              levelId: 'master',
              levelTitle: 'Master Certificate of First-Aid Proficiency & Emergency Response',
              order: 99,
              verificationCode: masterCode,
              practicalScore,
              mcqScore: score,
              issuer: 'Adaptive First-Aid Certification Board & Emergency Medical Council',
              completedAt: new Date()
            },
            { upsert: true, new: true }
          );
        }
      } catch (certErr) {
        console.error('Error auto-issuing certificate on level completion:', certErr.message);
      }
    }

    await progress.save();

    res.status(201).json({
      attempt,
      score,
      passed,
      mcqThreshold: level.mcqThreshold || 75,
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
