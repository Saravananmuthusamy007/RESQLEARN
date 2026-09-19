import mongoose from 'mongoose';

const levelVersionSchema = new mongoose.Schema(
  {
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level',
      required: true,
    },
    levelNumber: {
      type: Number,
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    changeSummary: {
      type: String,
      default: 'Version updated by administrator',
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

levelVersionSchema.index({ level: 1, version: 1 }, { unique: true });

const LevelVersion = mongoose.model('LevelVersion', levelVersionSchema);
export default LevelVersion;
