import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Simulation UX',
        'Clinical Accuracy',
        'Adaptive Assessment',
        'Bug Report',
        'Feature Request',
        'General Feedback'
      ],
      default: 'General Feedback',
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ learner: 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
