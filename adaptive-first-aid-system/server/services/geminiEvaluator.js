/**
 * geminiEvaluator.js - AI Clinical Simulation Skill Evaluator using @google/genai
 * Evaluates learner clinical telemetry across First-Aid Levels 1 to 5.
 * Provides dynamic scoring, clinical critique, threshold verification,
 * targeted remediation, and adaptive MCQ difficulty recommendations.
 */

const { GoogleGenAI } = require('@google/genai');

const LEVEL_CLINICAL_STANDARDS = {
  1: {
    title: 'CPR & Response Check',
    protocol: 'AHA/ERC Cardiopulmonary Resuscitation',
    keyMilestones: [
      'Scene safety verification',
      'Shoulder tap responsiveness check',
      'Breathing check (5-10s)',
      'Immediate Emergency Call & AED retrieval',
      'Hand placement on lower sternum',
      '30 chest compressions at 5-6 cm depth and 100-120 BPM rhythm'
    ],
    contraindications: ['Compressing without checking responsiveness', 'Hesitating > 15s to call 911/AED', 'Improper hand placement off sternum']
  },
  2: {
    title: 'Wound Care & Bleeding Control',
    protocol: 'Severe Hemorrhage & Bleeding Protocol',
    keyMilestones: [
      'Universal precautions / PPE (nitrile gloves) donned prior to patient contact',
      'Sterile gauze placed directly on laceration site',
      'Firm continuous direct pressure maintained for adequate duration (full timer)',
      'Snug compression bandage applied securing dressing without cutting off distal arterial blood flow'
    ],
    contraindications: ['Touching open wound without gloves', 'Peeking/releasing pressure prematurely', 'Applying loose ineffective wrap']
  },
  3: {
    title: 'Burns Management',
    protocol: 'Thermal Burn Response & Cryotherapy Guidelines',
    keyMilestones: [
      'Safe removal from thermal/heat hazard',
      'Active cooling under gentle running cool tap water for 10-20 minutes',
      'Strict avoidance of contraindicated home remedies (ice, butter, toothpaste, grease)',
      'Loose non-adherent sterile dressing applied without unroofing or bursting blisters'
    ],
    contraindications: ['Applying ice directly causing secondary tissue necrosis', 'Applying butter/ointment trapping heat', 'Popping blisters risking infection']
  },
  4: {
    title: 'Choking Response (FBAO)',
    protocol: 'Foreign Body Airway Obstruction & Heimlich Maneuver',
    keyMilestones: [
      'Identification of severe airway obstruction and coughing assessment',
      'Delivery of 5 sharp interscapular back blows with heel of hand',
      'Accurate landmark positioning: thumb side of fist positioned just above navel and below xiphoid process',
      '5 distinct inward and upward subdiaphragmatic abdominal thrusts (45° angle) with adequate force'
    ],
    contraindications: ['Performing blind finger sweeps in mouth', 'Thrusting directly on lower ribs or xiphoid process', 'Downward or horizontal-only thrust vector']
  },
  5: {
    title: 'Fracture & Sprain Support',
    protocol: 'Musculoskeletal Trauma & Rigid Splint Immobilization',
    keyMilestones: [
      'Manual support and stabilization of limb in position of comfort',
      'Rigid padded splint positioned spanning both the joint above and joint below injury site',
      'Proximal and distal joint ties secured firmly without constricting circulation',
      'Pre- and post-splinting CSM (Circulation, Sensation, Motor function / radial pulse & capillary refill <2s) verification'
    ],
    contraindications: ['Attempting to forcefully realign angulated fracture bones', 'Securing bindings directly over the fracture focus', 'Failing to re-assess distal neurovascular pulse']
  }
};

/**
 * Evaluates learner practical simulation telemetry
 * @param {Object} params
 * @param {number|string} params.levelId - Level order (1 to 5) or MongoDB ID
 * @param {Array} params.actions - Chronological telemetry action logs
 * @param {Object} params.metrics - Summary metrics { totalResponseTime, attempts, sequenceErrors, incorrectTargets }
 * @param {Object} params.level - Level model document (optional)
 * @returns {Promise<Object>} Evaluated score, critique, weakAreas, remediation, and adaptive recommendation
 */
async function evaluatePracticalSimulation({ levelId, actions = [], metrics = {}, level = {} }) {
  const levelOrder = Number(level.order || levelId) || 1;
  const standard = LEVEL_CLINICAL_STANDARDS[levelOrder] || LEVEL_CLINICAL_STANDARDS[1];
  const PASS_THRESHOLD = 75;
  const practicalThreshold = Number(level.practicalThreshold) || PASS_THRESHOLD;

  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

  if (apiKey && apiKey !== '' && apiKey !== 'your_gemini_api_key_here') {
    try {
      console.log(`[GeminiEvaluator] Evaluating practical simulation with Gemini 2.5 Flash for Level ${levelOrder}...`);
      const aiResult = await callGeminiEvaluator({
        apiKey,
        levelOrder,
        standard,
        actions,
        metrics,
        practicalThreshold
      });
      if (aiResult) {
        console.log(`[GeminiEvaluator] Telemetry successfully graded by Gemini: compositeScore=${aiResult.compositeScore}%`);
        return aiResult;
      }
    } catch (err) {
      console.error('[GeminiEvaluator] Gemini API call error, falling back to clinical rule engine:', err.message, err.stack);
    }
  } else {
    console.log(`[GeminiEvaluator] GEMINI_API_KEY not configured. Running clinical rule engine for Level ${levelOrder}.`);
  }

  // Fallback to internal clinical rule engine
  return fallbackClinicalEvaluator({
    levelOrder,
    standard,
    actions,
    metrics,
    practicalThreshold
  });
}

/**
 * Direct call to Google Gemini API using @google/genai SDK
 */
async function callGeminiEvaluator({ apiKey, levelOrder, standard, actions, metrics, practicalThreshold }) {
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are a Senior Board-Certified Emergency Medicine Simulation Director and Clinical Skills Examiner.
You evaluate medical and first-aid learners based on objective clinical telemetry captured during simulated emergency scenarios.
Analyze the student's actions, anatomical target points, procedural sequence, response timing, and contraindications.
Produce an objective clinical evaluation returning strictly valid JSON.`;

  const prompt = `
CLINICAL ASSESSMENT CASE:
Level ${levelOrder}: ${standard.title}
Protocol Standard: ${standard.protocol}
Required Pass Threshold: ${practicalThreshold}%

Expected Key Milestones:
${standard.keyMilestones.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Critical Contraindications to Flag:
${standard.contraindications.map(c => `- ${c}`).join('\n')}

STUDENT TELEMETRY LOG:
Summary Metrics:
- Total Elapsed Time: ${metrics.totalResponseTime || 0} seconds
- Attempts Made: ${metrics.attempts || 1}
- Sequence Order Errors: ${metrics.sequenceErrors || 0}
- Inaccurate Targets / Mistakes: ${metrics.incorrectTargets || 0}

Chronological Student Actions:
${JSON.stringify(actions, null, 2)}

INSTRUCTIONS:
Grade the student from 0 to 100 based on:
1. Action Precision (30%) - Did they execute each required clinical step?
2. Target Accuracy (25%) - Did they place hands/equipment on the exact anatomical landmarks?
3. Sequence Accuracy (20%) - Did they follow correct priority order (e.g. safety before compression, gloves before blood)?
4. Time Efficiency (15%) - Emergency responsiveness (<30s ideal, >60s hesitant)?
5. Attempt Efficiency (10%) - Passing on first attempt?

Determine if passed (compositeScore >= ${practicalThreshold}).
Provide:
- compositeScore (0-100 integer)
- actionAccuracyScore (0-100 integer)
- targetAccuracyScore (0-100 integer)
- sequenceScore (0-100 integer)
- timeScore (0-100 integer)
- passed (boolean)
- clinicalCritique (2-3 sentences of constructive clinical feedback)
- weakAreas (array of strings highlighting specific weak points)
- remediation (1-2 clear clinical instructions on how to correct mistakes)
- recommendedMCQDifficulty ("foundational" if compositeScore < 85, "advanced" if >= 85)
- difficultyMix ({ easy: number, medium: number, hard: number } summing to 1.0)
- recommendedFocusTags (array of 2-4 tags e.g. ["technique", "sequence", "target-area", "timing", "safety"])

Return ONLY a JSON object matching this exact schema:
{
  "compositeScore": number,
  "actionAccuracyScore": number,
  "targetAccuracyScore": number,
  "sequenceScore": number,
  "timeScore": number,
  "passed": boolean,
  "clinicalCritique": string,
  "weakAreas": string[],
  "remediation": string,
  "recommendedMCQDifficulty": "foundational" | "advanced",
  "difficultyMix": { "easy": number, "medium": number, "hard": number },
  "recommendedFocusTags": string[]
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json'
    }
  });

  let rawText = response.text ? response.text : (response.candidates?.[0]?.content?.parts?.[0]?.text || '');
  if (!rawText) {
    throw new Error('Empty response from Gemini model');
  }

  // Strip markdown formatting if present
  rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

  // Extract JSON object between outermost braces
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    rawText = rawText.substring(firstBrace, lastBrace + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (parseErr) {
    console.error('[GeminiEvaluator] Failed to parse JSON from Gemini. Raw output:', rawText);
    throw new Error(`Gemini evaluation response parsing failed: ${parseErr.message}`);
  }

  const compositeScore = Math.max(0, Math.min(100, Math.round(parsed.compositeScore || 75)));
  const PASS_THRESHOLD = practicalThreshold || 75;
  const isPassed = compositeScore >= PASS_THRESHOLD;

  return {
    compositeScore,
    actionAccuracyScore: Math.max(0, Math.min(100, Math.round(parsed.actionAccuracyScore || 80))),
    targetAccuracyScore: Math.max(0, Math.min(100, Math.round(parsed.targetAccuracyScore || 80))),
    sequenceScore: Math.max(0, Math.min(100, Math.round(parsed.sequenceScore || 80))),
    timeScore: Math.max(0, Math.min(100, Math.round(parsed.timeScore || 80))),
    passed: isPassed,
    practicalThreshold: PASS_THRESHOLD,
    clinicalCritique: parsed.clinicalCritique || 'Clinical evaluation completed.',
    weakAreas: Array.isArray(parsed.weakAreas) ? parsed.weakAreas : [],
    remediation: parsed.remediation || 'Review procedural guidelines before continuing.',
    recommendedMCQDifficulty: parsed.recommendedMCQDifficulty || (parsed.compositeScore >= 85 ? 'advanced' : 'foundational'),
    difficultyMix: parsed.difficultyMix || (parsed.compositeScore >= 85 ? { easy: 0.15, medium: 0.35, hard: 0.50 } : { easy: 0.60, medium: 0.30, hard: 0.10 }),
    recommendedFocusTags: Array.isArray(parsed.recommendedFocusTags) ? parsed.recommendedFocusTags : ['technique', 'safety'],
    aiEvaluated: true
  };
}

/**
 * Resilient deterministic clinical evaluator implementing exact first-aid rubrics
 */
function fallbackClinicalEvaluator({ levelOrder, standard, actions, metrics, practicalThreshold }) {
  const totalActions = actions.length || 1;
  const correctActions = actions.filter(a => a.correct !== false).length;
  const actionAccuracyScore = Math.round((correctActions / totalActions) * 100);

  // Target accuracy from individual action targetAccuracy scores
  const targetAccuracies = actions
    .filter(a => typeof a.targetAccuracy === 'number')
    .map(a => a.targetAccuracy);
  const targetAccuracyScore = targetAccuracies.length > 0
    ? Math.round(targetAccuracies.reduce((a, b) => a + b, 0) / targetAccuracies.length)
    : Math.max(40, 100 - (Number(metrics.incorrectTargets || 0) * 15));

  // Sequence accuracy based on sequenceErrors metric
  const seqErrors = Number(metrics.sequenceErrors || 0);
  const sequenceScore = Math.max(20, Math.round(100 - (seqErrors * 20)));

  // Time score based on response time in seconds
  const respTimeSec = Number(metrics.totalResponseTime || 0);
  let timeScore = 100;
  if (respTimeSec > 30) {
    timeScore = Math.max(20, Math.round(100 - (respTimeSec - 30) * (80 / 90)));
  }

  // Attempt penalty
  const attempts = Number(metrics.attempts || 1);
  const attemptScore = Math.max(20, 100 - (attempts - 1) * 20);

  // Weighted score: action (30%), target (25%), sequence (20%), time (15%), attempt (10%)
  const compositeScore = Math.round(
    (actionAccuracyScore * 0.30) +
    (targetAccuracyScore * 0.25) +
    (sequenceScore * 0.20) +
    (timeScore * 0.15) +
    (attemptScore * 0.10)
  );

  const PASS_THRESHOLD = practicalThreshold || 75;
  const isPassed = compositeScore >= PASS_THRESHOLD;
  const passed = isPassed;

  // Derive weak areas and specific level critique
  const weakAreas = [];
  const critiqueParts = [];
  let remediation = '';

  if (targetAccuracyScore < 70) weakAreas.push('Anatomical landmark targeting');
  if (sequenceScore < 75) weakAreas.push('Clinical procedural sequence');
  if (actionAccuracyScore < 75) weakAreas.push('Procedure technique accuracy');
  if (timeScore < 65) weakAreas.push('Emergency reaction time');

  // Level-specific telemetry scrutiny
  if (levelOrder === 1) {
    const compressionsAction = actions.find(a => a.step === 'chest_compressions' || a.action === 'CHEST_COMPRESSIONS');
    if (compressionsAction?.bpm && (compressionsAction.bpm < 100 || compressionsAction.bpm > 120)) {
      weakAreas.push('CPR compression rhythm pacing (Target: 100-120 BPM)');
    }
    if (passed) {
      critiqueParts.push('Effective CPR delivery: High-quality sternal compressions and timely emergency dispatch.');
    } else {
      critiqueParts.push('CPR protocol deficit: Compressions must be delivered to lower sternum at 5-6 cm depth following responsiveness check.');
      remediation = 'Verify patient unresponsiveness and call 911/AED before initiating 30 firm chest compressions.';
    }
  } else if (levelOrder === 2) {
    const hasPpe = actions.some(a => (a.step === 'don_ppe' || a.action === 'WEAR_PPE') && a.correct);
    if (!hasPpe) weakAreas.push('BSI / PPE infection control protocol');
    if (passed) {
      critiqueParts.push('Proficient hemorrhage control: Sterile dressing applied with uninterrupted continuous pressure.');
    } else {
      critiqueParts.push('Bleeding management incomplete: PPE must be donned prior to direct firm pressure on open lacerations.');
      remediation = 'Don nitrile gloves first, apply sterile gauze directly over wound, and maintain firm pressure for full duration.';
    }
  } else if (levelOrder === 3) {
    const contraAttempt = actions.find(a => a.flag === 'contraindicated_home_remedy' || a.step === 'contraindicated_remedy');
    if (contraAttempt) weakAreas.push('Contraindicated burn treatment (avoid ice/butter)');
    if (passed) {
      critiqueParts.push('Optimal thermal burn mitigation: Rapid heat source removal and cool running water irrigation adhered to.');
    } else {
      critiqueParts.push('Burn management non-compliant: Must cool running water for minimum 10-20 min; never apply ice or greasy home remedies.');
      remediation = 'Cool affected tissue under gentle running tap water for at least 10-20 minutes and dress loosely with sterile non-stick dressing.';
    }
  } else if (levelOrder === 4) {
    const thrustAction = actions.find(a => a.step === 'abdominal_thrusts' || a.action === 'PERFORM_ABDOMINAL_THRUSTS');
    if (thrustAction && thrustAction.vectorAccuracy && thrustAction.vectorAccuracy < 80) {
      weakAreas.push('Heimlich upward/inward vector angle');
    }
    if (passed) {
      critiqueParts.push('Airway obstruction successfully relieved: Rapid transition from back blows to inward-upward Heimlich thrusts.');
    } else {
      critiqueParts.push('Incomplete airway clearance: Alternate 5 sharp back slaps between shoulder blades with 5 inward & upward thrusts above navel.');
      remediation = 'Place fist thumb-side just above the navel and deliver quick inward and upward thrusts until airway clears.';
    }
  } else if (levelOrder === 5) {
    const pulseAction = actions.find(a => a.step === 'check_circulation' || a.action === 'CHECK_CIRCULATION');
    if (!pulseAction || !pulseAction.correct) weakAreas.push('Post-splinting CSM / neurovascular assessment');
    if (passed) {
      critiqueParts.push('Excellent musculoskeletal stabilization: Joint above and below immobilized with verified distal circulation.');
    } else {
      critiqueParts.push('Splinting technique error: Rigid splint must immobilize both joints surrounding fracture with distal pulse re-assessment.');
      remediation = 'Stabilize limb in position found, secure splint board across proximal and distal joints, and verify radial pulse.';
    }
  }

  if (critiqueParts.length === 0) {
    critiqueParts.push(passed ? 'Solid emergency execution across clinical milestones.' : 'Performance below required threshold. Needs remediation.');
  }

  if (!remediation) {
    remediation = passed
      ? 'Review edge-case complications and proceed to the adaptive MCQ assessment.'
      : 'Review the level instructional guidelines and re-attempt the simulation to attain threshold.';
  }

  const isHighMastery = compositeScore >= 85 && attempts === 1;
  const recommendedMCQDifficulty = isHighMastery ? 'advanced' : 'foundational';
  const difficultyMix = isHighMastery
    ? { easy: 0.15, medium: 0.35, hard: 0.50 }
    : { easy: 0.60, medium: 0.30, hard: 0.10 };

  const focusTags = ['technique'];
  if (sequenceScore < 80) focusTags.push('sequence');
  if (targetAccuracyScore < 80) focusTags.push('target-area');
  if (timeScore < 70) focusTags.push('timing');
  if (weakAreas.length > 0) focusTags.push('safety');

  return {
    compositeScore,
    actionAccuracyScore,
    targetAccuracyScore,
    sequenceScore,
    timeScore,
    passed,
    practicalThreshold,
    clinicalCritique: critiqueParts.join(' '),
    weakAreas: [...new Set(weakAreas)],
    remediation,
    recommendedMCQDifficulty,
    difficultyMix,
    recommendedFocusTags: [...new Set(focusTags)],
    aiEvaluated: false
  };
}

module.exports = {
  evaluatePracticalSimulation,
  LEVEL_CLINICAL_STANDARDS
};
