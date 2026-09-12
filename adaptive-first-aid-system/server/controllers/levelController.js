const Level = require('../models/Level');
const Progress = require('../models/Progress');

// @desc    Get all levels merged with learner's unlock & completion progress
// @route   GET /api/levels
// @access  Private (Learner & Admin)
exports.getLevels = async (req, res) => {
  try {
    const levels = await Level.find().sort({ order: 1 });
    const userId = req.user.id;

    // Fetch existing progress for user
    let userProgress = await Progress.find({ user: userId });

    // If Level 1 progress doesn't exist for user, auto-initialize
    if (levels.length > 0) {
      const level1 = levels.find(l => l.order === 1);
      if (level1) {
        const hasLevel1Progress = userProgress.some(p => p.level.toString() === level1._id.toString());
        if (!hasLevel1Progress) {
          const l1Progress = new Progress({
            user: userId,
            level: level1._id,
            unlocked: true,
            practicalPassed: false,
            mcqPassed: false,
            levelCompleted: false
          });
          try {
            await l1Progress.save();
            userProgress.push(l1Progress);
          } catch (e) {
            userProgress = await Progress.find({ user: userId });
          }
        }
      }
    }

    // Map levels with learner progress
    const levelsWithProgress = levels.map(level => {
      const prog = userProgress.find(p => p.level.toString() === level._id.toString());
      return {
        _id: level._id,
        title: level.title,
        description: level.description,
        order: level.order,
        videoUrl: level.videoUrl,
        instructions: level.instructions,
        practicalThreshold: level.practicalThreshold || 75,
        mcqThreshold: level.mcqThreshold,
        progress: prog ? {
          unlocked: prog.unlocked,
          practicalPassed: prog.practicalPassed,
          mcqPassed: prog.mcqPassed,
          levelCompleted: prog.levelCompleted,
          completedAt: prog.completedAt
        } : {
          unlocked: level.order === 1, // Fallback rule: Level 1 is unlocked
          practicalPassed: false,
          mcqPassed: false,
          levelCompleted: false,
          completedAt: null
        }
      };
    });

    res.json(levelsWithProgress);
  } catch (error) {
    console.error('Error fetching levels:', error.message);
    res.status(500).json({ message: 'Server error fetching levels' });
  }
};

// @desc    Get single level details (enforces unlock check for learners)
// @route   GET /api/levels/:id
// @access  Private (Learner & Admin)
exports.getLevelById = async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    // Admins have unrestricted access
    if (req.user.role === 'admin') {
      return res.json(level);
    }

    // Enforce unlock check for learners
    let progress = await Progress.findOne({ user: req.user.id, level: level._id });

    // Level 1 fallback check
    if (level.order === 1 && !progress) {
      progress = new Progress({
        user: req.user.id,
        level: level._id,
        unlocked: true
      });
      await progress.save();
    }

    if (!progress || !progress.unlocked) {
      return res.status(403).json({
        message: 'This level is locked. Complete the previous level to unlock.'
      });
    }

    res.json({
      ...level.toObject(),
      progress: {
        unlocked: progress.unlocked,
        practicalPassed: progress.practicalPassed,
        mcqPassed: progress.mcqPassed,
        levelCompleted: progress.levelCompleted,
        completedAt: progress.completedAt
      }
    });
  } catch (error) {
    console.error('Error fetching level:', error.message);
    res.status(500).json({ message: 'Server error fetching level details' });
  }
};

// @desc    Create a new level
// @route   POST /api/levels
// @access  Private/Admin
exports.createLevel = async (req, res) => {
  try {
    const { title, description, order, videoUrl, instructions, practicalThreshold, mcqThreshold } = req.body;

    const existingLevel = await Level.findOne({ order });
    if (existingLevel) {
      return res.status(400).json({ message: `Level with order ${order} already exists` });
    }

    const level = new Level({
      title,
      description,
      order,
      videoUrl,
      instructions: instructions || [],
      practicalThreshold: practicalThreshold !== undefined ? Number(practicalThreshold) : 75,
      mcqThreshold: mcqThreshold || 70
    });

    await level.save();
    res.status(201).json(level);
  } catch (error) {
    console.error('Error creating level:', error.message);
    res.status(500).json({ message: 'Server error creating level' });
  }
};

// @desc    Update level
// @route   PUT /api/levels/:id
// @access  Private/Admin
exports.updateLevel = async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const { title, description, order, videoUrl, instructions, practicalThreshold, mcqThreshold } = req.body;

    if (order && order !== level.order) {
      const existingLevel = await Level.findOne({ order });
      if (existingLevel) {
        return res.status(400).json({ message: `Level with order ${order} already exists` });
      }
      level.order = order;
    }

    if (title !== undefined) level.title = title;
    if (description !== undefined) level.description = description;
    if (videoUrl !== undefined) level.videoUrl = videoUrl;
    if (instructions !== undefined) level.instructions = instructions;
    if (practicalThreshold !== undefined) level.practicalThreshold = Number(practicalThreshold);
    if (mcqThreshold !== undefined) level.mcqThreshold = Number(mcqThreshold);

    await level.save();
    res.json(level);
  } catch (error) {
    console.error('Error updating level:', error.message);
    res.status(500).json({ message: 'Server error updating level' });
  }
};

// @desc    Delete level
// @route   DELETE /api/levels/:id
// @access  Private/Admin
exports.deleteLevel = async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    await Level.findByIdAndDelete(req.params.id);
    await Progress.deleteMany({ level: req.params.id });

    res.json({ message: 'Level deleted successfully' });
  } catch (error) {
    console.error('Error deleting level:', error.message);
    res.status(500).json({ message: 'Server error deleting level' });
  }
};
