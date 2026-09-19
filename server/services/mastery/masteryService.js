import Mastery from '../../models/Mastery.js';
import Level from '../../models/Level.js';
import ActivityLog from '../../models/ActivityLog.js';
import { issueCertificateForLearner } from '../certification/certificateService.js';

/**
 * Update mastery and unlock next level if practical and assessment thresholds are met:
 * Practical >= 75% AND Assessment >= 70%
 */
export async function evaluateAndUnlockProgression({
  learnerId,
  levelNumber,
  practicalScore,
  assessmentScore,
}) {
  const level = await Level.findOne({ levelNumber });
  if (!level) throw new Error(`Level ${levelNumber} not found.`);

  let mastery = await Mastery.findOne({ learner: learnerId, levelNumber });
  if (!mastery) {
    mastery = await Mastery.create({
      learner: learnerId,
      level: level._id,
      levelNumber,
      practicalScore,
      assessmentScore,
      status: 'in_progress',
      attempts: 1,
    });
  } else {
    mastery.practicalScore = Math.max(mastery.practicalScore || 0, practicalScore);
    mastery.assessmentScore = Math.max(mastery.assessmentScore || 0, assessmentScore);
    mastery.attempts = (mastery.attempts || 0) + 1;
  }

  const isLevelCompleted = mastery.practicalScore >= 75 && mastery.assessmentScore >= 70;
  let nextLevelUnlocked = null;
  let certificateGenerated = false;

  if (isLevelCompleted) {
    mastery.status = 'completed';
    mastery.completedAt = new Date();
    await mastery.save();

    await ActivityLog.create({
      user: learnerId,
      action: 'LEVEL_COMPLETED',
      entity: 'Level',
      entityId: level._id.toString(),
      metadata: { levelNumber, practicalScore, assessmentScore },
    });

    // If levels 1-4, unlock next level
    if (levelNumber < 5) {
      const nextLevelNum = levelNumber + 1;
      const nextLevel = await Level.findOne({ levelNumber: nextLevelNum });
      if (nextLevel) {
        let nextMastery = await Mastery.findOne({ learner: learnerId, levelNumber: nextLevelNum });
        if (!nextMastery) {
          nextMastery = await Mastery.create({
            learner: learnerId,
            level: nextLevel._id,
            levelNumber: nextLevelNum,
            status: 'unlocked',
            unlockedAt: new Date(),
          });
        } else if (nextMastery.status === 'locked') {
          nextMastery.status = 'unlocked';
          nextMastery.unlockedAt = new Date();
          await nextMastery.save();
        }
        nextLevelUnlocked = nextLevelNum;

        await ActivityLog.create({
          user: learnerId,
          action: 'LEVEL_UNLOCKED',
          entity: 'Level',
          entityId: nextLevel._id.toString(),
          metadata: { levelNumber: nextLevelNum },
        });
      }
    } else if (levelNumber === 5) {
      // Level 5 completed! Verify all 5 are completed and issue certificate
      try {
        const cert = await issueCertificateForLearner(learnerId);
        if (cert) {
          certificateGenerated = true;
          await ActivityLog.create({
            user: learnerId,
            action: 'CERTIFICATE_ISSUED',
            entity: 'Certificate',
            entityId: cert.certificateId,
            metadata: { overallScore: cert.overallScore },
          });
        }
      } catch (certErr) {
        console.error('Certificate issue trigger error:', certErr.message);
      }
    }
  } else {
    mastery.status = 'in_progress';
    await mastery.save();
  }

  return {
    isLevelCompleted,
    currentLevelNumber: levelNumber,
    mastery,
    nextLevelUnlocked,
    certificateGenerated,
  };
}

export default {
  evaluateAndUnlockProgression,
};
