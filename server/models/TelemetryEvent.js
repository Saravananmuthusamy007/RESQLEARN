import mongoose from 'mongoose';

const telemetryEventSchema = new mongoose.Schema(
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
    simulationAttempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SimulationAttempt',
    },
    eventType: {
      type: String,
      required: true, // compression, pressure, water_temp, thrust, splint_align, etc.
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    target: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      default: '',
    },
    accuracy: {
      type: Number,
      default: 100,
    },
    responseLatency: {
      type: Number, // milliseconds
      default: 0,
    },
    techniqueData: {
      type: Object, // rate, depth, pressure, duration, vector, etc.
      default: {},
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

telemetryEventSchema.index({ learner: 1, level: 1 });
telemetryEventSchema.index({ simulationAttempt: 1 });

const TelemetryEvent = mongoose.model('TelemetryEvent', telemetryEventSchema);
export default TelemetryEvent;
