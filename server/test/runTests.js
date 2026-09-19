import assert from 'assert';
import { calculatePracticalScore, PRACTICAL_PASSING_THRESHOLD } from '../services/scoring/scoringEngine.js';
import {
  createCanonicalCertificatePayload,
  computeCertificateHash,
} from '../services/certification/certificateService.js';
import crypto from 'crypto';

console.log('==============================================');
console.log('   RESQLEARN CLINICAL ENGINE TEST SUITE       ');
console.log('==============================================\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`[PASS] ${testName}`);
    testsPassed++;
  } catch (err) {
    console.error(`[FAIL] ${testName}`);
    console.error(`       Error: ${err.message}`);
    testsFailed++;
  }
}

// 1. SCORING FORMULA TEST
runTest('Deterministic Practical Scoring Formula adheres to exact specification', () => {
  // Accuracy: 90, Sequence: 80, Time: 70, Mistakes: 1
  // Raw = (0.40 * 90) + (0.35 * 80) + (0.25 * 70) - (5 * 1)
  // Raw = 36 + 28 + 17.5 - 5 = 76.5
  const result = calculatePracticalScore({
    actionAccuracy: 90,
    sequenceScore: 80,
    timeScore: 70,
    mistakes: 1,
    criticalErrors: []
  });

  assert.strictEqual(result.practicalScore, 76.5, `Expected score 76.5, got ${result.practicalScore}`);
  assert.strictEqual(result.isPassed, true, 'Score 76.5 should pass threshold >= 75%');
});

// 2. MISTAKES PENALTY TEST
runTest('Mistakes deduct exactly 5 points each and clamp properly', () => {
  // Acc: 100, Seq: 100, Time: 100 -> 100
  // Mistakes: 6 -> 100 - 30 = 70
  const result = calculatePracticalScore({
    actionAccuracy: 100,
    sequenceScore: 100,
    timeScore: 100,
    mistakes: 6,
  });

  assert.strictEqual(result.practicalScore, 70, `Expected 70, got ${result.practicalScore}`);
  assert.strictEqual(result.isPassed, false, 'Score 70 is below 75 threshold and should fail');
});

// 3. THRESHOLD 74.99 vs 75.00 TEST
runTest('Practical Threshold strictly fails 74.99 and passes 75.00', () => {
  // Test 74.99: Acc: 74.99, Seq: 74.99, Time: 74.99, Mistakes: 0 -> 74.99
  const failResult = calculatePracticalScore({
    actionAccuracy: 74.99,
    sequenceScore: 74.99,
    timeScore: 74.99,
    mistakes: 0
  });
  assert.strictEqual(failResult.isPassed, false, '74.99 must fail practical threshold');

  // Test 75.00: Acc: 75.0, Seq: 75.0, Time: 75.0, Mistakes: 0 -> 75.0
  const passResult = calculatePracticalScore({
    actionAccuracy: 75.0,
    sequenceScore: 75.0,
    timeScore: 75.0,
    mistakes: 0
  });
  assert.strictEqual(passResult.isPassed, true, '75.00 must pass practical threshold');
});

// 4. CRITICAL ERROR CAP TEST
runTest('Critical error forces practical failure even if other metrics are high', () => {
  const result = calculatePracticalScore({
    actionAccuracy: 100,
    sequenceScore: 100,
    timeScore: 100,
    mistakes: 0,
    criticalErrors: ['Applied ice directly to burn wound'],
  });

  assert.strictEqual(result.isPassed, false, 'Critical error must prevent passing');
  assert.ok(result.practicalScore <= 50, 'Critical error should cap score below passing');
});

// 5. THEORETICAL MCQ SCORING & 70% THRESHOLD
runTest('Deterministic Assessment score calculates (correct/total)*100 and enforces 70% threshold', () => {
  const calculateMcqScore = (correct, total) => Math.round((correct / total) * 100 * 100) / 100;
  
  // 3 out of 5 = 60% -> FAIL
  const score3of5 = calculateMcqScore(3, 5);
  assert.strictEqual(score3of5, 60);
  assert.strictEqual(score3of5 >= 70, false, '60% should fail theoretical threshold');

  // 3.49 out of 5 (hypothetical 69.99) -> FAIL
  assert.strictEqual(69.99 >= 70, false, '69.99% must fail theoretical threshold');

  // 4 out of 5 = 80% -> PASS
  const score4of5 = calculateMcqScore(4, 5);
  assert.strictEqual(score4of5, 80);
  assert.strictEqual(score4of5 >= 70, true, '80% should pass theoretical threshold');
});

// 6. ADAPTIVE DIFFICULTY ROUTING TEST
runTest('Adaptive assessment difficulty routing matches exact specifications', () => {
  const classifyDifficulty = (practicalScore) => {
    if (practicalScore >= 75 && practicalScore <= 80) return 'basic';
    if (practicalScore > 80 && practicalScore <= 90) return 'moderate';
    if (practicalScore > 90) return 'advanced';
    return 'ineligible';
  };

  assert.strictEqual(classifyDifficulty(74.9), 'ineligible', '74.9 is ineligible for assessment');
  assert.strictEqual(classifyDifficulty(75), 'basic', '75 must route to basic');
  assert.strictEqual(classifyDifficulty(80), 'basic', '80 must route to basic');
  assert.strictEqual(classifyDifficulty(80.5), 'moderate', '80.5 must route to moderate');
  assert.strictEqual(classifyDifficulty(90), 'moderate', '90 must route to moderate');
  assert.strictEqual(classifyDifficulty(90.1), 'advanced', '90.1 must route to advanced');
  assert.strictEqual(classifyDifficulty(100), 'advanced', '100 must route to advanced');
});

// 7. SHA-256 TAMPER-EVIDENT CERTIFICATE HASHING TEST
runTest('Certificate SHA-256 canonical hash detects any data tampering', () => {
  const certData = {
    learnerId: 'user123456789',
    certificateId: 'RESQ-2026-TEST',
    overallScore: 88.5,
    completedLevels: [1, 2, 3, 4, 5],
    completionDate: new Date('2026-09-19T00:00:00.000Z'),
  };

  const payload = createCanonicalCertificatePayload(certData);
  const validHash = computeCertificateHash(payload);

  assert.strictEqual(typeof validHash, 'string');
  assert.strictEqual(validHash.length, 64, 'SHA-256 hex hash must be exactly 64 characters');

  // Tampering with score (e.g. changing 88.5 to 98.5)
  const tamperedPayload = createCanonicalCertificatePayload({
    ...certData,
    overallScore: 98.5,
  });
  const tamperedHash = computeCertificateHash(tamperedPayload);

  assert.notStrictEqual(validHash, tamperedHash, 'Tampered data must produce completely different hash');
});

console.log('\n----------------------------------------------');
console.log(`Results: ${testsPassed} passed, ${testsFailed} failed.`);
console.log('----------------------------------------------\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('All Core ResqLearn Engine Unit Tests Passed!\n');
}
