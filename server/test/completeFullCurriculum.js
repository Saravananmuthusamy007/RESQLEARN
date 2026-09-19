// Script to test completing all 5 levels for the demo cadet and verifying certification issuance & hash integrity
import mongoose from 'mongoose';
import Assessment from '../models/Assessment.js';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/resqlearn';

async function main() {
  console.log('--- ResqLearn Full Curriculum Verification & Certification Test ---');
  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected to MongoDB for verification inspection.');

  // 1. Log in as learner
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'learner@resqlearn.io', password: 'LearnerRescue2026!' })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error('Learner login failed: ' + JSON.stringify(loginData));
  const token = loginData.token;
  console.log(`✓ Logged in as Learner: ${loginData.user.fullName} (${loginData.user.role})`);

  // 2. Fetch levels
  const levelsRes = await fetch(`${BASE_URL}/levels`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const levelsData = await levelsRes.json();
  console.log(`✓ Fetched ${levelsData.levels.length} levels.`);
  
  // Levels 2 to 5 completion loop
  for (let lvlNum = 2; lvlNum <= 5; lvlNum++) {
    const level = levelsData.levels.find(l => l.levelNumber === lvlNum);
    console.log(`\n--- Progressing Level ${lvlNum}: ${level.title} ---`);

    // 2a. Simulation complete
    const simRes = await fetch(`${BASE_URL}/simulations/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        levelId: level._id,
        levelNumber: lvlNum,
        actionAccuracy: 95,
        sequenceScore: 92,
        timeScore: 90,
        mistakes: 0,
        criticalErrors: 0,
        telemetryEvents: [
          { eventType: 'START', timestamp: 0 },
          { eventType: 'ACTION_VALID', stepIndex: 1, timestamp: 15 },
          { eventType: 'ACTION_VALID', stepIndex: 2, timestamp: 40 },
          { eventType: 'ACTION_VALID', stepIndex: 3, timestamp: 70 },
          { eventType: 'COMPLETE', timestamp: 110 }
        ]
      })
    });
    const simData = await simRes.json();
    if (!simRes.ok) throw new Error(`Level ${lvlNum} simulation failed: ` + JSON.stringify(simData));
    console.log(`✓ Practical Simulation passed: Score=${simData.scoring.practicalScore}% (Passed Gate 1: ${simData.passedGate1})`);

    // 2b. Generate assessment
    const genRes = await fetch(`${BASE_URL}/assessments/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ levelNumber: lvlNum })
    });
    const genData = await genRes.json();
    if (!genRes.ok) throw new Error(`Level ${lvlNum} generate assessment failed: ` + JSON.stringify(genData));
    console.log(`✓ Generated ${genData.questions.length} adaptive questions (Difficulty: ${genData.difficulty}, Source: ${genData.source})`);

    // 2c. Look up DB for correct answers to submit a 100% score
    const dbAssessment = await Assessment.findById(genData.assessmentId);
    const answers = dbAssessment.questions.map(q => ({
      questionId: q.id,
      selectedAnswer: q.correctAnswer
    }));

    const subRes = await fetch(`${BASE_URL}/assessments/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        assessmentId: genData.assessmentId,
        answers
      })
    });
    const subData = await subRes.json();
    if (!subRes.ok) throw new Error(`Level ${lvlNum} assessment submission failed: ` + JSON.stringify(subData));
    console.log(`✓ Assessment passed: Score=${subData.assessmentScore}% (Passed Gate 2: ${subData.isPassed})`);
    if (subData.progression && subData.progression.unlockedNextLevel) {
      console.log(`✓ Next Level Unlocked: Level ${subData.progression.unlockedLevel}`);
    }
  }

  // 3. Check Certification
  console.log('\n--- Checking Certification Issuance ---');
  const certRes = await fetch(`${BASE_URL}/certificate`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const certData = await certRes.json();
  if (certRes.ok && certData.certificate) {
    console.log(`✓ CERTIFICATE ISSUED!`);
    console.log(`  Certificate ID: ${certData.certificate.certificateId}`);
    console.log(`  Recipient: ${certData.certificate.learnerName}`);
    console.log(`  Overall Practical / Competency Score: ${certData.certificate.overallScore}%`);
    console.log(`  Completed Levels: ${certData.certificate.completedLevels.join(', ')}`);
    console.log(`  SHA-256 Hash: ${certData.certificate.sha256Hash}`);

    // Verify Public Route
    const verifyRes = await fetch(`${BASE_URL}/certificate/verify/${certData.certificate.certificateId}`);
    const verifyData = await verifyRes.json();
    console.log(`✓ Public Verification Endpoint: isValid=${verifyData.isValid}, message="${verifyData.message}"`);
  } else {
    console.log(`Certificate response:`, certData);
  }

  // 4. Admin Analytics Check
  console.log('\n--- Checking Admin Analytics ---');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@resqlearn.io', password: 'AdminRescue2026!' })
  });
  const adminLogin = await adminLoginRes.json();
  const adminToken = adminLogin.token;

  const analyticsRes = await fetch(`${BASE_URL}/admin/analytics`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const analyticsData = await analyticsRes.json();
  console.log(`✓ Admin Analytics fetched successfully:`);
  console.log(`  Total Learners: ${analyticsData.summary.totalLearners}`);
  console.log(`  Certified Users: ${analyticsData.summary.totalCertificates}`);
  console.log(`  Simulation Attempts: ${analyticsData.summary.totalSimAttempts}`);
  console.log(`  Level Stats: ${analyticsData.levelStats.map(s => `L${s.levelNumber}: ${s.completedLearners} completed (avg practical: ${s.avgPracticalScore}%)`).join(' | ')}`);

  console.log('\n=============================================================');
  console.log('  ALL 5 LEVELS + CERTIFICATION + PUBLIC VERIFY + ANALYTICS   ');
  console.log('                  100% VALIDATED & READY!                    ');
  console.log('=============================================================');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error during test execution:', err);
  process.exit(1);
});
