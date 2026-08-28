// SimulationTimer.js - Precise time tracking for simulations

export class SimulationTimer {
  constructor() {
    this.startTime = 0;
    this.elapsedMs = 0;
    this.isRunning = false;
    this.stepStartTime = 0;
    this.stepLatencies = [];
  }

  start() {
    this.startTime = Date.now();
    this.stepStartTime = this.startTime;
    this.elapsedMs = 0;
    this.isRunning = true;
    this.stepLatencies = [];
  }

  recordStepLatency() {
    if (!this.isRunning) return 0;
    const now = Date.now();
    const latency = now - this.stepStartTime;
    this.stepLatencies.push(latency);
    this.stepStartTime = now;
    return latency;
  }

  pause() {
    if (this.isRunning) {
      this.elapsedMs += Date.now() - this.startTime;
      this.isRunning = false;
    }
  }

  getElapsedSeconds() {
    if (this.isRunning) {
      return Math.floor((this.elapsedMs + (Date.now() - this.startTime)) / 1000);
    }
    return Math.floor(this.elapsedMs / 1000);
  }

  getElapsedMs() {
    if (this.isRunning) {
      return this.elapsedMs + (Date.now() - this.startTime);
    }
    return this.elapsedMs;
  }

  getAverageStepLatency() {
    if (this.stepLatencies.length === 0) return 0;
    const total = this.stepLatencies.reduce((a, b) => a + b, 0);
    return Math.round(total / this.stepLatencies.length);
  }

  reset() {
    this.startTime = 0;
    this.elapsedMs = 0;
    this.isRunning = false;
    this.stepStartTime = 0;
    this.stepLatencies = [];
  }
}
