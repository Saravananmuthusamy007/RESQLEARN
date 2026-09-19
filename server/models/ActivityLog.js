import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g., 'SIMULATION_STARTED', 'SIMULATION_COMPLETED', 'ASSESSMENT_PASSED', 'LEVEL_UNLOCKED', 'CERTIFICATE_ISSUED', 'LEVEL_VERSION_CREATED'
    },
    entity: {
      type: String, // 'Level', 'SimulationAttempt', 'Assessment', 'Certificate', etc.
      required: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    metadata: {
      type: Object,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ action: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
