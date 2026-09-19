import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    learnerName: {
      type: String,
      required: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      default: 'First-Aid & Basic Life Support (BLS) Clinical Competency',
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    completedLevels: [{
      type: Number,
      required: true,
    }],
    completionDate: {
      type: Date,
      default: Date.now,
    },
    sha256Hash: {
      type: String,
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ['VALID', 'REVOKED'],
      default: 'VALID',
    },
    issuer: {
      type: String,
      default: 'ResqLearn Emergency Medical Training Authority',
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ learner: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;
