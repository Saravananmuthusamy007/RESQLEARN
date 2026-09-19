/**
 * ResqLearn Deterministic Practical Scoring Service
 * 
 * Formula:
 * Raw Composite Score = (0.40 * Action Accuracy) + (0.35 * Sequence Score) + (0.25 * Time Score) - (5 * Mistakes)
 * Final Practical Score = max(0, min(100, Raw Composite Score))
 * 
 * Passing Threshold: >= 75%
 */

export const PRACTICAL_PASSING_THRESHOLD = 75;

export function calculatePracticalScore({
  actionAccuracy = 0,
  sequenceScore = 0,
  timeScore = 0,
  mistakes = 0,
  criticalErrors = [],
  telemetryEvents = [],
  levelConfig = {}
}) {
  // Clamp input sub-scores to [0, 100]
  const clampedAccuracy = Math.max(0, Math.min(100, Number(actionAccuracy) || 0));
  const clampedSequence = Math.max(0, Math.min(100, Number(sequenceScore) || 0));
  const clampedTime = Math.max(0, Math.min(100, Number(timeScore) || 0));
  const cleanMistakes = Math.max(0, parseInt(mistakes, 10) || 0);

  // Exact composite formula required by specification
  const rawComposite =
    (0.40 * clampedAccuracy) +
    (0.35 * clampedSequence) +
    (0.25 * clampedTime) -
    (5 * cleanMistakes);

  // Apply critical error penalty (if any critical error occurred, practical score is capped below passing or penalized)
  let adjustedScore = rawComposite;
  if (criticalErrors && criticalErrors.length > 0) {
    // Critical errors like applying ice to burns or releasing windlass severely impact score
    adjustedScore = Math.min(adjustedScore, 50); // Capped below passing
  }

  // Final practical score clamped between 0 and 100, rounded to 2 decimal places
  const finalPracticalScore = Math.max(0, Math.min(100, Math.round(adjustedScore * 100) / 100));

  // Determine strengths and weak areas
  const weakAreas = [];
  const strengths = [];

  if (clampedAccuracy >= 85) {
    strengths.push('High clinical technique and physical target accuracy');
  } else if (clampedAccuracy < 75) {
    weakAreas.push('Physical target positioning and technique execution');
  }

  if (clampedSequence >= 85) {
    strengths.push('Flawless adherence to standard emergency BLS procedure sequence');
  } else if (clampedSequence < 75) {
    weakAreas.push('Out-of-order procedural steps and skipped verification checks');
  }

  if (clampedTime >= 85) {
    strengths.push('Rapid emergency response latency and sustained intervention rate');
  } else if (clampedTime < 75) {
    weakAreas.push('Delayed intervention latency or erratic compression/cooling pacing');
  }

  if (cleanMistakes > 0) {
    weakAreas.push(`${cleanMistakes} procedure mistake${cleanMistakes > 1 ? 's' : ''} detected during simulation`);
  }

  if (criticalErrors && criticalErrors.length > 0) {
    criticalErrors.forEach(err => weakAreas.push(`CRITICAL SAFETY ERROR: ${err}`));
  }

  const isPassed = finalPracticalScore >= PRACTICAL_PASSING_THRESHOLD && (!criticalErrors || criticalErrors.length === 0);

  return {
    overallScore: finalPracticalScore,
    practicalScore: finalPracticalScore,
    actionAccuracy: clampedAccuracy,
    sequenceScore: clampedSequence,
    timeScore: clampedTime,
    mistakes: cleanMistakes,
    criticalErrors: criticalErrors || [],
    weakAreas,
    strengths,
    isPassed,
    threshold: PRACTICAL_PASSING_THRESHOLD,
  };
}

export default {
  PRACTICAL_PASSING_THRESHOLD,
  calculatePracticalScore,
};
