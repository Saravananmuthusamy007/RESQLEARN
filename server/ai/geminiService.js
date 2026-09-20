import { GoogleGenerativeAI } from '@google/generative-ai';

const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (key && key.trim() !== '' && key !== 'NEW_GEMINI_KEY') {
    return new GoogleGenerativeAI(key.trim());
  }
  return null;
};

/**
 * 1. Learner System Prompt Builder
 */
export function buildLearnerSystemPrompt({ levelContext = {}, learnerPerformance = {} }) {
  const currentLevelNum = levelContext.levelNumber || 1;
  const currentLevelTitle = levelContext.title || 'Basic Life Support';
  const currentLevelDesc = levelContext.description || '';
  const procedureSteps = levelContext.learningContent?.procedureSteps || [];
  const objectives = levelContext.learningContent?.learningObjectives || [];

  return `You are the ResqLearn AI Emergency Training Partner — an encouraging, beginner-friendly first-aid and Basic Life Support (BLS) educational assistant.

ROLE & STYLE:
• Use clear, simple English suitable for beginner cadets and first-aid learners.
• For procedural questions, format responses with numbered sequential steps:
  1. Step one
  2. Step two
  3. Step three
• When explaining mistakes or simulation performance, clearly state:
  - What happened
  - Why it matters
  - What the learner should do instead
• Maintain multi-turn conversational awareness and address follow-up questions accurately.

RESQLEARN FIVE EMERGENCY LEVELS CURRICULUM:
• Level 1: CPR / AED (100–120 BPM rate, 5–6 cm depth, 100% full recoil, 30:2 ratio, pad placement)
• Level 2: Severe Hemorrhage Control (Direct pressure 40–60 N, wound packing, CAT tourniquet 5–7 cm above wound, windlass tightening, time recording)
• Level 3: Thermal Burn Stabilization (Remove heat, cool water at 15–20°C for 10–20 min, remove constrictions, sterile cover; NEVER apply ice, butter, or pop blisters)
• Level 4: Choking / Airway Obstruction (Cough encouragement for mild, 5 back blows & 5 abdominal thrusts for severe, modified CPR if unresponsive)
• Level 5: Musculoskeletal Fracture Splinting (Immobilize in position found, two-joint rule, pad rigid splint, pre/post-splint PMS check: Pulse, Motor, Sensory)

CURRENT LEARNER CONTEXT:
• Active Level: Level ${currentLevelNum} — ${currentLevelTitle}
• Description: ${currentLevelDesc}
• Learning Objectives: ${objectives.join('; ') || 'Standard BLS competencies'}
• Relevant Procedure Steps:
${procedureSteps.map((s, i) => `  ${i + 1}. ${s.stepTitle || s.action}: ${s.description || ''}`).join('\n') || '  Follow standardized AHA/ERC BLS guidelines.'}

LEARNER PERFORMANCE HISTORY:
• Latest Practical Score: ${learnerPerformance.practicalScore !== undefined ? learnerPerformance.practicalScore + '%' : 'Not attempted yet'}
• Latest Assessment Score: ${learnerPerformance.assessmentScore !== undefined ? learnerPerformance.assessmentScore + '%' : 'Not attempted yet'}
• Recent Simulation Mistakes: ${learnerPerformance.mistakes || 0}
• Weak Areas Identified: ${learnerPerformance.weakAreas?.length ? learnerPerformance.weakAreas.join(', ') : 'None detected'}
• Strengths: ${learnerPerformance.strengths?.length ? learnerPerformance.strengths.join(', ') : 'Standard BLS proficiency'}

SAFETY & COMPLIANCE GUARDRAILS:
1. ResqLearn is an educational interactive simulation platform.
2. If the user describes an active real-world emergency, clearly advise contacting local emergency services (911/112/EMS dispatch) immediately.
3. Do not invent unauthorized or dangerous medical interventions. Never contradict recognized BLS/CPR standards.`;
}

/**
 * 2. Admin System Prompt Builder
 */
export function buildAdminSystemPrompt(analyticsData = {}) {
  return `You are the ResqLearn Executive Medical Simulation Analytics Assistant.
You assist medical directors, instructors, and training administrators by analyzing actual current platform metrics, telemetry, and curriculum performance.

GROUND TRUTH RULE (CRITICAL):
• All answers MUST be grounded in the live MongoDB platform analytics provided below.
• NEVER guess, invent, or hallucinate numbers, learner counts, completion rates, or average scores.
• If data for a specific metric is not present or 0, accurately state that zero records exist.

LIVE MONGODB ANALYTICS GROUND TRUTH:
${JSON.stringify(analyticsData, null, 2)}

RESPONSE FORMAT & TONE:
• Analytical, concise, professional, and clear.
• Use bullet points, bold key figures, and percentage summaries for readability.
• Provide insightful clinical interpretation of why certain scores, weak areas, or mistake patterns occur in emergency simulations.`;
}

/**
 * 3. Intelligent Local Fallback Engines (Active when GEMINI_API_KEY is not configured or rate-limited)
 */
export function synthesizeLearnerClinicalResponse(message = '', levelContext = {}, learnerPerformance = {}) {
  const query = message.toLowerCase().trim();
  const currentLevelNum = levelContext.levelNumber || 1;
  const currentLevelTitle = levelContext.title || 'Basic Life Support';

  // Greetings
  if (/^(hi|hii|hello|hey|greetings|how are you|good morning|yo)\b/i.test(query) || query === 'hi' || query === 'hii') {
    return {
      success: true,
      reply: `Hello! I am your **ResqLearn AI Emergency Training Partner**.\n\nI am currently focused on **Level ${currentLevelNum}: ${currentLevelTitle}**.\n\nYou can ask me natural questions such as:\n1. "What should I do first in CPR?"\n2. "What is the correct compression depth and why?"\n3. "Why should I never apply ice to a burn?"\n4. "What mistakes did I make in my simulation?"\n5. "Explain this procedure step by step."\n\nWhat clinical concept or technique would you like to review?`,
      source: 'curriculum-clinical-tutor',
    };
  }

  // CPR / AED / Level 1
  if (/cpr|compression|depth|rate|recoil|aed|pad|breath/i.test(query) || (currentLevelNum === 1 && /first|step|procedure|depth/i.test(query))) {
    return {
      success: true,
      reply: `Here is the standardized clinical protocol for adult CPR & AED operations:\n\n1. **Verify Scene Safety & Responsiveness:** Tap collarbone firmly and shout "Are you okay?". Call 911/EMS and request an AED.\n2. **Hand Placement:** Interlock fingers, place heel of hand in center of chest on lower half of breastbone (sternum).\n3. **Compression Depth:** Compress 5 to 6 cm (2 to 2.4 inches) into the chest. Depth is critical to generate adequate cardiac output.\n4. **Compression Rate:** 100 to 120 compressions per minute (to the beat of "Stayin' Alive").\n5. **Complete Chest Recoil:** Allow the chest to fully return to resting position after every stroke so coronary arteries can refill.\n6. **AED Integration:** Power on AED immediately upon arrival, apply pads (upper right chest & lower left ribs), clear the patient during analysis and shock delivery.\n\n*Safety Notice: For active real-world cardiac arrest, call local emergency services immediately.*`,
      source: 'curriculum-clinical-tutor',
    };
  }

  // Bleeding / Hemorrhage / Tourniquet / Level 2
  if (/bleed|hemorrhage|tourniquet|windlass|pressure|wound/i.test(query) || (currentLevelNum === 2 && /first|step|procedure/i.test(query))) {
    return {
      success: true,
      reply: `Standard protocol for Severe Hemorrhage Control:\n\n1. **Direct Manual Pressure:** Apply firm, continuous direct pressure (40–60 N) directly over the bleeding vessel using sterile gauze.\n2. **Wound Packing:** For junctional or deep wounds, tightly pack hemostatic or sterile gauze directly into the wound cavity.\n3. **Tourniquet Application:** If life-threatening arterial limb bleeding persists, place a CAT tourniquet 5 to 7 cm (2–3 inches) proximal to the injury (never over a joint).\n4. **Windlass Tightening:** Turn the windlass rod until bright red bleeding stops and the distal pulse disappears.\n5. **Lock & Time:** Secure the windlass in the clip and write the exact application time on the time strap.\n6. **Never Loosen:** Never loosen or remove a tourniquet in the field once placed; only surgical personnel should release it.`,
      source: 'curriculum-clinical-tutor',
    };
  }

  // Burns / Level 3
  if (/burn|thermal|water|cool|ice|butter|blister/i.test(query) || (currentLevelNum === 3 && /first|step|procedure/i.test(query))) {
    return {
      success: true,
      reply: `Standard protocol for Thermal Burn Stabilization:\n\n1. **Stop the Burning Process:** Remove the victim from the heat source and remove smoldering apparel.\n2. **Cool with Tap Water:** Immediately irrigate the burn with clean, cool running water (15–20°C / 59–68°F) for 10 to 20 minutes.\n3. **Remove Constricting Items:** Promptly remove rings, watches, and tight clothing before tissue swelling (edema) sets in.\n4. **Dress Loosely:** Cover with a sterile, non-adherent dressing or clean plastic wrap.\n\n**CRITICAL CONTRAINDICATIONS:**\n• **NEVER apply ice or ice water** — extreme cold causes vasoconstriction and worsens tissue necrosis (frostbite on top of burn).\n• **NEVER apply butter, grease, or ointments** — these trap heat and cause infection.\n• **NEVER break or pop blisters** — intact blisters provide a sterile natural barrier against infection.`,
      source: 'curriculum-clinical-tutor',
    };
  }

  // Choking / Level 4
  if (/chok|heimlich|thrust|back blow|airway|obstruction/i.test(query) || (currentLevelNum === 4 && /first|step|procedure/i.test(query))) {
    return {
      success: true,
      reply: `Standard protocol for Choking Relief (Airway Obstruction):\n\n1. **Assess Severity:** If victim can cough forcefully or speak, encourage them to keep coughing.\n2. **Severe Choking (Cannot Speak / Silent Cough):** Stand behind the victim, lean them forward, and deliver **5 firm back blows** between the shoulder blades with the heel of your hand.\n3. **Abdominal Thrusts (Heimlich):** If obstruction remains, place a fist just above the navel (well below the xiphoid process), grasp with other hand, and deliver **5 quick inward-and-upward thrusts**.\n4. **Repeat Cycle:** Alternate 5 back blows and 5 abdominal thrusts until object is expelled.\n5. **If Unconscious:** Lower patient safely to floor, call 911, and begin modified CPR compressions (look in mouth before giving rescue breaths; no blind finger sweeps).`,
      source: 'curriculum-clinical-tutor',
    };
  }

  // Fracture / Splinting / Level 5
  if (/fracture|splint|bone|joint|pms|pulse/i.test(query) || (currentLevelNum === 5 && /first|step|procedure/i.test(query))) {
    return {
      success: true,
      reply: `Standard protocol for Musculoskeletal Fracture Splinting:\n\n1. **Pre-Splint PMS Check:** Assess Pulse (radial/dorsalis pedis), Motor function (wiggle fingers/toes), and Sensory (can you feel which toe/finger I touch?).\n2. **Immobilize as Found:** Never attempt to force-align or realign an angulated fracture.\n3. **The Two-Joint Rule:** A proper splint must immobilize the joint immediately ABOVE and the joint immediately BELOW the fracture site.\n4. **Pad Rigid Splints:** Add soft padding to contours and voids for stability and comfort.\n5. **Secure Firmly (Not Constrictive):** Bandage snugly without cutting off blood flow.\n6. **Post-Splint PMS Check:** Re-assess Pulse, Motor, and Sensory immediately after splinting to ensure no vascular compromise occurred.`,
      source: 'curriculum-clinical-tutor',
    };
  }

  // Learner's Mistakes / Performance Remediation
  if (/mistake|my score|my performance|wrong|improve/i.test(query)) {
    const score = learnerPerformance.practicalScore || 0;
    const mistakes = learnerPerformance.mistakes || 0;
    const weakAreas = learnerPerformance.weakAreas || [];

    return {
      success: true,
      reply: `Here is your clinical performance remediation review:\n\n• **Latest Practical Score:** ${score}%\n• **Recorded Mistakes:** ${mistakes}\n• **Identified Weak Areas:** ${weakAreas.length ? weakAreas.join(', ') : 'None detected in recent simulation'}\n\n**Remediation Advice:**\n1. **What Happened:** Telemetry indicated ${mistakes > 0 ? `${mistakes} deviation(s) from standard protocol` : 'no major procedural deviations'}.\n2. **Why It Matters:** In emergency care, timing, sequence, and accuracy dictate patient perfusion and survival.\n3. **What You Should Do Instead:** Review the procedure steps in the guide and perform a re-simulation with focused attention on rhythm and sequence adherence.`,
      source: 'curriculum-clinical-tutor',
    };
  }

  // Step-by-step generic / Level overview
  const steps = levelContext.learningContent?.procedureSteps || [];
  if (steps.length > 0) {
    const formattedSteps = steps.map((s, i) => `${i + 1}. **${s.stepTitle || s.action}:** ${s.description || ''}`).join('\n');
    return {
      success: true,
      reply: `Here is the step-by-step clinical procedure for **${currentLevelTitle}**:\n\n${formattedSteps}\n\nAlways follow recognized emergency medicine standards and remember scene safety first!`,
      source: 'curriculum-clinical-tutor',
    };
  }

  return {
    success: true,
    reply: `In emergency response for **${currentLevelTitle}**, prioritize early recognition, caller dispatch to 911, and strict adherence to BLS clinical protocols.\n\nFeel free to ask for step-by-step procedures, explanations of why certain actions are contraindicated, or remediation of your simulation technique.`,
    source: 'curriculum-clinical-tutor',
  };
}

export function synthesizeAdminLiveResponse(message = '', analyticsData = {}) {
  const query = message.toLowerCase().trim();
  const users = analyticsData.users || {};
  const completion = analyticsData.levelCompletion || {};
  const practical = analyticsData.practicalSimulationMetrics || {};
  const mcq = analyticsData.mcqAssessmentMetrics || {};
  const mistakes = analyticsData.frequentMistakes || [];
  const weakAreas = analyticsData.frequentWeakAreas || [];
  const certs = analyticsData.certifications || {};

  // Check greetings (hi, hii, hello, etc.)
  if (/^(hi|hii|hello|hey|greetings|how are you|good morning|good afternoon|good evening|yo)\b/i.test(query) || query === 'hi' || query === 'hii') {
    return {
      success: true,
      reply: `Hello! I am your **ResqLearn Executive Simulation AI Assistant**.\n\nI am connected live to your MongoDB database tracking **${users.totalLearners || 0} registered learners**, **${users.totalAdmins || 0} administrators**, and **${certs.totalCertificatesIssued || 0} issued certificates**.\n\nYou can ask me natural questions such as:\n• "How many learners are registered?"\n• "Which level has the lowest completion rate?"\n• "What are the common simulation mistakes?"\n• "Summarize overall learner performance."\n\nHow can I assist your curriculum review today?`,
      source: 'live-db-analytics',
    };
  }

  // Learner counts
  if (/learner|user|student|register|enrolled|count|how many/i.test(query) && !/mistake|fail|certif/i.test(query)) {
    return {
      success: true,
      reply: `Based on current live platform data from MongoDB:\n\n• **Total Registered Learners:** ${users.totalLearners || 0}\n• **Active Simulation Learners:** ${users.activeLearners || 0}\n• **Completed All 5 Levels:** ${users.completedAllLevelsLearners || 0}\n• **Platform Administrators:** ${users.totalAdmins || 0}\n\nCohort engagement is currently active across all 5 emergency modules.`,
      source: 'live-db-analytics',
    };
  }

  // Level completion / rates
  if (/level|completion|complete|pass rate|lowest|highest/i.test(query) && !/mistake/i.test(query)) {
    const levelStats = completion.levelStats || [];
    const breakdown = levelStats.map((lvl) => `• **Level ${lvl.levelNumber} (${lvl.title}):** ${lvl.completedCount} completed (${lvl.completionRatePercent}% completion rate)`).join('\n');
    return {
      success: true,
      reply: `Here is the current live completion status across the 5 ResqLearn modules:\n\n${breakdown || 'No completion records recorded yet.'}\n\n• **Lowest Completion Level:** Level ${completion.lowestCompletionLevel?.levelNumber || 1} (${completion.lowestCompletionLevel?.completionRatePercent || 0}%)\n• **Highest Completion Level:** Level ${completion.highestCompletionLevel?.levelNumber || 1} (${completion.highestCompletionLevel?.completionRatePercent || 0}%)`,
      source: 'live-db-analytics',
    };
  }

  // Common mistakes / errors
  if (/mistake|error|fail|weak/i.test(query)) {
    const mistakeText = mistakes.map((m) => `• **Level ${m.levelNumber}:** ${m.totalMistakes} recorded errors across ${m.attemptsWithMistakes} attempts (avg ${m.avgMistakes} per attempt)`).join('\n');
    const weakText = weakAreas.map((w) => `• **${w.weakArea}:** flagged in ${w.frequencyCount} attempts`).join('\n');
    return {
      success: true,
      reply: `Based on live simulation telemetry:\n\n**Common Procedural Mistakes by Level:**\n${mistakeText || '• No simulation mistakes detected in database.'}\n\n**Most Frequent Clinical Weak Areas:**\n${weakText || '• No persistent weak areas flagged.'}`,
      source: 'live-db-analytics',
    };
  }

  // Practical scores / Telemetry
  if (/score|practical|assessment|telemetry|accuracy|average/i.test(query)) {
    return {
      success: true,
      reply: `Here are the platform-wide simulation and assessment score analytics:\n\n• **Overall Average Practical Score:** ${practical.overallAverageScore || 0}%\n• **Practical Pass Rate:** ${practical.passRatePercent || 0}% (pass threshold: ≥75%)\n• **Average Procedural Accuracy:** ${practical.overallAverageAccuracy || 0}%\n• **Average Sequence Adherence:** ${practical.overallAverageSequence || 0}%\n• **MCQ Assessment Average:** ${mcq.overallAverageAssessmentScore || 0}% (${mcq.passCount || 0} passed, ${mcq.failCount || 0} failed)`,
      source: 'live-db-analytics',
    };
  }

  // Certificates
  if (/certificate|certif/i.test(query)) {
    return {
      success: true,
      reply: `Live Certification Metrics:\n\n• **Total Certificates Issued:** ${certs.totalCertificatesIssued || 0}\n• **Platform Certification Rate:** ${certs.certificationRatePercent || 0}% of all registered learners.\n\nCertificates are issued with cryptographic SHA-256 verification upon completing all 5 BLS levels with passing scores.`,
      source: 'live-db-analytics',
    };
  }

  // Default summary response
  return {
    success: true,
    reply: `Here is the current executive platform summary from live MongoDB data:\n\n• **Learners:** ${users.totalLearners || 0} registered (${users.activeLearners || 0} active)\n• **Certificates Issued:** ${certs.totalCertificatesIssued || 0}\n• **Practical Telemetry Average:** ${practical.overallAverageScore || 0}%\n• **Assessment Average:** ${mcq.overallAverageAssessmentScore || 0}%\n• **Active Curriculum Modules:** 5 Levels (CPR/AED, Hemorrhage, Burns, Choking, Splinting)\n\nFeel free to ask for specific level breakdowns, mistake analysis, or learner performance trends.`,
    source: 'live-db-analytics',
  };
}

/**
 * 4. Chat with Learner AI (Real Gemini API with Curriculum Fallback)
 */
export async function chatWithLearnerAI({
  message,
  conversationHistory = [],
  levelContext = {},
  learnerPerformance = {},
}) {
  const genAI = getGeminiClient();

  // If Gemini API Key is not configured, seamlessly provide clinical tutor response
  if (!genAI) {
    return synthesizeLearnerClinicalResponse(message, levelContext, learnerPerformance);
  }

  try {
    const systemPrompt = buildLearnerSystemPrompt({ levelContext, learnerPerformance });

    const formattedHistory = [];
    const recentHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-8) : [];

    for (const turn of recentHistory) {
      const role = (turn.sender === 'user' || turn.role === 'user') ? 'user' : 'model';
      const text = turn.text || turn.content || turn.message || '';
      if (text.trim()) {
        formattedHistory.push({
          role,
          parts: [{ text: text.slice(0, 1000) }],
        });
      }
    }

    const candidateModels = [
      process.env.GEMINI_MODEL,
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
    ].filter(Boolean);

    let lastError = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(message.slice(0, 2000));
        const responseText = result.response.text();

        return {
          success: true,
          reply: responseText,
          source: modelName,
        };
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini AI]: Attempt with ${modelName} failed (${err.message}). Trying fallback...`);
      }
    }

    throw lastError || new Error('All candidate Gemini models failed.');
  } catch (err) {
    console.warn(`[Gemini AI Error]: Learner AI call failed (${err.message}). Using intelligent clinical fallback.`);
    return synthesizeLearnerClinicalResponse(message, levelContext, learnerPerformance);
  }
}

/**
 * 5. Chat with Admin AI (Real Gemini API with Live MongoDB Grounding Fallback)
 */
export async function chatWithAdminAI({
  message,
  conversationHistory = [],
  analyticsData = {},
}) {
  const genAI = getGeminiClient();

  // If Gemini API Key is not configured, seamlessly provide live database analytics response
  if (!genAI) {
    return synthesizeAdminLiveResponse(message, analyticsData);
  }

  try {
    const systemPrompt = buildAdminSystemPrompt(analyticsData);

    const formattedHistory = [];
    const recentHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-8) : [];

    for (const turn of recentHistory) {
      const role = (turn.sender === 'user' || turn.role === 'user') ? 'user' : 'model';
      const text = turn.text || turn.content || turn.message || '';
      if (text.trim()) {
        formattedHistory.push({
          role,
          parts: [{ text: text.slice(0, 1000) }],
        });
      }
    }

    const candidateModels = [
      process.env.GEMINI_MODEL,
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
    ].filter(Boolean);

    let lastError = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(message.slice(0, 2000));
        const responseText = result.response.text();

        return {
          success: true,
          reply: responseText,
          source: modelName,
        };
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini AI]: Admin attempt with ${modelName} failed (${err.message}). Trying fallback...`);
      }
    }

    throw lastError || new Error('All candidate Gemini models failed.');
  } catch (err) {
    console.warn(`[Gemini AI Error]: Admin AI call failed (${err.message}). Using live MongoDB analytics fallback.`);
    return synthesizeAdminLiveResponse(message, analyticsData);
  }
}

/**
 * 5. Adaptive MCQ Assessment Generation
 */
export async function generateAdaptiveAssessmentWithGemini({
  levelNumber,
  levelTitle,
  practicalScore,
  difficulty,
  weakAreas = [],
  strengths = [],
  mistakes = 0,
}) {
  const genAI = getGeminiClient();
  if (!genAI) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const prompt = `You are an expert Basic Life Support (BLS) and First-Aid Medical Simulation Evaluator.
Generate a structured 5-question adaptive Multiple Choice Question (MCQ) assessment for an emergency training platform.

Level ${levelNumber}: ${levelTitle}
Learner Practical Score: ${practicalScore}%
Assigned Difficulty: ${difficulty.toUpperCase()}
Learner Mistakes: ${mistakes}
Identified Weak Areas: ${weakAreas.length > 0 ? weakAreas.join('; ') : 'None'}
Identified Strengths: ${strengths.length > 0 ? strengths.join('; ') : 'Standard BLS proficiency'}

REQUIREMENTS:
1. Generate exactly 5 clinically accurate questions suited for "${difficulty}" difficulty.
2. If difficulty is "basic", ensure mandatory fundamental BLS safety principles are tested.
3. If weak areas are noted, target at least 2 questions directly to remediate those weak areas.
4. Each question MUST have exactly 4 distinct options.
5. "correctAnswer" MUST be an integer index (0, 1, 2, or 3) indicating the correct choice.
6. Provide a concise, educational explanation citing standard first-aid/BLS protocols.
7. Return strictly valid JSON adhering to this exact format:

{
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "q1",
      "question": "Clear question text here?",
      "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
      "correctAnswer": 0,
      "explanation": "Clinical rationale explaining why this option is correct.",
      "skill": "Specific BLS Skill Name"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());

    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn(`[Gemini AI Notice]: Adaptive generation call error (${err.message}). Using fallback question bank.`);
    return null;
  }
}

export default {
  buildLearnerSystemPrompt,
  buildAdminSystemPrompt,
  chatWithLearnerAI,
  chatWithAdminAI,
  generateAdaptiveAssessmentWithGemini,
};
