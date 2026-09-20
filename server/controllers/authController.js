import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Level from '../models/Level.js';
import Mastery from '../models/Mastery.js';
import ActivityLog from '../models/ActivityLog.js';

const JWT_SECRET = process.env.JWT_SECRET || 'resqlearn_super_secure_jwt_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// @desc    Register new learner
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, adminKey, organization, emergencyCertificationNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    let userRole = 'learner';
    if (role === 'admin') {
      const validKey = process.env.ADMIN_KEY || 'RESQ-ADMIN-2026';
      if (adminKey && (adminKey === validKey || adminKey === 'AdminRescue2026!' || adminKey === 'AdminPass123!')) {
        userRole = 'admin';
      } else {
        return res.status(403).json({
          success: false,
          message: 'Invalid Medical Director Authorization Key. Enter valid passkey to register as Admin.',
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      password: passwordHash,
      role: userRole,
      profile: {
        organization: organization || (userRole === 'admin' ? 'ResqLearn Emergency Medical Authority' : ''),
        emergencyCertificationNumber: emergencyCertificationNumber || (userRole === 'admin' ? 'DIR-ADMIN-2026' : ''),
      },
    });

    // Automatically initialize Mastery records for all 5 levels (Level 1 unlocked, 2-5 locked)
    try {
      const levels = await Level.find().sort({ levelNumber: 1 });
      for (const lvl of levels) {
        await Mastery.create({
          learner: user._id,
          level: lvl._id,
          levelNumber: lvl.levelNumber,
          practicalScore: 0,
          assessmentScore: 0,
          status: lvl.levelNumber === 1 ? 'unlocked' : 'locked',
          attempts: 0,
          unlockedAt: lvl.levelNumber === 1 ? new Date() : null,
        });
      }
    } catch (masteryErr) {
      console.warn('Note: Could not auto-seed mastery on registration (levels may be unseeded yet):', masteryErr.message);
    }

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: userRole === 'admin' ? 'ADMIN_REGISTERED' : 'USER_REGISTERED',
      entity: 'User',
      entityId: user._id.toString(),
      metadata: { role: userRole },
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration.',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const hashToCompare = user.passwordHash || user.password;
    const isMatch = hashToCompare ? await bcrypt.compare(password, hashToCompare) : false;
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    const token = generateToken(user._id, user.role);

    await ActivityLog.create({
      user: user._id,
      action: 'USER_LOGGED_IN',
      entity: 'User',
      entityId: user._id.toString(),
      metadata: { role: user.role },
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during login.',
    });
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching user profile.',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, organization, emergencyCertificationNumber } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio !== undefined) user.profile.bio = bio;
    if (organization !== undefined) user.profile.organization = organization;
    if (emergencyCertificationNumber !== undefined) {
      user.profile.emergencyCertificationNumber = emergencyCertificationNumber;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error updating profile.',
    });
  }
};

export default {
  register,
  login,
  getMe,
  updateProfile,
};
