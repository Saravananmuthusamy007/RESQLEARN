import TelemetryEvent from '../../models/TelemetryEvent.js';
import { calculatePracticalScore } from '../scoring/scoringEngine.js';

/**
 * Service to process and analyze simulation telemetry events
 */
export const processTelemetryStream = async ({
  learnerId,
  levelId,
  simulationAttemptId,
  events = [],
  levelConfig = {}
}) => {
  if (!events || events.length === 0) {
    return calculatePracticalScore({
      actionAccuracy: 0,
      sequenceScore: 0,
      timeScore: 0,
      mistakes: 1,
      criticalErrors: ['No simulation interactions recorded'],
    });
  }

  // Analyze events
  let totalAccuracy = 0;
  let accuracyCount = 0;
  let mistakes = 0;
  const criticalErrors = [];
  const sequenceOrder = [];
  let totalLatency = 0;

  for (const event of events) {
    if (typeof event.accuracy === 'number') {
      totalAccuracy += event.accuracy;
      accuracyCount++;
    }

    if (event.isMistake) {
      mistakes++;
    }

    if (event.isCriticalError && event.errorMessage) {
      criticalErrors.push(event.errorMessage);
    }

    if (event.stepIndex !== undefined) {
      sequenceOrder.push(event.stepIndex);
    }

    if (event.responseLatency) {
      totalLatency += event.responseLatency;
    }
  }

  // Calculate Action Accuracy
  const actionAccuracy = accuracyCount > 0 ? Math.round((totalAccuracy / accuracyCount) * 100) / 100 : 80;

  // Calculate Sequence Score
  // Check if steps were performed in monotonically non-decreasing order
  let sequenceViolations = 0;
  for (let i = 1; i < sequenceOrder.length; i++) {
    if (sequenceOrder[i] < sequenceOrder[i - 1]) {
      sequenceViolations++;
    }
  }
  const sequenceScore = Math.max(0, 100 - (sequenceViolations * 15));

  // Calculate Time Score
  // Pacing and prompt latency score
  const avgLatency = accuracyCount > 0 ? totalLatency / accuracyCount : 2000;
  let timeScore = 95;
  if (avgLatency > 5000) {
    timeScore = Math.max(40, 95 - Math.floor((avgLatency - 5000) / 500));
  }

  return calculatePracticalScore({
    actionAccuracy,
    sequenceScore,
    timeScore,
    mistakes,
    criticalErrors,
    telemetryEvents: events,
    levelConfig,
  });
};

export const saveTelemetryBatch = async ({
  learnerId,
  levelId,
  simulationAttemptId,
  events = [],
}) => {
  if (!events || events.length === 0) return [];

  const docs = events.map(e => ({
    learner: learnerId,
    level: levelId,
    simulationAttempt: simulationAttemptId,
    eventType: e.eventType || 'action',
    timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
    target: e.target || '',
    action: e.action || '',
    accuracy: Number(e.accuracy) || 100,
    responseLatency: Number(e.responseLatency) || 0,
    techniqueData: e.techniqueData || {},
    metadata: e.metadata || {},
  }));

  return await TelemetryEvent.insertMany(docs);
};

export default {
  processTelemetryStream,
  saveTelemetryBatch,
};
