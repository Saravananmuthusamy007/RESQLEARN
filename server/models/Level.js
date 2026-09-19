import mongoose from 'mongoose';

const procedureStepSchema = new mongoose.Schema({
  stepIndex: { type: Number, required: true },
  name: { type: String, required: true },
  actionType: { type: String, required: true }, // tap, click, drag, hold, rhythm, slider, sequence
  instruction: { type: String, required: true },
  targetArea: { type: String, default: '' },
  timeLimitSeconds: { type: Number, default: 30 },
  tolerance: { type: Object, default: {} },
  criticalErrorIfWrong: { type: Boolean, default: false },
  errorFeedback: { type: String, default: '' }
}, { _id: false });

const levelSchema = new mongoose.Schema(
  {
    levelNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    estimatedMinutes: {
      type: Number,
      default: 15,
    },
    learningContent: {
      overview: { type: String, required: true },
      clinicalGuidelines: [{ type: String }],
      corePrinciples: [{ title: String, description: String, icon: String }],
      criticalWarnings: [{ type: String }],
      equipmentNeeded: [{ type: String }],
    },
    procedureSteps: [procedureStepSchema],
    objectives: [{ type: String }],
    interactiveTargets: [{
      name: { type: String, required: true },
      targetMetric: { type: String, required: true },
      idealRange: { type: String, required: true },
      toleranceMin: { type: Number },
      toleranceMax: { type: Number },
      unit: { type: String },
    }],
    scoringConfig: {
      actionAccuracyWeight: { type: Number, default: 0.40 },
      sequenceScoreWeight: { type: Number, default: 0.35 },
      timeScoreWeight: { type: Number, default: 0.25 },
      mistakePenalty: { type: Number, default: 5 },
      passingThreshold: { type: Number, default: 75 },
    },
    adaptiveAssessmentConfig: {
      passingThreshold: { type: Number, default: 70 },
      questionCount: { type: Number, default: 5 },
      difficultyRules: {
        basicThresholdMax: { type: Number, default: 80 },
        moderateThresholdMax: { type: Number, default: 90 },
      },
    },
    questionBank: {
      basic: [{
        id: String,
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String,
        skill: String,
      }],
      moderate: [{
        id: String,
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String,
        skill: String,
      }],
      advanced: [{
        id: String,
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String,
        skill: String,
      }],
    },
    currentVersion: {
      type: Number,
      default: 1,
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

const Level = mongoose.model('Level', levelSchema);
export default Level;
