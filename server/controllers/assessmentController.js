import Assessment from '../models/Assessment.js';
import Level from '../models/Level.js';
import SimulationAttempt from '../models/SimulationAttempt.js';
import Mastery from '../models/Mastery.js';
import { getAdaptiveAssessment } from '../ai/adaptiveAssessment.js';
import { evaluateAndUnlockProgression } from '../services/mastery/masteryService.js';

// @desc    Generate adaptive MCQ assessment based on learner's latest practical performance
// @route   POST /api/assessments/generate
// @access  Private
export const generateAssessment = async (req, res) => {
  try {
    const { levelNumber } = req.body;
    const lvlNum = parseInt(levelNumber, 10);

    const level = await Level.findOne({ levelNumber: lvlNum });
    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found.' });
    }

    // Verify learner has passed the practical simulation with score >= 75%
    let latestAttempt = await SimulationAttempt.findOne({
      learner: req.user._id,
      levelNumber: lvlNum,
      isDemo: false,
    }).sort({ createdAt: -1 });

    // For admin preview or learners with at least 75% practical score
    let practicalScore = latestAttempt ? latestAttempt.practicalScore : 85;
    let weakAreas = latestAttempt ? latestAttempt.weakAreas : [];
    let strengths = latestAttempt ? latestAttempt.strengths : [];
    let mistakes = latestAttempt ? latestAttempt.mistakes : 0;

    if (req.user.role === 'learner' && (!latestAttempt || latestAttempt.practicalScore < 75)) {
      return res.status(403).json({
        success: false,
        message: `Ineligible for assessment. You must score at least 75% on the practical simulation first (Your current score: ${latestAttempt ? latestAttempt.practicalScore : 0}%).`,
      });
    }

    // Generate adaptive questions via Gemini (or fallback bank)
    const adaptivePackage = await getAdaptiveAssessment({
      levelId: level._id,
      levelNumber: lvlNum,
      practicalScore,
      weakAreas,
      strengths,
      mistakes,
    });

    // Strip out correctAnswer from client response to prevent inspection cheating!
    const sanitizedQuestions = adaptivePackage.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      skill: q.skill,
    }));

    // Cache the active assessment package in the DB or session
    const pendingAssessment = await Assessment.create({
      learner: req.user._id,
      level: level._id,
      levelNumber: lvlNum,
      difficulty: adaptivePackage.difficulty,
      questions: adaptivePackage.questions,
      answers: [],
      score: 0,
      totalQuestions: adaptivePackage.questions.length,
      passed: false,
    });

    res.json({
      success: true,
      assessmentId: pendingAssessment._id,
      difficulty: adaptivePackage.difficulty,
      source: adaptivePackage.source,
      practicalScore,
      questions: sanitizedQuestions,
      totalQuestions: sanitizedQuestions.length,
    });
  } catch (err) {
    console.error('Generate assessment error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error generating adaptive assessment.',
    });
  }
};

// @desc    Submit learner answers, calculate deterministic score & evaluate passing threshold (>= 70%)
// @route   POST /api/assessments/submit
// @access  Private
export const submitAssessment = async (req, res) => {
  try {
    const { assessmentId, answers } = req.body;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment session not found.' });
    }

    // Evaluate answers deterministically on backend
    const answerMap = {};
    (answers || []).forEach(a => {
      answerMap[a.questionId] = a.selectedAnswer;
    });

    let correctCount = 0;
    const evaluatedAnswers = [];
    const weakAreas = [];

    for (const q of assessment.questions) {
      const selected = answerMap[q.id];
      const isCorrect = selected !== undefined && Number(selected) === Number(q.correctAnswer);

      if (isCorrect) {
        correctCount++;
      } else {
        weakAreas.push(`Review needed: ${q.skill}`);
      }

      evaluatedAnswers.push({
        questionId: q.id,
        selectedAnswer: selected !== undefined ? Number(selected) : -1,
        isCorrect,
      });
    }

    const totalQuestions = assessment.questions.length || 5;
    const rawScore = (correctCount / totalQuestions) * 100;
    const assessmentScore = Math.round(rawScore * 100) / 100;
    const isPassed = assessmentScore >= 70; // Strict 70% threshold

    // Update Assessment record
    assessment.answers = evaluatedAnswers;
    assessment.score = assessmentScore;
    assessment.passed = isPassed;
    assessment.weakAreas = weakAreas;
    assessment.completedAt = new Date();
    await assessment.save();

    // Find learner's practical score for this level
    const mastery = await Mastery.findOne({
      learner: req.user._id,
      levelNumber: assessment.levelNumber,
    });
    const practicalScore = mastery ? mastery.practicalScore : 75;

    // Evaluate overall level progression and unlock next level if passed
    let progressionResult = null;
    if (isPassed && practicalScore >= 75) {
      progressionResult = await evaluateAndUnlockProgression({
        learnerId: req.user._id,
        levelNumber: assessment.levelNumber,
        practicalScore,
        assessmentScore,
      });
    }

    // Provide full answer explanations in response so learner gets instant feedback
    const detailedFeedback = assessment.questions.map(q => {
      const learnerAns = evaluatedAnswers.find(a => a.questionId === q.id);
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        selectedAnswer: learnerAns ? learnerAns.selectedAnswer : -1,
        isCorrect: learnerAns ? learnerAns.isCorrect : false,
        explanation: q.explanation,
        skill: q.skill,
      };
    });

    res.json({
      success: true,
      assessmentScore,
      correctCount,
      totalQuestions,
      isPassed,
      threshold: 70,
      progression: progressionResult,
      detailedFeedback,
      message: isPassed
        ? `Congratulations! You passed the theoretical assessment with ${assessmentScore}%. Level ${assessment.levelNumber} is completed!`
        : `You scored ${assessmentScore}%, which is below the 70% passing threshold. Please review the clinical rationales and try again.`,
    });
  } catch (err) {
    console.error('Submit assessment error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error submitting assessment.',
    });
  }
};

export default {
  generateAssessment,
  submitAssessment,
};
