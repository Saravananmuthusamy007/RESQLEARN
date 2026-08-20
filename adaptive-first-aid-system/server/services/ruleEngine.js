/**
 * Rule Engine for Adaptive MCQ Question Selection
 * Analyzes practical assessment scores, sub-metrics, and previous MCQ attempts
 * to determine difficulty weighting, weak topic tags, and transparent rationale.
 */

function recommendQuestionSet(practicalAttempt, previousMcqAttempts, level) {
  const scores = {
    practical: practicalAttempt ? practicalAttempt.compositeScore : 80,
    attempts: practicalAttempt ? practicalAttempt.attemptNumber : 1,
    responseTime: practicalAttempt ? practicalAttempt.responseTimeMs : 0,
    sequenceCorrect: practicalAttempt ? practicalAttempt.sequenceCorrect : true,
    actionCorrectness: practicalAttempt ? practicalAttempt.actionCorrectness : 80,
    targetAccuracy: practicalAttempt ? practicalAttempt.targetAccuracy : 80,
    lastMcqScore: previousMcqAttempts && previousMcqAttempts.length > 0
      ? previousMcqAttempts[previousMcqAttempts.length - 1].score
      : null
  };

  // Rule 1: Difficulty Mix
  // Strong performer (>=90% practical & 1 attempt) -> Hard skewed set
  // Struggled (< threshold + 10 or >=3 attempts) -> Easy skewed set
  let difficultyMix = { easy: 0.50, medium: 0.35, hard: 0.15 };
  const practicalThreshold = level ? level.practicalThreshold || 80 : 80;

  if (scores.practical >= 90 && scores.attempts === 1) {
    difficultyMix = { easy: 0.15, medium: 0.35, hard: 0.50 };
  } else if (scores.practical < practicalThreshold + 10 || scores.attempts >= 3) {
    difficultyMix = { easy: 0.60, medium: 0.30, hard: 0.10 };
  }

  // Rule 2: Retry Focus Tags from previous MCQ attempt failures
  let focusTags = [];
  if (previousMcqAttempts && previousMcqAttempts.length > 0) {
    const lastMcq = previousMcqAttempts[previousMcqAttempts.length - 1];
    if (lastMcq.questions && Array.isArray(lastMcq.questions)) {
      lastMcq.questions.forEach(q => {
        if (!q.correct && q.tagsFromQuestion && Array.isArray(q.tagsFromQuestion)) {
          focusTags.push(...q.tagsFromQuestion);
        }
      });
    }
  }

  // Rule 3: Prioritize practical weaknesses
  if (scores.sequenceCorrect === false) {
    focusTags.push('sequence');
  }
  if (scores.actionCorrectness < 80) {
    focusTags.push('technique');
  }
  if (scores.targetAccuracy < 80) {
    focusTags.push('target-area');
  }

  // Deduplicate focus tags
  focusTags = [...new Set(focusTags)];

  const reason = buildExplanation(scores, difficultyMix, focusTags);

  return {
    difficultyMix,
    focusTags,
    reason
  };
}

function buildExplanation(scores, difficultyMix, focusTags) {
  const dominantDifficulty = Object.entries(difficultyMix).sort((a, b) => b[1] - a[1])[0][0];
  let explanation = `Practical score: ${scores.practical}%, attempts: ${scores.attempts}. ` +
    `Difficulty skewed toward ${dominantDifficulty}. `;
  if (focusTags.length > 0) {
    explanation += `Focusing on: ${focusTags.join(', ')}.`;
  } else {
    explanation += `No specific weak areas detected.`;
  }
  return explanation;
}

module.exports = { recommendQuestionSet, buildExplanation };
