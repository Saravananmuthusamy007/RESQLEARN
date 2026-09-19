import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, required: true },
    skill: { type: String, required: true },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selectedAnswer: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
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
    difficulty: {
      type: String,
      enum: ['basic', 'moderate', 'advanced'],
      required: true,
    },
    questions: [questionSchema],
    answers: [answerSchema],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
      default: false,
    },
    weakAreas: [{
      type: String,
    }],
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

assessmentSchema.index({ learner: 1, level: 1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
