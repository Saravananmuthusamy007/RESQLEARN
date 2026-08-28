// ScoreManager.js - Weighted score calculation engine & adaptive weak area identification

import { SCORING_WEIGHTS, PRACTICAL_THRESHOLD } from './SimulationConfig.js';

export class ScoreManager {
  static calculateFinalScore({
    actionCorrectness,
    targetAccuracy,
    sequenceAccuracy,
    elapsedMs,
    attemptsCount = 1
  }) {
    const actionScore = Math.max(0, Math.min(100, Number(actionCorrectness) || 0));
    const targetScore = Math.max(0, Math.min(100, Number(targetAccuracy) || 0));
    const seqScore = Math.max(0, Math.min(100, Number(sequenceAccuracy) || 0));

    // Response time score: 100 points for <= 30 seconds, tapering to 0 at 120 seconds
    const elapsedSec = (elapsedMs || 0) / 1000;
    let timeScore = 100;
    if (elapsedSec > 30) {
      timeScore = Math.max(0, 100 - ((elapsedSec - 30) * (100 / 90)));
    }
    timeScore = Math.round(timeScore);

    // Attempt efficiency score: 100 for 1 attempt, -20 for each retry
    const attemptScore = Math.max(20, 100 - (attemptsCount - 1) * 20);

    const finalScore = Math.round(
      (actionScore * SCORING_WEIGHTS.actionCorrectness) +
      (targetScore * SCORING_WEIGHTS.targetAccuracy) +
      (seqScore * SCORING_WEIGHTS.sequenceAccuracy) +
      (timeScore * SCORING_WEIGHTS.responseTime) +
      (attemptScore * SCORING_WEIGHTS.attemptEfficiency)
    );

    const passed = finalScore >= PRACTICAL_THRESHOLD;
    const weakAreas = ScoreManager.identifyWeakAreas({
      actionScore,
      targetScore,
      seqScore,
      timeScore,
      finalScore
    });

    return {
      actionCorrectness: actionScore,
      targetAccuracy: targetScore,
      sequenceAccuracy: seqScore,
      timeScore,
      attemptScore,
      finalScore,
      passed,
      practicalThreshold: PRACTICAL_THRESHOLD,
      weakAreas
    };
  }

  static identifyWeakAreas({ actionScore, targetScore, seqScore, timeScore, finalScore }) {
    const weakAreas = [];

    if (targetScore < 60) {
      weakAreas.push('Target identification & positioning accuracy');
    }
    if (seqScore < 60) {
      weakAreas.push('Emergency action sequence');
    }
    if (actionScore < 70) {
      weakAreas.push('First-aid technique precision');
    }
    if (timeScore < 50) {
      weakAreas.push('Emergency response time');
    }
    if (finalScore < 60 && weakAreas.length === 0) {
      weakAreas.push('General procedure mastery');
    }

    return weakAreas;
  }
}
