/**
 * ResqLearn Client-Side Simulation Telemetry Collector
 * Buffers and tracks granular physical actions, timestamps, latencies, and accuracy
 */
export class TelemetryCollector {
  constructor(levelNumber) {
    this.levelNumber = levelNumber;
    this.startTime = Date.now();
    this.events = [];
    this.mistakes = 0;
    this.criticalErrors = [];
    this.stepStartTime = Date.now();
  }

  startStep(stepIndex) {
    this.currentStepIndex = stepIndex;
    this.stepStartTime = Date.now();
  }

  recordAction({
    eventType,
    target = '',
    action = '',
    accuracy = 100,
    techniqueData = {},
    isMistake = false,
    isCriticalError = false,
    errorMessage = '',
  }) {
    const now = Date.now();
    const responseLatency = now - this.stepStartTime;

    if (isMistake) {
      this.mistakes++;
    }

    if (isCriticalError && errorMessage) {
      if (!this.criticalErrors.includes(errorMessage)) {
        this.criticalErrors.push(errorMessage);
      }
    }

    const event = {
      eventType,
      target,
      action,
      accuracy: Math.max(0, Math.min(100, Number(accuracy) || 0)),
      responseLatency,
      timestamp: new Date().toISOString(),
      stepIndex: this.currentStepIndex || 1,
      techniqueData,
      isMistake,
      isCriticalError,
      errorMessage,
    };

    this.events.push(event);
    return event;
  }

  getSummary() {
    const totalTimeMs = Date.now() - this.startTime;
    const accuracyEvents = this.events.filter(e => typeof e.accuracy === 'number');
    const avgAccuracy = accuracyEvents.length > 0
      ? Math.round((accuracyEvents.reduce((sum, e) => sum + e.accuracy, 0) / accuracyEvents.length) * 10) / 10
      : 80;

    // Sequence correctness check
    let seqViolations = 0;
    for (let i = 1; i < this.events.length; i++) {
      if (this.events[i].stepIndex < this.events[i - 1].stepIndex) {
        seqViolations++;
      }
    }
    const sequenceScore = Math.max(0, 100 - (seqViolations * 15));

    // Time pacing score (penalize excessive hesitation)
    const avgLatency = accuracyEvents.length > 0 ? (totalTimeMs / accuracyEvents.length) : 2000;
    let timeScore = 95;
    if (avgLatency > 6000) {
      timeScore = Math.max(40, 95 - Math.floor((avgLatency - 6000) / 500));
    }

    return {
      levelNumber: this.levelNumber,
      totalDurationSeconds: Math.round(totalTimeMs / 1000),
      actionAccuracy: avgAccuracy,
      sequenceScore,
      timeScore,
      mistakes: this.mistakes,
      criticalErrors: this.criticalErrors,
      telemetryEvents: this.events,
    };
  }
}

export default TelemetryCollector;
