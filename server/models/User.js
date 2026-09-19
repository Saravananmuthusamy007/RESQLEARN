import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['learner', 'admin'],
      default: 'learner',
    },
    profile: {
      avatar: { type: String, default: '' },
      bio: { type: String, default: '' },
      organization: { type: String, default: '' },
      emergencyCertificationNumber: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
export default User;
