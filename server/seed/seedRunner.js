import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import Level from '../models/Level.js';
import LevelVersion from '../models/LevelVersion.js';
import User from '../models/User.js';
import Mastery from '../models/Mastery.js';
import { initialLevelsData } from './seedLevels.js';

dotenv.config();

export async function runSeed() {
  console.log('--- Starting ResqLearn Database Seed Runner ---');
  await connectDB();

  try {
    // Drop legacy incompatible index from old experiments if present
    try {
      await Mastery.collection.dropIndex('userId_1_moduleId_1');
    } catch (e) {}

    // 1. Seed / Upsert Levels
    console.log('Seeding 5 Emergency Training Levels...');
    for (const lvl of initialLevelsData) {
      const existing = await Level.findOne({ levelNumber: lvl.levelNumber });
      if (!existing) {
        const createdLevel = await Level.create({ ...lvl, currentVersion: 1, published: true });
        // Create initial LevelVersion
        await LevelVersion.create({
          level: createdLevel._id,
          levelNumber: createdLevel.levelNumber,
          version: 1,
          config: createdLevel.toObject(),
          changeSummary: 'Initial clinical level seed v1.0',
          published: true,
        });
        console.log(`✓ Seeded Level ${lvl.levelNumber}: ${lvl.title}`);
      } else {
        console.log(`• Level ${lvl.levelNumber} already exists in database.`);
      }
    }

    // 2. Seed Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@resqlearn.io').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminRescue2026!';
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);
      adminUser = await User.create({
        name: 'Emergency Medical Director (Admin)',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        profile: {
          organization: 'ResqLearn Emergency Medical Training Authority',
          bio: 'Lead BLS / ACLS Instructor and Medical Simulation Director',
          emergencyCertificationNumber: 'BLS-DIR-2026-001',
        },
      });
      console.log(`✓ Seeded Admin User: ${adminEmail} (Role: admin)`);
    } else {
      console.log(`• Admin user ${adminEmail} already exists.`);
    }

    // 3. Seed Demo Learner User
    const learnerEmail = 'learner@resqlearn.io';
    const learnerPassword = 'LearnerRescue2026!';
    let learnerUser = await User.findOne({ email: learnerEmail });

    if (!learnerUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(learnerPassword, salt);
      learnerUser = await User.create({
        name: 'Alex Rivera (First Responder Cadet)',
        email: learnerEmail,
        passwordHash,
        role: 'learner',
        profile: {
          organization: 'First-Aid Trainee Corps',
          bio: 'Emergency medical responder trainee completing BLS simulation pathway',
          emergencyCertificationNumber: 'CADET-7749',
        },
      });
      console.log(`✓ Seeded Demo Learner User: ${learnerEmail} (Role: learner)`);

      // Drop any legacy incompatible indexes on masteries if present
      try {
        await Mastery.collection.dropIndexes();
      } catch (idxErr) {
        // collection might not exist yet, safe to ignore
      }

      // Initialize Mastery for Level 1 as 'unlocked' and Levels 2-5 as 'locked'
      const allLevels = await Level.find().sort({ levelNumber: 1 });
      for (const l of allLevels) {
        await Mastery.create({
          learner: learnerUser._id,
          level: l._id,
          levelNumber: l.levelNumber,
          practicalScore: 0,
          assessmentScore: 0,
          status: l.levelNumber === 1 ? 'unlocked' : 'locked',
          attempts: 0,
          unlockedAt: l.levelNumber === 1 ? new Date() : null,
        });
      }
      console.log('✓ Initialized Level 1 unlocked mastery for demo learner.');
    } else {
      console.log(`• Demo learner ${learnerEmail} already exists.`);
      // Ensure all 5 levels have mastery records
      const allLevels = await Level.find().sort({ levelNumber: 1 });
      for (const l of allLevels) {
        const hasM = await Mastery.findOne({ learner: learnerUser._id, levelNumber: l.levelNumber });
        if (!hasM) {
          await Mastery.create({
            learner: learnerUser._id,
            level: l._id,
            levelNumber: l.levelNumber,
            practicalScore: 0,
            assessmentScore: 0,
            status: l.levelNumber === 1 ? 'unlocked' : 'locked',
            attempts: 0,
            unlockedAt: l.levelNumber === 1 ? new Date() : null,
          });
        }
      }
    }

    console.log('--- ResqLearn Database Seed Complete ---');
  } catch (err) {
    console.error('Seed execution error:', err);
  } finally {
    await disconnectDB();
  }
}

// Execute when invoked directly
if (process.argv[1]?.endsWith('seedRunner.js')) {
  runSeed().then(() => process.exit(0));
}

export default runSeed;
