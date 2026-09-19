import mongoose from 'mongoose';

const masterySchema = new mongoose.Schema(
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
      min: 1,
      max: 5,
    },
    practicalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    assessmentScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['locked', 'unlocked', 'in_progress', 'completed'],
      default: 'locked',
    },
    attempts: {
      type: Number,
      default: 0,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

masterySchema.index({ learner: 1, levelNumber: 1 }, { unique: true });
masterySchema.index({ learner: 1, status: 1 });

const Mastery = mongoose.model('Mastery', masterySchema);
export default Mastery;
