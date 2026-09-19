import mongoose from 'mongoose';

const simulationAttemptSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level',
      required: true,
    },
    levelNumber: {
      type: Number,
      required: true,
    },
    levelVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    telemetry: {
      type: Array,
      default: [],
    },
    practicalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    actionAccuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    sequenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timeScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    mistakes: {
      type: Number,
      default: 0,
    },
    criticalErrors: [{
      type: String,
    }],
    weakAreas: [{
      type: String,
    }],
    strengths: [{
      type: String,
    }],
    isPassed: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

simulationAttemptSchema.index({ learner: 1, level: 1 });
simulationAttemptSchema.index({ learner: 1, createdAt: -1 });

const SimulationAttempt = mongoose.model('SimulationAttempt', simulationAttemptSchema);
export default SimulationAttempt;
