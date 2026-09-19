import { generateAdaptiveAssessmentWithGemini } from './geminiService.js';
import Level from '../models/Level.js';

/**
 * Determine difficulty classification strictly per user specifications:
 * 75 <= score <= 80 -> BASIC (with mandatory fundamentals)
 * 80 < score <= 90  -> MODERATE
 * score > 90        -> ADVANCED
 */
export function determineDifficulty(practicalScore) {
  const score = Number(practicalScore);
  if (score >= 75 && score <= 80) return 'basic';
  if (score > 80 && score <= 90) return 'moderate';
  if (score > 90) return 'advanced';
  return 'basic';
}

/**
 * Strict validator for assessment question JSON structure
 */
export function validateQuestionFormat(questions, expectedDifficulty) {
  if (!Array.isArray(questions) || questions.length === 0) return false;

  for (const q of questions) {
    if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) return false;
    if (!Array.isArray(q.options) || q.options.length !== 4) return false;
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) return false;
    if (!q.explanation || typeof q.explanation !== 'string') return false;
    if (!q.skill || typeof q.skill !== 'string') return false;
  }

  // Ensure no duplicate question texts
  const questionTexts = new Set(questions.map(q => q.question.trim().toLowerCase()));
  if (questionTexts.size !== questions.length) return false;

  return true;
}

/**
 * Main adaptive generator: tries Gemini first, falls back to high-yield clinical database bank
 */
export async function getAdaptiveAssessment({
  levelId,
  levelNumber,
  practicalScore,
  weakAreas = [],
  strengths = [],
  mistakes = 0,
}) {
  const level = await Level.findOne({ levelNumber });
  if (!level) {
    throw new Error(`Level ${levelNumber} not found in database.`);
  }

  const difficulty = determineDifficulty(practicalScore);

  // 1. Attempt Gemini 2.5 Flash Adaptive Generation
  const geminiResponse = await generateAdaptiveAssessmentWithGemini({
    levelNumber,
    levelTitle: level.title,
    practicalScore,
    difficulty,
    weakAreas,
    strengths,
    mistakes,
  });

  if (geminiResponse && validateQuestionFormat(geminiResponse.questions, difficulty)) {
    return {
      source: 'gemini-2.5-flash',
      difficulty,
      questions: geminiResponse.questions.map((q, idx) => ({
        id: q.id || `gemini-q-${idx + 1}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        skill: q.skill,
      })),
    };
  }

  // 2. Deterministic Fallback to Level Question Bank
  console.log(`[Assessment Engine]: Using curated clinical fallback bank for Level ${levelNumber} (${difficulty}).`);
  const bank = level.questionBank || {};
  let fallbackQuestions = bank[difficulty] || [];

  // If difficulty bank has fewer than 5 questions, top up from basic
  if (fallbackQuestions.length < 5 && bank.basic) {
    fallbackQuestions = [...fallbackQuestions, ...bank.basic];
  }

  // Take first 5 questions
  const selectedQuestions = fallbackQuestions.slice(0, 5).map((q, idx) => ({
    id: q.id || `bank-q-${idx + 1}`,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    skill: q.skill,
  }));

  return {
    source: 'clinical-bank-fallback',
    difficulty,
    questions: selectedQuestions,
  };
}

export default {
  determineDifficulty,
  validateQuestionFormat,
  getAdaptiveAssessment,
};
