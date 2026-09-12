const mongoose = require('mongoose');
const Level = require('../models/Level');
const PracticalAttempt = require('../models/PracticalAttempt');
const DynamicQuiz = require('../models/DynamicQuiz');
const MCQAttempt = require('../models/MCQAttempt');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const { generateDynamicQuiz, getDifficultyTier } = require('../services/dynamicQuizGenerator');

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

// @desc    Generate a 100% dynamic, Gemini-driven MCQ quiz tailored to learner telemetry
// @route   POST /api/levels/:levelId/generate-dynamic-quiz
// @access  Private (Learner & Admin)
exports.generateDynamicQuizHandler = async (req, res) => {
  try {
    const { levelId } = req.params;
    const userId = req.user.id;

    const level = await resolveLevel(levelId);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const levelDocId = level._id;
    const levelOrder = level.order;

    // Fetch latest practical attempt for telemetry verification
    const latestPractical = await PracticalAttempt.findOne({ user: userId, level: levelDocId }).sort({ createdAt: -1 });

    const practicalThreshold = Number(level.practicalThreshold) || 75;

    if (req.user.role !== 'admin') {
      if (!latestPractical) {
        return res.status(403).json({
          message: 'Practical simulation must be completed before generating the dynamic MCQ quiz.',
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

    // Extract simulation score and weak tags from body if supplied, or fall back to latestPractical
    const rawScore = req.body.simulationScore !== undefined
      ? Number(req.body.simulationScore)
      : (latestPractical ? latestPractical.compositeScore : 80);
    const simulationScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    const weakTags = Array.isArray(req.body.weakTags) && req.body.weakTags.length > 0
      ? req.body.weakTags
      : (latestPractical?.weakAreas || latestPractical?.geminiEvaluation?.recommendedFocusTags || []);

    // Generate dynamic quiz with Gemini 2.5 Flash
    const quizResult = await generateDynamicQuiz({
      levelOrder,
      simulationScore,
      weakTags
    });

    // Remove any previous uncompleted dynamic quiz for this user & level
    await DynamicQuiz.deleteMany({
      user: userId,
      level: levelDocId,
      isCompleted: false
    });

    // Persist new dynamic quiz in MongoDB
    const dynamicQuiz = new DynamicQuiz({
      user: userId,
      level: levelDocId,
      levelOrder,
      simulationScore,
      simulationAttempt: latestPractical ? latestPractical._id : null,
      weakTags,
      difficultyTier: quizResult.difficultyTier,
      questions: quizResult.questions
    });

    await dynamicQuiz.save();

    // Prepare client-safe sanitized questions (enforcing exact schema: id, question, options, difficulty, clinicalRationale)
    const sanitizedQuestions = quizResult.questions.map(q => ({
      id: q.id,
      _id: q.id,
      question: q.question,
      questionText: q.question,
      options: q.options,
      difficulty: q.difficulty,
      clinicalRationale: q.clinicalRationale
    }));

    res.status(201).json({
      levelId: levelDocId,
      levelOrder,
      levelTitle: level.title,
      difficultyTier: quizResult.difficultyTier,
      adaptiveCategory: quizResult.difficultyTier,
      reason: quizResult.reason,
      simulationScore,
      mcqThreshold: level.mcqThreshold || 75,
      aiGenerated: quizResult.aiGenerated,
      totalQuestions: sanitizedQuestions.length,
      questions: sanitizedQuestions
    });
  } catch (error) {
    console.error('Error generating dynamic Gemini quiz:', error);
    res.status(500).json({ message: 'Server error generating dynamic quiz', error: error.message });
  }
};

// @desc    Submit answers for dynamic quiz and grade attempt
// @route   POST /api/levels/:levelId/submit-dynamic-quiz
// @access  Private (Learner & Admin)
exports.submitDynamicQuizHandler = async (req, res) => {
  try {
    const { levelId } = req.params;
    const userId = req.user.id;
    const { answers } = req.body; // Array of { questionId (or id), selectedOption }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers payload is required.' });
    }

    const level = await resolveLevel(levelId);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const levelDocId = level._id;

    // Fetch active dynamic quiz for this user and level
    let dynamicQuiz = await DynamicQuiz.findOne({
      user: userId,
      level: levelDocId,
      isCompleted: false
    }).sort({ createdAt: -1 });

    // If none found uncompleted, fall back to most recent dynamic quiz
    if (!dynamicQuiz) {
      dynamicQuiz = await DynamicQuiz.findOne({
        user: userId,
        level: levelDocId
      }).sort({ createdAt: -1 });
    }

    if (!dynamicQuiz || !dynamicQuiz.questions || dynamicQuiz.questions.length === 0) {
      return res.status(404).json({
        message: 'No active dynamic quiz session found for this level. Please generate a dynamic quiz first.'
      });
    }

    // Map answers by question id
    const answerMap = new Map();
    answers.forEach(a => {
      const qId = a.questionId !== undefined ? Number(a.questionId) : Number(a.id);
      answerMap.set(qId, Number(a.selectedOption));
    });

    let correctCount = 0;
    const gradedQuestions = [];
    const detailedResults = [];

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

    const totalQuestions = dynamicQuiz.questions.length;
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

    // Mark dynamic quiz as completed
    dynamicQuiz.isCompleted = true;
    await dynamicQuiz.save();

    // Update Learner Progress
    let progress = await Progress.findOne({ user: userId, level: levelDocId });
    if (!progress) {
      progress = new Progress({ user: userId, level: levelDocId, unlocked: true });
    }

    if (passed) {
      progress.mcqPassed = true;
    }

    let levelCompleted = false;
    let nextLevelUnlocked = false;

    if (progress.practicalPassed && progress.mcqPassed) {
      progress.levelCompleted = true;
      progress.completedAt = Date.now();
      levelCompleted = true;

      // Auto-unlock next level if exists
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

      // Auto-issue Certificate for this level
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
    console.error('Error grading dynamic quiz assessment:', error);
    res.status(500).json({ message: 'Server error grading dynamic quiz', error: error.message });
  }
};
