// ActionTracker.js - State machine action validation, sequence verification & mistake logging

export class ActionTracker {
  constructor(expectedSequence = []) {
    this.expectedSequence = expectedSequence;
    this.currentStepIndex = 0;
    this.actionsHistory = [];
    this.mistakesCount = 0;
    this.attemptsCount = 1;
    this.targetAccuracyScores = [];
    this.outOfSequenceCount = 0;
  }

  getCurrentStep() {
    if (this.currentStepIndex >= this.expectedSequence.length) {
      return 'COMPLETE';
    }
    return this.expectedSequence[this.currentStepIndex];
  }

  recordAction({ action, targetAccuracy = 100, isCorrect = true, feedback = '' }) {
    const expectedStep = this.getCurrentStep();
    const isSequenceMatch = action === expectedStep;

    if (!isSequenceMatch && action !== 'RETRY') {
      this.outOfSequenceCount++;
    }

    if (!isCorrect) {
      this.mistakesCount++;
    } else if (targetAccuracy < 60) {
      this.mistakesCount++;
    }

    if (targetAccuracy !== undefined && targetAccuracy !== null) {
      this.targetAccuracyScores.push(targetAccuracy);
    }

    const actionRecord = {
      action,
      expectedStep,
      timestamp: Date.now(),
      correct: isCorrect && isSequenceMatch,
      targetAccuracy,
      feedback
    };

    this.actionsHistory.push(actionRecord);

    if (isCorrect && isSequenceMatch) {
      this.currentStepIndex++;
    }

    return actionRecord;
  }

  incrementAttempts() {
    this.attemptsCount++;
  }

  getSequenceAccuracy() {
    if (this.actionsHistory.length === 0) return 100;
    const totalActions = this.actionsHistory.length;
    const penalty = (this.outOfSequenceCount / totalActions) * 100;
    return Math.max(0, Math.round(100 - penalty));
  }

  getActionCorrectness() {
    if (this.actionsHistory.length === 0) return 100;
    const correctCount = this.actionsHistory.filter(a => a.correct).length;
    return Math.round((correctCount / this.actionsHistory.length) * 100);
  }

  getAverageTargetAccuracy() {
    if (this.targetAccuracyScores.length === 0) return 100;
    const sum = this.targetAccuracyScores.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.targetAccuracyScores.length);
  }

  isCompleted() {
    return this.currentStepIndex >= this.expectedSequence.length - 1 || this.getCurrentStep() === 'COMPLETE';
  }

  reset() {
    this.currentStepIndex = 0;
    this.actionsHistory = [];
    this.mistakesCount = 0;
    this.targetAccuracyScores = [];
    this.outOfSequenceCount = 0;
  }
}
