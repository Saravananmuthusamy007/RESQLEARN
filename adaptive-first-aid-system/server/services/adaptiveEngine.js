/**
 * adaptiveEngine.js - Gemini-Enhanced Adaptive Engine for AdaptAid
 * Dynamically selects question difficulty mix and focuses on weak topic tags
 * matching the learner's weaknesses, mistake tags, attempt count, response time,
 * and Google Gemini clinical telemetry evaluation from practical simulations.
 */

/**
 * Recommends an adaptive question set profile and pedagogical explanation
 * @param {Object} practicalAttempt - Latest practical simulation attempt data
 * @param {Array} previousMcqAttempts - Array of prior MCQ attempts on this level
 * @param {Object} level - Current Level model document
 * @returns {Object} { difficultyMix, focusTags, reason, isRemedial, category }
 */
function recommendQuestionSet(practicalAttempt, previousMcqAttempts = [], level = {}) {
  const practicalThreshold = Number(level?.practicalThreshold) || 75;
  const mcqThreshold = level?.mcqThreshold || 70;

  // Extract practical parameters
  const practicalScore = practicalAttempt ? Number(practicalAttempt.compositeScore || 0) : 80;
  const attemptCount = practicalAttempt ? Number(practicalAttempt.attemptNumber || practicalAttempt.attempts || 1) : 1;
  const responseTimeMs = practicalAttempt ? Number(practicalAttempt.responseTimeMs || 0) : 0;
  const sequenceCorrect = practicalAttempt ? practicalAttempt.sequenceCorrect !== false : true;
  const sequenceAccuracy = practicalAttempt ? Number(practicalAttempt.sequenceAccuracy ?? (sequenceCorrect ? 100 : 50)) : 100;
  const actionCorrectness = practicalAttempt ? Number(practicalAttempt.actionCorrectness || 80) : 80;
  const targetAccuracy = practicalAttempt ? Number(practicalAttempt.targetAccuracy || 80) : 80;
  const weakAreas = practicalAttempt?.weakAreas || [];
  const geminiEval = practicalAttempt?.geminiEvaluation || null;

  // Inspect previous MCQ attempt (if any)
  const lastMcq = previousMcqAttempts.length > 0 ? previousMcqAttempts[previousMcqAttempts.length - 1] : null;
  const lastMcqFailed = lastMcq ? (lastMcq.passed === false || lastMcq.score < mcqThreshold) : false;
  const isRemedial = lastMcqFailed || previousMcqAttempts.length > 0;

  // --- Rule 1: Dynamic Difficulty Distribution ---
  // High Performer (>= 90% or >= 85% with gemini high mastery): In-Depth / Advanced Questions
  // Borderline / Remedial (< threshold + 10, or >= 3 attempts, or previous failed MCQ): Foundational Questions
  // Standard: balanced mix
  let difficultyMix = { easy: 0.30, medium: 0.50, hard: 0.20 };
  let category = 'balanced';

  if (practicalScore >= 90 && attemptCount === 1 && !lastMcqFailed) {
    // High mastery: In-depth / advanced clinical challenge
    difficultyMix = { easy: 0.15, medium: 0.35, hard: 0.50 };
    category = 'advanced';
  } else if (practicalScore < (practicalThreshold + 10) || attemptCount >= 3 || lastMcqFailed) {
    // Borderline passing / remedial: Foundational scaffolding
    difficultyMix = { easy: 0.60, medium: 0.30, hard: 0.10 };
    category = 'foundational';
  } else if (geminiEval?.difficultyMix) {
    difficultyMix = geminiEval.difficultyMix;
    category = geminiEval.recommendedDifficulty || 'balanced';
  }

  // --- Rule 2: Mistake Tags Extraction from Previous MCQ Failures ---
  const focusTags = [];

  if (lastMcq && lastMcq.questions && Array.isArray(lastMcq.questions)) {
    lastMcq.questions.forEach((q) => {
      if (!q.correct && q.tagsFromQuestion && Array.isArray(q.tagsFromQuestion)) {
        focusTags.push(...q.tagsFromQuestion);
      }
    });
  }

  // --- Rule 3: Weakness Tag Identification from Practical Telemetry & Gemini ---
  if (geminiEval?.recommendedFocusTags && Array.isArray(geminiEval.recommendedFocusTags)) {
    focusTags.push(...geminiEval.recommendedFocusTags);
  }

  // Parameter 1: Action Sequence
  if (!sequenceCorrect || sequenceAccuracy < 80) {
    focusTags.push('sequence');
    focusTags.push('protocol');
  }

  // Parameter 2: Action Correctness / Technique
  if (actionCorrectness < 80) {
    focusTags.push('technique');
  }

  // Parameter 3: Target-Area Accuracy
  if (targetAccuracy < 80) {
    focusTags.push('target-area');
  }

  // Parameter 4: Response Time (> 60 seconds is considered hesitant)
  if (responseTimeMs > 60000) {
    focusTags.push('timing');
    focusTags.push('safety');
  }

  // Parameter 5: Specific weak areas flagged during simulation
  if (Array.isArray(weakAreas)) {
    weakAreas.forEach((area) => {
      const lower = area.toLowerCase();
      if (lower.includes('target') || lower.includes('position') || lower.includes('landmark')) focusTags.push('target-area');
      if (lower.includes('sequence') || lower.includes('step') || lower.includes('order')) focusTags.push('sequence');
      if (lower.includes('procedure') || lower.includes('technique') || lower.includes('depth') || lower.includes('rhythm')) focusTags.push('technique');
      if (lower.includes('safety') || lower.includes('ppe') || lower.includes('hazard')) focusTags.push('safety');
      if (lower.includes('time') || lower.includes('timing') || lower.includes('reaction')) focusTags.push('timing');
    });
  }

  // Deduplicate tags while preserving insertion priority
  const uniqueFocusTags = [...new Set(focusTags)];

  // --- Rule 4: Transparent Pedagogical Rationale Construction ---
  const reason = buildExplanation({
    practicalScore,
    attemptCount,
    responseTimeMs,
    actionCorrectness,
    targetAccuracy,
    sequenceAccuracy,
    difficultyMix,
    focusTags: uniqueFocusTags,
    isRemedial,
    lastMcqFailed,
    category,
    geminiEval
  });

  return {
    difficultyMix,
    focusTags: uniqueFocusTags,
    reason,
    isRemedial,
    category
  };
}

/**
 * Builds clear learner-facing explanation of why specific questions were chosen
 */
function buildExplanation(params) {
  const {
    practicalScore,
    attemptCount,
    responseTimeMs,
    difficultyMix,
    focusTags,
    isRemedial,
    lastMcqFailed,
    category,
    geminiEval
  } = params;

  const dominantDifficulty = Object.entries(difficultyMix).sort((a, b) => b[1] - a[1])[0][0];
  const responseTimeSec = Math.round(responseTimeMs / 1000);

  let explanation = '';

  if (geminiEval?.clinicalCritique) {
    if (category === 'foundational') {
      explanation += `Adaptive Foundational Diagnostic: Based on simulation score (${practicalScore}%), difficulty is skewed toward ${dominantDifficulty} to consolidate foundational emergency protocols. `;
    } else if (category === 'advanced') {
      explanation += `Adaptive Clinical Mastery Challenge: Practical score of ${practicalScore}% demonstrated high clinical proficiency. Difficulty skewed toward ${dominantDifficulty} with in-depth clinical scenarios. `;
    } else {
      explanation += `Practical score: ${practicalScore}%, attempts: ${attemptCount}${responseTimeSec > 0 ? `, response time: ${responseTimeSec}s` : ''}. Difficulty skewed toward ${dominantDifficulty}. `;
    }
  } else if (lastMcqFailed) {
    explanation += `Remedial round generated following prior quiz attempt. Practical score: ${practicalScore}%, attempts: ${attemptCount}. Difficulty skewed toward ${dominantDifficulty}. `;
  } else if (practicalScore >= 90 && attemptCount === 1) {
    explanation += `Practical score: ${practicalScore}%, attempts: ${attemptCount}. Difficulty skewed toward ${dominantDifficulty}. `;
  } else {
    explanation += `Practical score: ${practicalScore}%, attempts: ${attemptCount}${responseTimeSec > 0 ? `, response time: ${responseTimeSec}s` : ''}. Difficulty skewed toward ${dominantDifficulty}. `;
  }

  if (focusTags && focusTags.length > 0) {
    explanation += `Focusing on: ${focusTags.join(', ')}.`;
  } else {
    explanation += `No specific weak areas detected.`;
  }

  return explanation;
}

module.exports = {
  recommendQuestionSet,
  buildExplanation
};
