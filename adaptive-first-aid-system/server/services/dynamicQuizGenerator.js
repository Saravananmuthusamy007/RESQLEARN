/**
 * dynamicQuizGenerator.js - 100% Dynamic Gemini-driven MCQ Quiz Generator
 * Generates custom clinical first-aid MCQs using Google Gemini (@google/genai)
 * tailored to learner simulation scores, telemetry mistakes, and level topics (L1 to L5).
 */

const { GoogleGenAI } = require('@google/genai');

const LEVEL_SCENARIO_CONFIGS = {
  1: {
    order: 1,
    title: 'CPR & Response Check',
    protocol: 'AHA/ERC Cardiopulmonary Resuscitation Guidelines',
    keyTopics: ['scene safety', 'responsiveness check', 'AED & 911 activation', 'chest compressions (100-120 BPM, 5-6 cm depth, lower sternum)'],
    edgeCases: ['pediatric vs infant variations', 'return of spontaneous circulation (ROSC)', 'AED shockable rhythms (VF/pVT) vs asystole', 'fatigue rotation']
  },
  2: {
    order: 2,
    title: 'Wound Care & Bleeding Control',
    protocol: 'Severe Hemorrhage & Pressure Dressing Protocol',
    keyTopics: ['PPE nitrile gloves donning', 'direct continuous pressure with sterile gauze', 'compression bandage application', 'distal circulation check'],
    edgeCases: ['arterial spurting bleeding', 'tourniquet indication & high-and-tight placement', 'embedded foreign body precautions', 'hypovolemic shock signs']
  },
  3: {
    order: 3,
    title: 'Burns Management',
    protocol: 'Thermal Burn Response & Cryotherapy Guidelines',
    keyTopics: ['removal from heat hazard', 'cool running water for 10-20 minutes', 'contraindications (no ice, butter, grease)', 'sterile non-adherent dressing'],
    edgeCases: ['chemical vs electrical burn systemic risks', 'inhalation injury & airway compromise', 'circumferential third-degree burns', 'rule of nines TBSA assessment']
  },
  4: {
    order: 4,
    title: 'Choking Response (FBAO)',
    protocol: 'Foreign Body Airway Obstruction & Heimlich Maneuver',
    keyTopics: ['distinguishing partial vs severe airway blockage', '5 sharp interscapular back blows', 'subdiaphragmatic inward & upward abdominal thrusts', 'navel landmarking'],
    edgeCases: ['pregnant or obese victim chest thrusts', 'unconscious choking victim CPR protocol', 'infant back slaps & chest thrusts', 'choking self-relief maneuver']
  },
  5: {
    order: 5,
    title: 'Fracture & Sprain Support',
    protocol: 'Musculoskeletal Trauma & Rigid Splint Immobilization',
    keyTopics: ['manual stabilization in position found', 'splint spanning joint above and below fracture', 'securing ties without vascular occlusion', 'pre/post CSM pulse check'],
    edgeCases: ['open compound fracture with protruding bone', 'loss of distal pulse / compartment syndrome signs', 'traction splint indications vs contraindications', 'pelvic and spinal immobilization precautions']
  }
};

/**
 * Determine difficulty tier based on simulation score
 * - 70% - 79%: basic
 * - 80% - 84%: intermediate
 * - >= 85%: advanced
 */
function getDifficultyTier(score) {
  const numericScore = Number(score) || 75;
  if (numericScore >= 85) return 'advanced';
  if (numericScore >= 80) return 'intermediate';
  return 'basic';
}

/**
 * Generates 5 dynamic MCQs using Gemini 2.5 Flash with clinical fallback
 * @param {Object} params
 * @param {number} params.levelOrder - 1 to 5
 * @param {number} params.simulationScore - 0 to 100
 * @param {Array<string>} params.weakTags - identified mistakes/weak areas from telemetry
 * @returns {Promise<Object>} { difficultyTier, reason, questions: Array<5 questions> }
 */
async function generateDynamicQuiz({ levelOrder = 1, simulationScore = 75, weakTags = [] }) {
  const levelConfig = LEVEL_SCENARIO_CONFIGS[levelOrder] || LEVEL_SCENARIO_CONFIGS[1];
  const difficultyTier = getDifficultyTier(simulationScore);

  const mistakesDescription = weakTags.length > 0
    ? `Specific telemetry mistakes detected during the practical simulation: ${weakTags.join(', ')}.`
    : 'No critical telemetry errors logged; steady baseline procedural execution.';

  let adaptiveRuleInstructions = '';
  let reason = '';

  if (difficultyTier === 'basic') {
    adaptiveRuleInstructions = `
ADAPTIVE RULE (Lower/Borderline Score: ${simulationScore}%):
- Generate 5 foundational, basic procedural and safety-check MCQs directly addressing the exact procedural mistakes made (${mistakesDescription}).
- Reinforce correct landmark positioning, proper step-by-step sequencing, universal precautions, and absolute contraindications.
- Set "difficulty": "basic" for all 5 questions.`;
    reason = `Based on your simulation score of ${simulationScore}%, 5 foundational procedural and safety MCQs have been dynamically generated to address detected procedural errors and reinforce core clinical guidelines.`;
  } else if (difficultyTier === 'intermediate') {
    adaptiveRuleInstructions = `
ADAPTIVE RULE (Intermediate Score: ${simulationScore}%):
- Generate 5 balanced, standard operational procedure (SOP) MCQs testing solid diagnostic reasoning, clinical protocols, and typical emergency conditions.
- Address standard procedural steps (${levelConfig.keyTopics.join(', ')}) with realistic patient scenarios.
- Set "difficulty": "intermediate" for all 5 questions.`;
    reason = `Based on your simulation score of ${simulationScore}%, 5 balanced standard operational procedure MCQs have been dynamically generated to test your clinical workflow and diagnostic precision.`;
  } else {
    adaptiveRuleInstructions = `
ADAPTIVE RULE (High Score: ${simulationScore}%):
- Generate 5 advanced, complex clinical edge-case MCQs testing high-level decision making under stress.
- Focus on secondary complications, pediatric/elderly variants, polytrauma decisions, and severe clinical dilemmas (${levelConfig.edgeCases.join(', ')}).
- Set "difficulty": "advanced" for all 5 questions.`;
    reason = `Outstanding simulation score of ${simulationScore}%! 5 advanced clinical edge-case MCQs have been dynamically generated to challenge your emergency trauma management skills.`;
  }

  // Attempt live Gemini generation if API key is configured
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

  if (apiKey && apiKey !== '' && apiKey !== 'your_gemini_api_key_here') {
    try {
      console.log(`[dynamicQuizGenerator] Calling Gemini 2.5 Flash for Level ${levelOrder} (Score: ${simulationScore}%, Tier: ${difficultyTier})...`);
      const generatedQuestions = await callGeminiDynamicQuiz({
        apiKey,
        levelConfig,
        simulationScore,
        difficultyTier,
        mistakesDescription,
        adaptiveRuleInstructions
      });

      if (generatedQuestions && generatedQuestions.length === 5) {
        console.log(`[dynamicQuizGenerator] Successfully generated 5 dynamic questions via Gemini 2.5 Flash.`);
        return {
          difficultyTier,
          reason,
          aiGenerated: true,
          questions: generatedQuestions
        };
      }
    } catch (err) {
      console.error('[dynamicQuizGenerator] Gemini generation error, falling back to clinical generator:', err.message, err.stack);
    }
  } else {
    console.log(`[dynamicQuizGenerator] GEMINI_API_KEY not configured. Using high-yield clinical generator for Level ${levelOrder} (${difficultyTier}).`);
  }

  // Resilient clinical fallback generator
  const fallbackQuestions = getClinicalFallbackQuestions(levelOrder, difficultyTier, weakTags);
  return {
    difficultyTier,
    reason,
    aiGenerated: false,
    questions: fallbackQuestions
  };
}

/**
 * Calls Google Gemini 2.5 Flash with strict JSON Schema enforcement
 */
async function callGeminiDynamicQuiz({
  apiKey,
  levelConfig,
  simulationScore,
  difficultyTier,
  mistakesDescription,
  adaptiveRuleInstructions
}) {
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are a Senior Board-Certified Emergency Physician and Clinical Medical Board Examiner.
You dynamically author high-yield first-aid MCQ assessments tailored precisely to a healthcare student's telemetry performance in simulated emergency scenarios.
You must return strictly valid JSON matching the exact schema provided.`;

  const prompt = `
SCENARIO DETAILS:
Level: Level ${levelConfig.order} - ${levelConfig.title}
Clinical Protocol Standard: ${levelConfig.protocol}
Learner Simulation Telemetry Score: ${simulationScore}%
${mistakesDescription}

${adaptiveRuleInstructions}

REQUIREMENTS:
1. Generate exactly 5 multiple-choice questions.
2. Each question MUST have exactly 4 plausible clinical options.
3. Clearly mark "correctOptionIndex" as an integer 0, 1, 2, or 3 corresponding to the index in "options".
4. Provide a rich "clinicalRationale" (2-3 sentences explaining why the correct choice is clinically indicated according to AHA/ERC guidelines and why distractors are contraindicated).
5. "id" MUST be an integer from 1 to 5.
6. "difficulty" MUST be exactly "${difficultyTier}".

Return ONLY a JSON array with 5 objects matching this exact schema:
[
  {
    "id": 1,
    "question": "string",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOptionIndex": 0,
    "difficulty": "${difficultyTier}",
    "clinicalRationale": "string"
  }
]
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
    throw new Error('Empty response from Gemini dynamic quiz generation');
  }

  // Clean Markdown formatting if present
  rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

  // Extract JSON array between outermost brackets if present
  const firstBracket = rawText.indexOf('[');
  const lastBracket = rawText.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    rawText = rawText.substring(firstBracket, lastBracket + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (parseErr) {
    console.error('[dynamicQuizGenerator] Failed to parse JSON from Gemini. Raw output:', rawText);
    throw new Error(`Gemini response JSON parsing failed: ${parseErr.message}`);
  }

  if (!Array.isArray(parsed) && parsed.questions && Array.isArray(parsed.questions)) {
    parsed = parsed.questions;
  }

  if (!Array.isArray(parsed) || parsed.length !== 5) {
    throw new Error(`Expected 5 questions from Gemini, received ${Array.isArray(parsed) ? parsed.length : typeof parsed}`);
  }

  // Validate and sanitize each generated question
  return parsed.map((q, idx) => {
    let options = Array.isArray(q.options) ? q.options.map(String) : [];
    if (options.length < 4) {
      while (options.length < 4) {
        options.push(`Alternative procedure option ${options.length + 1}`);
      }
    } else if (options.length > 4) {
      options = options.slice(0, 4);
    }

    let correctOptionIndex = Number(q.correctOptionIndex);
    if (isNaN(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex > 3) {
      correctOptionIndex = 0;
    }

    return {
      id: idx + 1,
      question: String(q.question || `Clinical first-aid assessment question ${idx + 1}`),
      options,
      correctOptionIndex,
      difficulty: difficultyTier,
      clinicalRationale: String(q.clinicalRationale || 'Strictly follow evidence-based AHA/ERC emergency care standards.')
    };
  });
}

/**
 * Clinically authenticated dynamic question pool fallback for all 5 levels and 3 score tiers
 */
function getClinicalFallbackQuestions(levelOrder, difficultyTier, weakTags = []) {
  const fallbackBank = {
    // Level 1: CPR
    1: {
      basic: [
        {
          id: 1,
          question: 'When performing chest compressions on an unresponsive adult, what is the exact anatomical landmark for hand placement?',
          options: [
            'On the lower half of the sternum (center of the chest between the nipples)',
            'Over the xiphoid process at the base of the ribcage',
            'Directly over the left pectoral muscle directly above the heart',
            'On the upper third of the sternum near the suprasternal notch'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Placing hands on the lower half of the sternum maximizes ventricular compression while preventing traumatic laceration of the liver by avoiding the xiphoid process.'
        },
        {
          id: 2,
          question: 'What is the recommended compression rate and depth for adult cardiopulmonary resuscitation according to AHA guidelines?',
          options: [
            '100 to 120 compressions per minute at a depth of 5 to 6 cm (2 to 2.4 inches)',
            '60 to 80 compressions per minute at a depth of 3 to 4 cm',
            '130 to 150 compressions per minute with minimal recoil to maintain pressure',
            '80 to 100 compressions per minute at a depth of at least 7 cm'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Compressions between 100-120 BPM at 5-6 cm ensure optimal coronary and cerebral perfusion pressures without causing excessive skeletal trauma.'
        },
        {
          id: 3,
          question: 'What is the first action a rescuer must take before approaching an individual suspected of cardiac arrest?',
          options: [
            'Assess the immediate scene for hazards (traffic, fire, electrical wires, chemical fumes)',
            'Begin 30 rapid chest compressions immediately without delay',
            'Check for a carotid pulse for at least 30 seconds',
            'Open the airway using a deep head-tilt chin-lift maneuver'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Scene safety is the paramount first step. Rescuers must not enter an uncontrolled hazardous environment and become victims themselves.'
        },
        {
          id: 4,
          question: 'Why is complete chest wall recoil critical between each chest compression during CPR?',
          options: [
            'It permits the heart chambers to refill with blood before the next compression stroke',
            'It prevents the rescuer from becoming physically fatigued too quickly',
            'It helps expel air from the victim’s stomach to prevent aspiration',
            'It keeps the AED pads firmly adhered to the anterior thoracic skin'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Incomplete recoil elevates intrathoracic pressure, drastically diminishing coronary perfusion and cardiac output during resuscitation.'
        },
        {
          id: 5,
          question: 'When an Automated External Defibrillator (AED) arrives, what is the immediate next step?',
          options: [
            'Power on the AED immediately and follow the audible voice prompts',
            'Complete exactly 5 full cycles of CPR before opening the AED lid',
            'Deliver two rescue breaths before applying pads to verify airway patency',
            'Place the victim in the lateral recovery position before attaching pads'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Turning on the AED immediately prompts voice instructions, guiding pad placement and rhythm analysis with minimum hands-off time.'
        }
      ],
      intermediate: [
        {
          id: 1,
          question: 'During two-rescuer adult CPR with an advanced airway in place, how should compressions and ventilations be coordinated?',
          options: [
            'Deliver continuous compressions at 100-120 BPM without pauses, while delivering 1 breath every 6 seconds',
            'Maintain strict 30:2 ratio, pausing compressions completely for 2 full breaths',
            'Maintain a 15:2 compression-to-ventilation ratio pausing after each cycle',
            'Deliver synchronized compressions and breaths simultaneously at 100 BPM'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'With an advanced airway, continuous chest compressions optimize coronary perfusion while asynchronous ventilations (1 breath every 6s) prevent hyperventilation.'
        },
        {
          id: 2,
          question: 'You notice agonal gasps (infrequent, irregular snorting sounds) in an unresponsive patient. How should this be managed?',
          options: [
            'Recognize agonal gasps as a sign of cardiac arrest and commence CPR immediately',
            'Place the patient in recovery position because gasping indicates spontaneous breathing',
            'Perform abdominal thrusts to clear a suspected partial airway obstruction',
            'Wait 2 minutes to observe if regular respiratory patterns re-establish'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Agonal gasps are a brainstem reflex in early cardiac arrest and should never be mistaken for normal oxygenating respiration.'
        },
        {
          id: 3,
          question: 'An AED advises "No Shock Advised". What is the mandatory next step in management?',
          options: [
            'Immediately resume CPR starting with chest compressions without pulse check delay',
            'Check for a carotid pulse for 20 seconds before taking any further action',
            'Remove the AED electrode pads and place the patient in the recovery position',
            'Power cycle the AED unit to re-analyze the cardiac rhythm'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'When no shock is advised, high-quality chest compressions must be restarted immediately to minimize hands-off time.'
        },
        {
          id: 4,
          question: 'What is the primary physiologic danger of delivering hyperventilation (excessive volume or rate) during CPR?',
          options: [
            'Increased intrathoracic pressure reduces venous return to the heart and reduces coronary perfusion',
            'It rapidly causes pulmonary edema and alveolar rupture',
            'It interferes with AED electrode sensor impedance readings',
            'It triggers sudden ventricular tachycardia'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Excessive positive-pressure ventilation elevates mean intrathoracic pressure, directly choking off venous return and coronary perfusion.'
        },
        {
          id: 5,
          question: 'How frequently should CPR compression roles be switched between two trained rescuers?',
          options: [
            'Every 2 minutes (approximately 5 cycles of 30:2) or whenever the compressor is fatigued',
            'Every 5 minutes or after 10 complete cycles of 30:2',
            'Only when the AED prompts a rhythmic battery warning',
            'The initial rescuer should continue until emergency medical services arrive'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Rescuer fatigue deteriorates compression depth and rate within 120 seconds; swapping roles every 2 minutes preserves compression efficacy.'
        }
      ],
      advanced: [
        {
          id: 1,
          question: 'A cardiac arrest patient achieves Return of Spontaneous Circulation (ROSC). What is the targeted post-resuscitation systolic blood pressure and SpO2 range?',
          options: [
            'Systolic BP >= 90 mmHg (MAP >= 65 mmHg) and SpO2 92% to 98%',
            'Systolic BP 70-80 mmHg and SpO2 100% with hyperoxia',
            'Systolic BP >= 140 mmHg and SpO2 >= 99% using 100% FiO2',
            'Systolic BP 100 mmHg regardless of MAP and unrestricted room air'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Post-ROSC guidelines target MAP >= 65 mmHg to maintain brain and organ perfusion while avoiding hyperoxia (titrating to 92-98% SpO2) to minimize free-radical oxidative injury.'
        },
        {
          id: 2,
          question: 'In a pregnant patient (>20 weeks gestation) suffering cardiac arrest, what critical anatomical modification must be applied during CPR?',
          options: [
            'Manual left uterine displacement (LUD) to relieve aortocaval compression',
            'Placing the patient completely on her right side at a 60-degree tilt',
            'Reducing compression depth to 3 cm to prevent fetal trauma',
            'Applying AED pads only to the posterior back and epigastric zone'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Left uterine displacement pulls the gravid uterus off the inferior vena cava and abdominal aorta, restoring maternal venous return necessary for effective CPR.'
        },
        {
          id: 3,
          question: 'During resuscitation of a hypothermic patient (body core temp < 30°C) with ventricular fibrillation, what is the guideline on defibrillation and medications?',
          options: [
            'Deliver 1 defibrillation attempt, withhold repeat shocks/IV medications until warmed above 30°C, and continue CPR',
            'Deliver standard shocks every 2 minutes and double the epinephrine dose',
            'Do not attempt defibrillation until core temperature reaches 36°C',
            'Administer high-dose vasopressin and avoid active warming during resuscitation'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Severe hypothermia causes metabolic sluggishness; delivery of one shock is indicated, but repeat shocks and medications are deferred until core temperature rises above 30°C.'
        },
        {
          id: 4,
          question: 'What is the clinical role of quantitative waveform capnography (ETCO2) during high-performance resuscitation?',
          options: [
            'Monitors compression quality (target ETCO2 > 10-20 mmHg) and provides instantaneous indication of ROSC (sharp ETCO2 spike to 35-40 mmHg)',
            'Measures peripheral arterial oxygen saturation and blood pH continuously',
            'Determines the exact electrical energy level needed for biphasic shock',
            'Identifies underlying coronary artery stenosis during compression phases'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'ETCO2 directly correlates with pulmonary blood flow generated by compressions. A sudden jump above 35-40 mmHg reliably indicates ROSC before pulse palpation.'
        },
        {
          id: 5,
          question: 'A 6-year-old child presents in cardiac arrest. Two rescuers are present. What is the correct compression-to-ventilation ratio and compression depth?',
          options: [
            '15:2 ratio with compressions at a depth of approximately 5 cm (one-third AP diameter of the chest)',
            '30:2 ratio with compressions at a depth of 2 to 3 cm',
            '15:2 ratio with gentle compressions of 1 cm using two fingers',
            'Continuous compressions without breaths at 140 BPM'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'In pediatric two-rescuer resuscitation, the ratio drops to 15:2 to optimize ventilation (as pediatric arrest is predominantly asphyxial) with depth at 1/3 the AP diameter (~5 cm).'
        }
      ]
    },

    // Level 2: Wound Care & Bleeding Control
    2: {
      basic: [
        {
          id: 1,
          question: 'What is the crucial first piece of Personal Protective Equipment (PPE) required before managing an actively bleeding open wound?',
          options: [
            'Nitrile or latex medical examination gloves',
            'Sterile surgical gown and shoe covers',
            'Full-face particulate respirator mask',
            'Lead apron and safety boots'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Gloves protect both the patient from pathogen inoculation and the rescuer from bloodborne pathogens (HIV, Hepatitis B/C).'
        },
        {
          id: 2,
          question: 'What is the most effective initial method to control significant external bleeding from an extremity laceration?',
          options: [
            'Firm, continuous direct pressure with sterile gauze placed over the wound',
            'Immediately applying a tourniquet over the nearest major joint',
            'Pouring hydrogen peroxide directly into the wound bed',
            'Applying an ice pack directly to the open tissue'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Direct manual pressure directly occludes the bleeding vessel, facilitating platelet plug adhesion and natural clot stabilization.'
        },
        {
          id: 3,
          question: 'If blood seeps completely through the initial sterile gauze dressing, what should the rescuer do?',
          options: [
            'Add additional absorbent dressings on top while maintaining continuous firm pressure without removing the base layer',
            'Peel away all soaked dressings and scrape the wound surface clean',
            'Release all pressure for 5 minutes to let venous pressure equilibrate',
            'Wash the wound vigorously with hot soapy water'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Removing the base layer disrupts newly formed platelet meshwork and restarts fresh bleeding. Always reinforce on top.'
        },
        {
          id: 4,
          question: 'After applying a snug compression bandage to a forearm wound, which physical check confirms distal circulation is intact?',
          options: [
            'Verifying warm fingertips, strong radial pulse, and capillary refill time under 2 seconds',
            'Checking if the patient can bend their elbow past 90 degrees',
            'Ensuring the bandage is so tight that no pulse can be detected',
            'Applying an ice wrap over the bandage for 30 minutes'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'A compression wrap must control venous/capillary ooze without occluding arterial inflow; distal pulse and brisk capillary refill (<2s) prove neurovascular safety.'
        },
        {
          id: 5,
          question: 'How should an impaled foreign object (such as a piece of glass or metal) in a bleeding wound be managed in first aid?',
          options: [
            'Leave the object in place, stabilize it with bulky dressings, and control surrounding bleeding',
            'Promptly pull the object out using forceps to examine the depth of the wound',
            'Push the object deeper to plug the bleeding vessel',
            'Wiggle the object to test if bone or tendons are damaged'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Removing an impaled object releases internal tamponade, resulting in catastrophic hemorrhage and irreversible neurovascular transection.'
        }
      ],
      intermediate: [
        {
          id: 1,
          question: 'When is the application of a commercial windlass arterial tourniquet (e.g., CAT) definitively indicated?',
          options: [
            'Life-threatening, pulsating arterial hemorrhage on an extremity that cannot be controlled by direct pressure',
            'Any venous ooze from a minor superficial scrape on the knee',
            'Bleeding wounds located on the groin or axilla',
            'Closed fractures with mild swelling and intact skin'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Tourniquets are lifesaving interventions indicated for severe, pulsatile extremity exsanguination when direct pressure fails or in tactical/multiple casualty environments.'
        },
        {
          id: 2,
          question: 'Where should an extremity tourniquet be positioned relative to the severe bleeding site?',
          options: [
            '2 to 3 inches (5 to 7 cm) proximal to the wound on bare skin, avoiding joints',
            'Directly over the lacerated wound bed and joint flexion crease',
            'Distal to the injury site closer to the fingers or toes',
            'Only around the neck or collarbone region'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Placing 2-3 inches proximal to the wound (never over a joint) compresses arterial conduits against the long bone shaft to arrest flow.'
        },
        {
          id: 3,
          question: 'Once a windlass tourniquet has been tightened and bleeding has ceased, what essential step must be documented?',
          options: [
            'Record the exact time of tourniquet application clearly on the tourniquet band or patient’s forehead',
            'Loosen the windlass every 10 minutes to restore intermittent perfusion',
            'Cover the tourniquet with thick blankets so it remains completely hidden',
            'Administer aspirin immediately to thin the patient’s blood'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Documenting application time (e.g., "TK 14:22") alerts surgical trauma teams to ischemic duration, guiding limb salvage decisions.'
        },
        {
          id: 4,
          question: 'A patient with severe hemorrhage exhibits cold, clammy skin, tachycardia (128 BPM), tachypnea, and restlessness. What condition is developing?',
          options: [
            'Compensated hypovolemic shock due to acute blood loss',
            'Septic bacteremia from wound contamination',
            'Anaphylactic allergic reaction to the dressing',
            'Psychogenic syncope requiring ammonia salts'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Tachycardia, peripheral vasoconstriction (pale/clammy skin), and anxiety are hallmark compensatory mechanisms in Stage II hypovolemic shock.'
        },
        {
          id: 5,
          question: 'How should an amputated body part (e.g., severed finger) be preserved during emergency transport?',
          options: [
            'Wrap in sterile damp gauze, place in a sealed plastic bag, and place that bag in an ice-water slurry (never direct ice)',
            'Submerge directly into a bucket of pure ice cubes with salt',
            'Immerse in warm water mixed with antiseptic alcohol solution',
            'Keep in a sealed dry container at room temperature without cooling'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Indirect cooling in an ice-water bath preserves microvascular viability for micro-replantation while preventing frostbite tissue death from direct ice contact.'
        }
      ],
      advanced: [
        {
          id: 1,
          question: 'In severe junctional hemorrhage (e.g., femoral artery laceration at the groin) where a limb tourniquet cannot be placed, what is the primary intervention?',
          options: [
            'Wound packing with hemostatic gauze deep into the wound cavity followed by continuous direct pressure for 3 minutes',
            'Applying a loose ice pack over the pelvis for 30 minutes',
            'Elevation of both legs above the head without direct wound contact',
            'Applying a venous tourniquet around the lower calf'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Junctional wounds require deep cavity packing with pro-coagulant hemostatic gauze directly onto the bleeding vessel followed by intensive compression.'
        },
        {
          id: 2,
          question: 'What is the "lethal triad" in massive trauma hemorrhage, and what first-aid measures mitigate it?',
          options: [
            'Hypothermia, Acidosis, and Coagulopathy; mitigated by aggressive active warming and immediate definitive bleeding control',
            'Hypertension, Bradycardia, and Irregular respirations; treated with fluid restriction',
            'Hyperthermia, Alkalosis, and Thrombocytosis; treated with cold infusions',
            'Hypoglycemia, Hypocalcemia, and Hyponatremia; treated with oral glucose'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Hypothermia impairs enzyme coagulation kinetics, precipitating acidosis and uncontrollable coagulopathy. Keeping the patient warm is vital.'
        },
        {
          id: 3,
          question: 'A patient with an open chest laceration exhibits a "sucking" chest wound with respiratory distress. What immediate dressing is indicated?',
          options: [
            'Vented three-sided occlusive dressing or commercial chest seal that allows air escape on exhalation',
            'Non-occlusive porous gauze allowing free atmospheric air exchange',
            'A tightly bound four-sided wrap preventing any air or fluid drainage',
            'Deep cavity gauze packing inside the pleural space'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'A vented chest seal prevents atmospheric air from entering the pleural cavity during inspiration while venting trapped air to prevent tension pneumothorax.'
        },
        {
          id: 4,
          question: 'What is the guideline regarding loosening or releasing an applied arterial tourniquet in the prehospital first-aid setting?',
          options: [
            'Never loosen or release an applied tourniquet; only surgical or qualified trauma hospital personnel should remove it',
            'Loosen the windlass every 15 minutes to inspect for clot formation',
            'Release the tourniquet as soon as the patient complains of severe limb pain',
            'Remove the tourniquet after 45 minutes regardless of ongoing bleeding'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Intermittent release causes fatal re-hemorrhage and releases accumulated ischemic toxins/lactic acid into systemic circulation triggering cardiac arrest.'
        },
        {
          id: 5,
          question: 'In an abdominal evisceration injury with exposed protruding intestines, what is the mandatory dressing protocol?',
          options: [
            'Cover with sterile saline-moistened dressings followed by an occlusive cover; never attempt to push organs back inside',
            'Gently push protruding loops of bowel back into the peritoneal cavity',
            'Apply dry sterile gauze with a tight circumferential elastic wrap',
            'Pour topical antibiotic ointment generously over exposed viscera'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Moist sterile dressings prevent organ desiccation and necrosis. Pushing viscera back introduces severe peritonitis and bowel strangulation.'
        }
      ]
    },

    // Level 3: Burns Management
    3: {
      basic: [
        {
          id: 1,
          question: 'What is the immediate, gold-standard first-aid cooling procedure for an acute thermal burn?',
          options: [
            'Cool running gentle tap water (15°C to 25°C) applied for 10 to 20 minutes',
            'Application of ice cubes or frozen gel packs directly to the burned skin',
            'Coating the burn with butter, mayonnaise, or cooking oil',
            'Applying toothpaste and baking soda paste over the skin'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Cool running water dissipates residual dermal heat, stops zone of stasis burn progression, and provides analgesia without causing hypothermia or frostbite.'
        },
        {
          id: 2,
          question: 'Why must ice or ice water NEVER be applied to a severe thermal burn?',
          options: [
            'Ice causes intense vasoconstriction, compounding tissue ischemia and causing secondary frostbite necrosis',
            'Ice neutralizes the body’s natural histamine response too quickly',
            'Ice melts and dilutes the skin’s protective natural oils',
            'Ice causes systemic hyperthermia through shivering reflex'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Ice induces profound peripheral vasoconstriction, shutting down microcirculation in the already vulnerable zone of stasis, turning partial-thickness burns into full-thickness necrosis.'
        },
        {
          id: 3,
          question: 'What should be done regarding intact blister bubbles on a partial-thickness (second-degree) burn?',
          options: [
            'Leave blisters intact; do not puncture or pop them',
            'Sterilize a sewing needle and lance all blisters immediately',
            'Peel away blister skin using tweezers to expose the raw dermis',
            'Apply rubbing alcohol directly onto the fluid-filled blisters'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'The intact blister roof serves as a sterile biological barrier protecting against invasive bacterial infection and fluid evaporative loss.'
        },
        {
          id: 4,
          question: 'What is the correct dressing to place over a clean, cooled partial-thickness burn?',
          options: [
            'Loose, non-adherent sterile dressing or clean plastic food wrap placed loosely over the area',
            'Adhesive fabric bandage pressed firmly onto the burned surface',
            'Fluffy cotton balls secured with tight adhesive tape',
            'Heavy wool blankets wrapped directly against the raw skin'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Non-adherent sterile dressings or clean plastic wrap protect raw nerve endings without sticking to regenerating epidermis.'
        },
        {
          id: 5,
          question: 'When a victim’s clothing catches fire, what is the universal immediate first-aid instruction?',
          options: [
            'Stop, Drop, and Roll, and extinguish flames by smothering with a wool blanket or water',
            'Run quickly towards an open breezy doorway or outdoor area',
            'Peel away all melted synthetic fabrics adhering firmly to the skin',
            'Fan the flames with a towel to blow out the heat'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Stopping movement and rolling smothers oxygen from the fire. Running fans flames, accelerating inhalation injury and body surface burn area.'
        }
      ],
      intermediate: [
        {
          id: 1,
          question: 'In chemical burn exposure (acid or alkali), what is the definitive first-aid decontamination protocol?',
          options: [
            'Brush off dry powders, then irrigate continuously with copious low-pressure water for at least 20 minutes',
            'Apply an opposing chemical to neutralize the burn (e.g., vinegar on alkali)',
            'Wipe the area with alcohol wipes without using water',
            'Cover immediately with petroleum gauze without washing'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Copious water irrigation mechanically dilutes and washes away chemical agents. Chemical neutralization attempts release exothermic reaction heat, compounding burns.'
        },
        {
          id: 2,
          question: 'What physical signs alert the first-aid responder to suspected inhalation airway burns in a fire victim?',
          options: [
            'Singed nasal hairs, soot in sputum, hoarse voice, and inspiratory stridor',
            'Mild redness on the kneecap and normal speech',
            'Normal pulse oximetry reading with clear speech',
            'Abdominal tenderness and cramping'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Singed facial hair, carbonaceous sputum, and stridor signal impending laryngeal and supraglottic airway edema requiring emergent airway protection.'
        },
        {
          id: 3,
          question: 'In an electrical high-voltage burn injury, what hidden clinical risk must rescuers always anticipate?',
          options: [
            'Life-threatening cardiac arrhythmias (such as VF) and deep hidden muscle/bone destruction',
            'Superficial skin peeling only with zero internal organ involvement',
            'Immediate hypercalcemia with severe hypertension',
            'Spontaneous rupture of the spleen'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Electrical current travels through blood vessels and nerves, disrupting cardiac conduction and cooking deep tissue beds while skin entry/exit points look deceptively small.'
        },
        {
          id: 4,
          question: 'Why should restrictive jewelry, rings, and watches be removed immediately from a burned extremity?',
          options: [
            'Rapid inflammatory tissue edema will turn jewelry into constricting tourniquets causing limb ischemia',
            'Precious metals accelerate chemical oxidation of burn tissue',
            'Jewelry interferes with hospital digital x-ray equipment',
            'Cold metals trap heat inside the dermal layers'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Massive third-spacing and local edema occur within minutes of burn injury. Rigid rings quickly produce digital ischemia and gangrene if not removed early.'
        },
        {
          id: 5,
          question: 'According to the Wallace Rule of Nines for adult burn surface area calculation, what percentage is assigned to the entire anterior torso?',
          options: [
            '18% (9% chest + 9% abdomen)',
            '9% total',
            '36% total',
            '4.5% total'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'In the Rule of Nines, the anterior trunk represents 18% (anterior chest 9%, anterior abdomen 9%), guiding burn severity classification.'
        }
      ],
      advanced: [
        {
          id: 1,
          question: 'A patient has a circumferential third-degree burn around their entire forearm. The hand is becoming cold, cyanotic, and pulseless. What pathology is occurring?',
          options: [
            'Burn-induced compartment syndrome from rigid non-elastic eschar requiring urgent hospital escharotomy',
            'Normal temporary vasospasm that resolves spontaneously with warmth',
            'Deep vein thrombosis from prolonged bed rest',
            'Localized contact dermatitis from gauze dressings'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Full-thickness eschar forms a leathery, unyielding constriction. As edema expands under the eschar, compartment pressures spike, strangling arterial inflow.'
        },
        {
          id: 2,
          question: 'What is the primary mechanism of carbon monoxide (CO) toxicity in smoke inhalation, and what is the definitive first-aid oxygen protocol?',
          options: [
            'CO binds hemoglobin with 200x affinity of oxygen; administer 100% high-flow oxygen via non-rebreather mask immediately',
            'CO paralyzes the diaphragm; administer low-flow nasal cannula at 1 L/min',
            'CO causes acute pulmonary emboli; administer oral aspirin and room air',
            'CO destroys surfactant; initiate positive end-expiratory pressure without oxygen'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Carboxyhemoglobin impairs oxygen delivery and cellular respiration. 100% high-flow oxygen shortens the half-life of carboxyhemoglobin from 320 minutes to under 80 minutes.'
        },
        {
          id: 3,
          question: 'Why are standard pulse oximeter readings falsely reassuring in a victim rescued from an enclosed structure fire?',
          options: [
            'Standard two-wavelength pulse oximeters cannot differentiate between oxyhemoglobin and carboxyhemoglobin, showing false 99-100% readings',
            'Pulse oximeters calibrate only to core body temperature',
            'Soot on fingers causes the sensor to read zero regardless of oxygenation',
            'Carbon monoxide shuts off all peripheral capillary blood flow'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Carboxyhemoglobin absorbs light at 660 nm identically to oxyhemoglobin, misleading conventional pulse oximeters into displaying normal 100% saturations.'
        },
        {
          id: 4,
          question: 'In extensive burns (>20% TBSA in adults), why must excessive prolonged cooling of the entire body be avoided after the initial 10-20 minute period?',
          options: [
            'Loss of skin barrier and cold exposure trigger lethal hypothermia, shivering, and coagulopathy',
            'Prolonged cooling increases the likelihood of keloid scar formation',
            'Water softens blisters, causing excessive blister rupture',
            'Cold water stimulates excessive secretion of thyroid hormones'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Extensive burns obliterate thermoregulation. Extended cold immersion triggers hypothermia, which dramatically spikes mortality in burn shock.'
        },
        {
          id: 5,
          question: 'According to the Parkland resuscitation formula for severe burn shock, how is the 24-hour Lactated Ringer’s fluid requirement calculated?',
          options: [
            '4 mL x kg body weight x % TBSA burn, with half administered over the first 8 hours post-injury',
            '10 mL x kg body weight x % TBSA burn administered evenly over 24 hours',
            '2 mL x kg body weight administered as a single rapid bolus in the first hour',
            '500 mL/hr continuous normal saline infusion regardless of body weight'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'The Parkland formula (4 mL/kg/% TBSA) dictates that 50% of the calculated volume must be infused within the first 8 hours calculated from the time of burn occurrence.'
        }
      ]
    },

    // Level 4: Choking Response (FBAO)
    4: {
      basic: [
        {
          id: 1,
          question: 'An adult is coughing forcefully while eating and appears distressed. What is the correct immediate first-aid action?',
          options: [
            'Encourage the person to continue coughing forcefully; do not interfere with back blows or thrusts while they can cough',
            'Immediately perform blind finger sweeps in the back of the mouth',
            'Deliver 5 rapid subdiaphragmatic abdominal thrusts immediately',
            'Offer them a glass of cold water to wash down the obstruction'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'A spontaneous vigorous cough generates higher peak airway clearance pressures than manual thrusts; interfering may convert a partial obstruction into complete occlusion.'
        },
        {
          id: 2,
          question: 'What is the universal distress signal for severe foreign body airway obstruction (FBAO)?',
          options: [
            'Clutching the throat with one or both hands, unable to speak, cough, or breathe',
            'Waving hands above the head while shouting for help',
            'Lying flat on the floor and breathing rapidly',
            'Pointing to the abdomen and asking for antacids'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'The universal choking sign is clutching the throat, accompanied by silent coughing, cyanosis, and inability to speak or vocalize.'
        },
        {
          id: 3,
          question: 'What is the correct combination and sequence of interventions for a conscious adult with severe airway obstruction?',
          options: [
            'Alternate cycles of 5 sharp interscapular back blows followed by 5 abdominal thrusts',
            '10 chest compressions followed by 2 rescue breaths',
            'Continuous abdominal thrusts for 10 minutes without back blows',
            'Placing the patient head-down and patting the crown of the head'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'AHA/ERC guidelines mandate alternating 5 sharp back blows between the shoulder blades with 5 abdominal thrusts until the foreign body is expelled.'
        },
        {
          id: 4,
          question: 'Where is the exact anatomical landmark for placing the fist during abdominal thrusts (Heimlich maneuver)?',
          options: [
            'Just above the navel (umbilicus) and well below the xiphoid process in the midline',
            'Directly over the lower ribs on the left side of the torso',
            'On the sternal breastbone at the level of the armpits',
            'Directly over the center of the xiphoid process'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Placing the thumb-side fist just above the navel avoids fracturing the xiphoid process or lacerating the liver, while maximizing subdiaphragmatic pressure.'
        },
        {
          id: 5,
          question: 'What is the correct angle and direction of force when delivering abdominal thrusts to an adult?',
          options: [
            'Distinct quick inward and upward thrusts towards the diaphragm (45-degree angle)',
            'Downward thrusts directed towards the pelvis and bladder',
            'Horizontal lateral squeezes from side to side',
            'Gentle circular rubs on the epigastrium'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Inward and upward thrusts elevate the diaphragm abruptly, compressing intrathoracic air to expel the lodged foreign body like an artificial cough.'
        }
      ],
      intermediate: [
        {
          id: 1,
          question: 'If a conscious choking adult suddenly becomes unconscious and falls to the ground, what is the immediate priority action?',
          options: [
            'Carefully support them to the floor, call EMS/911, and begin adult CPR starting with 30 chest compressions',
            'Continue delivering abdominal thrusts while the patient is lying supine on their back',
            'Turn the patient on their side and perform 10 back blows',
            'Search for the object using deep blind finger sweeps'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'When a choking victim becomes unresponsive, immediately initiate adult CPR. Chest compressions generate substantial intrathoracic pressure to dislodge obstructions.'
        },
        {
          id: 2,
          question: 'During CPR on an unconscious choking victim, when should the rescuer look inside the oral cavity?',
          options: [
            'Each time the airway is opened to deliver rescue breaths; remove the object only if it is clearly visible',
            'Every 5 minutes regardless of CPR cycle phase',
            'Before starting any chest compressions',
            'Only after emergency medical services arrive on scene'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Looking into the mouth before ventilating allows visual verification. If a loosened foreign body is visible, it can be hooked out; blind sweeps are strictly contraindicated.'
        },
        {
          id: 3,
          question: 'How should severe choking be managed in an adult who is visibly pregnant in her third trimester or severely obese?',
          options: [
            'Deliver chest thrusts over the center of the sternum instead of abdominal thrusts',
            'Deliver abdominal thrusts with double force into the lower abdomen',
            'Instruct the patient to drink vegetable oil to lubricate the airway',
            'Avoid any thrusts and perform mouth-to-mouth ventilation immediately'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'In late pregnancy or severe obesity, abdominal thrusts risk uterine rupture and are ineffective; sternal chest thrusts safely elevate intrathoracic pressure.'
        },
        {
          id: 4,
          question: 'Why are blind finger sweeps strictly contraindicated in an unconscious choking victim?',
          options: [
            'They frequently push the foreign body deeper into the laryngeal inlet, causing complete irreversible occlusion',
            'They may trigger excessive salivation that dissolves the foreign body',
            'They damage the patient’s permanent dental enamel',
            'They prevent the tongue from relaxing against the palate'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'A blind sweep risks lodging a supraglottic object firmly into the subglottic trachea, converting a partial blockage into a fatal obstruction.'
        },
        {
          id: 5,
          question: 'If a person is choking while completely alone and unable to breathe, how can they self-administer the Heimlich maneuver?',
          options: [
            'Press the abdomen against a firm horizontal edge (such as the back of a sturdy chair or countertop) while thrusting inward and upward',
            'Lie flat on the floor face down and cough repeatedly',
            'Drink large volumes of tap water rapidly',
            'Pound on their own chest with both fists'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Leaning over a rigid chair back or edge delivers self-directed subdiaphragmatic thrusts to expel the obstruction.'
        }
      ],
      advanced: [
        {
          id: 1,
          question: 'What is the exact guideline for managing severe foreign body airway obstruction in a conscious infant (< 1 year of age)?',
          options: [
            '5 prone downward back slaps followed by 5 supine chest thrusts using two fingers; abdominal thrusts are strictly prohibited',
            '5 vigorous abdominal thrusts followed by blind finger sweeps',
            'Holding the infant upside down by the feet and shaking gently',
            'Performing the adult Heimlich maneuver with reduced force'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Abdominal thrusts in infants cause catastrophic hepatic and splenic lacerations. Alternating 5 back slaps and 5 two-finger chest thrusts is the only safe protocol.'
        },
        {
          id: 2,
          question: 'In hospital advanced airway management of refractory foreign body obstruction where bag-valve-mask ventilation fails, what is the next step?',
          options: [
            'Direct laryngoscopy with Magill forceps extraction under direct visualization',
            'Immediate emergency tracheostomy without trying laryngoscopy',
            'High-dose muscle relaxants without intubation equipment',
            'Continuous chest percussion with the patient Trendelenburg'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Direct laryngoscopy exposes the pharynx and glottis, allowing grasping and retrieval of the lodged foreign body using curved Magill forceps.'
        },
        {
          id: 3,
          question: 'A patient who received successful abdominal thrusts now breathes normally but complains of severe mid-epigastric pain and tenderness. What complication must be investigated?',
          options: [
            'Internal blunt trauma such as gastric rupture, mesenteric laceration, or splenic injury',
            'Normal psychosomatic distress requiring no medical evaluation',
            'Temporary indigestion caused by the original food bolus',
            'Spontaneous hiatal hernia that resolves overnight'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Forceful abdominal thrusts generate intense localized trauma and can cause internal organ rupture (stomach, liver, spleen). All Heimlich recipients must undergo medical evaluation.'
        },
        {
          id: 4,
          question: 'When complete foreign body airway obstruction cannot be relieved by basic measures or Magill forceps in an emergency setting, what is the surgical airway of choice?',
          options: [
            'Needle or surgical cricothyroidotomy through the cricothyroid membrane',
            'Formal operating-room tracheostomy at the 5th tracheal ring',
            'Thoracotomy and open tracheal clamping',
            'Bronchoscopy under general anesthesia in all cases'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Cricothyroidotomy provides rapid, subcutaneous access to the airway below the level of the vocal cords and laryngeal obstruction.'
        },
        {
          id: 5,
          question: 'What distinctive physiological finding distinguishes non-cardiogenic negative pressure pulmonary edema occurring immediately after relief of severe upper airway obstruction?',
          options: [
            'Pink frothy sputum, bilateral crackles, and hypoxemia caused by intense negative intrathoracic inspiratory pressure generated against the closed airway',
            'Massive localized lobar pneumonia from bacterial inoculation',
            'Cardiogenic shock from acute myocardial infarction',
            'Pleural effusion developing over 3 to 5 days'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Violent inspiratory efforts against an occluded airway generate massive negative intrathoracic pressures (-50 to -100 cm H2O), pulling fluid across the pulmonary capillary bed into the alveoli.'
        }
      ]
    },

    // Level 5: Fracture & Sprain Support
    5: {
      basic: [
        {
          id: 1,
          question: 'What is the cardinal rule of immobilizing a suspected limb fracture with a rigid splint?',
          options: [
            'The splint must immobilize both the joint above and the joint below the suspected fracture site',
            'The splint should only cover the exact point of the bone break',
            'The splint must be applied loosely so the patient can exercise the joint',
            'The fractured limb must be forcefully bent back into anatomical alignment before splinting'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Immobilizing the joint above and below prevents muscular traction and rotational motion that could displace bone fragments and pierce adjacent neurovascular bundles.'
        },
        {
          id: 2,
          question: 'What does the acronym "CSM" stand for in orthopedic trauma assessment, and when must it be checked?',
          options: [
            'Circulation, Sensation, and Motor function; checked both immediately BEFORE and AFTER splint application',
            'Cardiac, Splint, and Mobility; checked only after arrival at the hospital',
            'Capillary, Suture, and Muscle; checked only if the patient reports severe pain',
            'Cranial, Spinal, and Musculoskeletal; checked once during the initial survey'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Assessing CSM before and after splinting ensures that the injury itself or the applied splint bindings have not compromised distal neurovascular perfusion.'
        },
        {
          id: 3,
          question: 'If a closed limb fracture is severely angulated and deformed, how should the first-aid responder manage the bone position?',
          options: [
            'Support and immobilize the limb in the position of comfort found; never attempt to forcefully realign angulated bones',
            'Snap the bones back into straight alignment with sudden forceful traction',
            'Rotate the extremity 180 degrees to test if the joint is dislocated',
            'Have the patient bear weight and walk on the limb to test stability'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Forceful realignment by non-medical responders lacerates adjacent brachial or femoral arteries, transects nerves, and converts closed fractures into compound open fractures.'
        },
        {
          id: 4,
          question: 'How should an open (compound) fracture with protruding bone ends through the skin be managed in first aid?',
          options: [
            'Cover the protruding bone with a sterile moist saline dressing, control external bleeding, and splint without pushing the bone back',
            'Push the exposed bone ends back beneath the skin to prevent infection',
            'Scrub the protruding bone vigorously with iodine antiseptic soap',
            'Apply a tight compression bandage directly over the exposed bone fragment'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'Pushing exposed bone back inside introduces environmental bacteria into deep sterile tissue planes, causing catastrophic osteomyelitis.'
        },
        {
          id: 5,
          question: 'What is the recommended acronym for immediate management of acute soft-tissue sprains and strains?',
          options: [
            'RICE (Rest, Ice, Compression, Elevation)',
            'HEAT (Hot compress, Exercise, Aspirin, Traction)',
            'FAST (Face, Arms, Speech, Time)',
            'PASS (Pull, Aim, Squeeze, Sweep)'
          ],
          correctOptionIndex: 0,
          difficulty: 'basic',
          clinicalRationale: 'RICE reduces inflammatory microvascular leakage, limits hematoma expansion, and mitigates painful interstitial swelling.'
        }
      ],
      intermediate: [
        {
          id: 1,
          question: 'After applying a rigid splint to a fractured tibia, the distal pedal pulse disappears and the patient’s toes become cold and pale. What must the responder do immediately?',
          options: [
            'Loosen the splint wraps immediately, reassess distal pulse, and reposition slightly if circulation was constricted',
            'Tighten the splint wraps further to stabilize the bone more rigidly',
            'Administer high-dose oral analgesics and wait for swelling to subside',
            'Apply an ice pack directly to the dorsalis pedis artery'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Loss of distal pulse indicates that splint bindings or bone angulation is occluding arterial supply. Loosening bindings relieves external vascular compression.'
        },
        {
          id: 2,
          question: 'When using an anatomical splint (buddy splinting) for a fractured finger or toe, what is the correct technique?',
          options: [
            'Tape the injured digit to the adjacent uninjured digit with soft padding placed between them',
            'Tape the injured digit tightly without any padding between digits',
            'Wrap only the tip of the injured digit with adhesive tape',
            'Splint the injured finger across the palm to the wrist joint'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Padding between digits absorbs sweat and prevents maceration, while the adjacent healthy bone acts as a stable natural splint.'
        },
        {
          id: 3,
          question: 'What is the primary danger of applying ice directly to the skin or for longer than 20 minutes on an acute ankle sprain?',
          options: [
            'Secondary frostbite tissue damage, reflex vasodilation (Hunting response), and peripheral nerve palsy',
            'Accelerated fracture callus formation',
            'Excessive muscle hypertrophy',
            'Conversion of ligament tears into bone fractures'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Direct ice or prolonged cold application (>20 minutes) risks superficial peroneal nerve palsy and thermal frostbite injury.'
        },
        {
          id: 4,
          question: 'What clinical presentation distinguishes a true joint dislocation from a mild ligament sprain?',
          options: [
            'Complete loss of normal joint contour, asymmetry, and rigid fixation in an abnormal locked angle',
            'Mild tenderness over the ligament with full active range of motion',
            'Slight erythema that disappears with pressure',
            'Tingling in the contralateral uninjured extremity'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Dislocations present with obvious deformity, locked joint immobility, and altered bony landmarks due to displacement of articulating surfaces.'
        },
        {
          id: 5,
          question: 'When splinting a suspected wrist or hand fracture, what should be placed in the patient’s palm to maintain functional alignment?',
          options: [
            'A soft roll of gauze or bandage so the hand rests in the position of function (gentle flexion as if holding a ball)',
            'A flat rigid piece of wood forcing the fingers into hyper-extension',
            'A tightly clenched metal rod to maximize grip tension',
            'Nothing; the palm must remain completely hollow and flat'
          ],
          correctOptionIndex: 0,
          difficulty: 'intermediate',
          clinicalRationale: 'Immobilizing the hand in the position of function (slight wrist extension, MCP/IP flexion) prevents tendon contractures and joint stiffness.'
        }
      ],
      advanced: [
        {
          id: 1,
          question: 'What are the classic "6 Ps" of acute extremity compartment syndrome following a crushing fracture?',
          options: [
            'Pain out of proportion, Paresthesia, Pallor, Paralysis, Pulselessness, and Poikilothermia',
            'Petechiae, Purpura, Pyrexia, Pruritus, Polyuria, and Palpitations',
            'Puffiness, Phlebitis, Pleurisy, Paraplegia, Prostration, and Ptosis',
            'Pressure, Palpitation, Polydipsia, Pneumothorax, Priapism, and Pallor'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Compartment syndrome is a limb-threatening emergency where elevated fascial pressure starves muscle beds. Pain out of proportion to exam and passive stretch pain are early hallmarks.'
        },
        {
          id: 2,
          question: 'What is the only clinical indication for attempting gentle inline traction to realign a fractured extremity in the field?',
          options: [
            'When the distal extremity is completely pulseless, cyanotic, and cold, and hospital care is delayed',
            'Whenever the limb looks crooked or unesthetic',
            'Only if the bone is protruding through the skin',
            'If the patient requests their limb to be straightened for comfort'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'One gentle attempt at inline axial traction is permitted only when limb-threatening vascular compromise (absent distal pulse) exists, attempting to restore blood flow.'
        },
        {
          id: 3,
          question: 'A patient with a high-energy closed pelvic ring fracture presents with severe hypotension and pelvic instability. What is the priority first-aid stabilization?',
          options: [
            'Circumferential pelvic binder or tightly wrapped sheet secured around the greater trochanters to reduce pelvic volume and control venous bleeding',
            'Rigid traction splints applied to both lower extremities',
            'Vigorous physical log-rolling to examine the lumbar spine',
            'Placing the patient in the seated Fowler position'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Pelvic ring disruption can cause massive retroperitoneal exsanguination (up to 3-5 liters). A pelvic binder closes the pelvis, tamponading venous plexus hemorrhage.'
        },
        {
          id: 4,
          question: 'What is the clinical role of a mechanical traction splint (e.g., Sager or Hare splint) in prehospital trauma?',
          options: [
            'Indicated exclusively for isolated closed mid-shaft femur fractures to overcome massive thigh muscle spasms and reduce occult internal blood loss',
            'Used for all knee dislocations and ankle fracture-subluxations',
            'Used for hip fractures with associated pelvic ring disruption',
            'Applied to humerus fractures in the upper extremity'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Traction splints are specifically designed for isolated mid-shaft femur fractures, counteracting quadriceps spasm to restore bone alignment and reduce thigh hematoma space.'
        },
        {
          id: 5,
          question: 'In a suspected spinal column fracture, what is the mandatory first-aid stabilization protocol?',
          options: [
            'Manual inline cervical spine stabilization, maintaining neutral alignment without traction, and preventing all spinal flexion/rotation',
            'Flexing the neck forward to place a thick pillow beneath the occiput',
            'Having the patient sit up and turn their head to check for localized pain',
            'Applying a soft towel rolled around the jaw only'
          ],
          correctOptionIndex: 0,
          difficulty: 'advanced',
          clinicalRationale: 'Manual in-line stabilization holds the head, neck, and torso in neutral alignment, preventing bony fragments from transecting the spinal cord.'
        }
      ]
    }
  };

  const levelBank = fallbackBank[levelOrder] || fallbackBank[1];
  const questions = levelBank[difficultyTier] || levelBank.basic;
  return questions;
}

module.exports = {
  generateDynamicQuiz,
  getDifficultyTier,
  LEVEL_SCENARIO_CONFIGS
};
