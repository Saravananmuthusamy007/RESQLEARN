import Level from '../models/Level.js';
import LevelVersion from '../models/LevelVersion.js';
import Mastery from '../models/Mastery.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all levels with user mastery status
// @route   GET /api/levels
// @access  Private
export const getLevels = async (req, res) => {
  try {
    const levels = await Level.find({ published: true }).sort({ levelNumber: 1 });
    const userMastery = await Mastery.find({ learner: req.user._id });

    const masteryMap = {};
    userMastery.forEach(m => {
      masteryMap[m.levelNumber] = m;
    });

    const levelsWithProgress = levels.map(l => {
      const mastery = masteryMap[l.levelNumber];
      // Level 1 is always unlocked by default for learners; admins can access all
      let status = 'locked';
      if (req.user.role === 'admin') {
        status = 'unlocked';
      } else if (l.levelNumber === 1) {
        status = mastery ? mastery.status : 'unlocked';
      } else {
        status = mastery ? mastery.status : 'locked';
      }

      return {
        id: l._id,
        levelNumber: l.levelNumber,
        title: l.title,
        subtitle: l.subtitle,
        description: l.description,
        estimatedMinutes: l.estimatedMinutes,
        status,
        practicalScore: mastery ? mastery.practicalScore : 0,
        assessmentScore: mastery ? mastery.assessmentScore : 0,
        attempts: mastery ? mastery.attempts : 0,
        currentVersion: l.currentVersion,
      };
    });

    res.json({
      success: true,
      levels: levelsWithProgress,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching levels.',
    });
  }
};

// @desc    Get specific level details (learning content, steps, objectives)
// @route   GET /api/levels/:id
// @access  Private
export const getLevelById = async (req, res) => {
  try {
    const { id } = req.params;
    let level;

    // Support lookup by MongoDB _id or by levelNumber (1-5)
    if (id.length === 24) {
      level = await Level.findById(id);
    } else {
      level = await Level.findOne({ levelNumber: parseInt(id, 10) });
    }

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found.',
      });
    }

    // Role check: if learner, verify level is not locked
    if (req.user.role === 'learner' && level.levelNumber > 1) {
      const mastery = await Mastery.findOne({
        learner: req.user._id,
        levelNumber: level.levelNumber,
      });

      if (!mastery || mastery.status === 'locked') {
        return res.status(403).json({
          success: false,
          message: `Level ${level.levelNumber} is locked. You must complete Level ${level.levelNumber - 1} first.`,
        });
      }
    }

    res.json({
      success: true,
      level,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching level.',
    });
  }
};

// @desc    Update level configuration and create new LevelVersion snapshot (Admin only)
// @route   PUT /api/levels/:id
// @access  Private (Admin)
export const updateLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      description,
      learningContent,
      procedureSteps,
      objectives,
      interactiveTargets,
      scoringConfig,
      adaptiveAssessmentConfig,
      questionBank,
      changeSummary,
    } = req.body;

    const level = await Level.findById(id);
    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found.' });
    }

    // Increment version
    const newVersion = (level.currentVersion || 1) + 1;
    level.currentVersion = newVersion;

    if (title) level.title = title;
    if (subtitle !== undefined) level.subtitle = subtitle;
    if (description) level.description = description;
    if (learningContent) level.learningContent = learningContent;
    if (procedureSteps) level.procedureSteps = procedureSteps;
    if (objectives) level.objectives = objectives;
    if (interactiveTargets) level.interactiveTargets = interactiveTargets;
    if (scoringConfig) level.scoringConfig = scoringConfig;
    if (adaptiveAssessmentConfig) level.adaptiveAssessmentConfig = adaptiveAssessmentConfig;
    if (questionBank) level.questionBank = questionBank;

    await level.save();

    // Create immutable LevelVersion snapshot
    await LevelVersion.create({
      level: level._id,
      levelNumber: level.levelNumber,
      version: newVersion,
      config: level.toObject(),
      updatedBy: req.user._id,
      changeSummary: changeSummary || `Admin updated level configuration to v${newVersion}`,
      published: true,
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'LEVEL_VERSION_CREATED',
      entity: 'Level',
      entityId: level._id.toString(),
      metadata: { levelNumber: level.levelNumber, version: newVersion },
    });

    res.json({
      success: true,
      message: `Level ${level.levelNumber} updated successfully to version ${newVersion}.`,
      level,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error updating level.',
    });
  }
};

export default {
  getLevels,
  getLevelById,
  updateLevel,
};
