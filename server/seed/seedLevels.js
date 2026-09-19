export const initialLevelsData = [
  // LEVEL 1: CPR / AED
  {
    levelNumber: 1,
    title: 'Cardiopulmonary Resuscitation (CPR) & Automated External Defibrillator (AED)',
    subtitle: 'High-Quality Adult BLS Protocol',
    description: 'Master the life-saving chain of survival: rapid responsiveness check, emergency activation, high-rate chest compressions (100–120 BPM) with 5–6 cm depth and full recoil, and safe AED operation.',
    estimatedMinutes: 15,
    learningContent: {
      overview: 'Sudden Cardiac Arrest (SCA) is a leading cause of mortality worldwide. Effective bystander CPR delivered within the first 3–5 minutes doubles or triples survival rates. High-quality chest compressions maintain critical coronary perfusion pressure and cerebral blood flow until defibrillation can restore an organized cardiac rhythm.',
      clinicalGuidelines: [
        'Recognize cardiac arrest: unresponsiveness, absent or abnormal breathing (agonal gasps), and no carotid pulse detected within 10 seconds.',
        'Activate Emergency Medical Services (EMS) immediately and retrieve an AED before starting compressions if alone with an adult.',
        'Deliver compressions at 100–120 BPM to a depth of 5.0–6.0 cm (2.0–2.4 inches) in the center of the chest (lower half of sternum).',
        'Allow complete chest wall recoil between each compression; avoid leaning on the patient chest.',
        'Maintain a 30:2 compression-to-ventilation ratio. Minimize interruptions in compressions to less than 10 seconds.'
      ],
      corePrinciples: [
        { title: 'Rate & Depth', description: '100–120 BPM rhythm with 5–6 cm depth creates sufficient stroke volume to circulate oxygenated blood.', icon: 'Activity' },
        { title: 'Full Chest Recoil', description: 'Permits ventricular refilling between beats. Incomplete recoil decreases cardiac output and survival.', icon: 'Heart' },
        { title: '30:2 Cadence', description: '30 high-quality compressions followed by 2 gentle rescue breaths (head-tilt / chin-lift).', icon: 'Clock' },
        { title: 'Early Defibrillation', description: 'Attach AED pads immediately upon arrival; stop compressions only during rhythm analysis and shock delivery.', icon: 'Zap' }
      ],
      criticalWarnings: [
        'Never delay CPR for more than 10 seconds while palpating for a carotid pulse.',
        'Do not compress over the xiphoid process or epigastrium; this risks gastric rupture and liver laceration.',
        'Do not lean on the victim between compressions. Full recoil is vital for coronary refill.'
      ],
      equipmentNeeded: [
        'Pocket Mask or Bag-Valve-Mask (BVM)',
        'Automated External Defibrillator (AED)',
        'Personal Protective Equipment (Gloves, Face Shield)'
      ]
    },
    procedureSteps: [
      {
        stepIndex: 1,
        name: 'Check Scene Safety & Responsiveness',
        actionType: 'tap',
        instruction: 'Ensure the scene is safe. Tap the victim shoulders firmly and shout loudly: "Are you okay?"',
        targetArea: 'shoulders',
        timeLimitSeconds: 10,
        criticalErrorIfWrong: false,
        errorFeedback: 'Failing to verify responsiveness or scene hazards puts rescuers and victims at risk.'
      },
      {
        stepIndex: 2,
        name: 'Activate EMS & Call for AED',
        actionType: 'click',
        instruction: 'Point directly to a bystander or tap the emergency dispatch button: "Call 911 and get an AED!"',
        targetArea: 'dispatch-button',
        timeLimitSeconds: 8,
        criticalErrorIfWrong: false,
        errorFeedback: 'Immediate EMS activation is essential for advanced cardiac life support arrival.'
      },
      {
        stepIndex: 3,
        name: 'Check Carotid Pulse & Respiration',
        actionType: 'hold',
        instruction: 'Locate the carotid groove beside the trachea. Check pulse and observe chest rise for 5–10 seconds.',
        targetArea: 'carotid-groove',
        timeLimitSeconds: 10,
        criticalErrorIfWrong: true,
        errorFeedback: 'Do not spend more than 10 seconds checking pulse. If uncertain, start CPR immediately.'
      },
      {
        stepIndex: 4,
        name: 'Position Hands on Lower Sternum',
        actionType: 'position',
        instruction: 'Place the heel of one hand on the lower half of the sternum. Interlock your other hand fingers over top.',
        targetArea: 'lower-sternum',
        timeLimitSeconds: 12,
        criticalErrorIfWrong: true,
        errorFeedback: 'Compressing too low risks lacerating the liver via the xiphoid process; compressing too high fractures ribs.'
      },
      {
        stepIndex: 5,
        name: 'Perform 30 Compressions (100–120 BPM)',
        actionType: 'rhythm',
        instruction: 'Deliver 30 compressions matching the 100–120 BPM rhythm. Compress 5–6 cm deep and release completely for recoil.',
        targetArea: 'chest-compressor',
        timeLimitSeconds: 22,
        tolerance: { rateMin: 100, rateMax: 120, depthMin: 5.0, depthMax: 6.0 },
        criticalErrorIfWrong: false,
        errorFeedback: 'Maintain the metronome tempo (100–120 BPM) and ensure full chest rebound between strokes.'
      },
      {
        stepIndex: 6,
        name: 'Deliver 2 Rescue Breaths',
        actionType: 'sequence',
        instruction: 'Perform head-tilt / chin-lift, seal the mask over mouth and nose, and deliver 2 gentle breaths (1 sec each).',
        targetArea: 'airway-mask',
        timeLimitSeconds: 10,
        criticalErrorIfWrong: false,
        errorFeedback: 'Ensure airway alignment with head-tilt/chin-lift to allow air into lungs without gastric inflation.'
      }
    ],
    objectives: [
      'Assess scene safety and unresponsiveness within 10 seconds.',
      'Maintain continuous compression cadence between 100 and 120 BPM.',
      'Achieve clinical compression depth of 5.0 to 6.0 cm with 100% recoil.',
      'Execute the 30:2 compression-to-breath BLS cycle with <10s interruption.'
    ],
    interactiveTargets: [
      { name: 'Compression Rate', targetMetric: 'BPM', idealRange: '100–120', toleranceMin: 95, toleranceMax: 125, unit: 'BPM' },
      { name: 'Compression Depth', targetMetric: 'Depth', idealRange: '5.0–6.0', toleranceMin: 4.8, toleranceMax: 6.2, unit: 'cm' },
      { name: 'Chest Recoil', targetMetric: 'Recoil', idealRange: '100', toleranceMin: 90, toleranceMax: 100, unit: '%' },
      { name: 'Cycle Adherence', targetMetric: 'Ratio', idealRange: '30:2', toleranceMin: 28, toleranceMax: 32, unit: 'strokes' }
    ],
    scoringConfig: {
      actionAccuracyWeight: 0.40,
      sequenceScoreWeight: 0.35,
      timeScoreWeight: 0.25,
      mistakePenalty: 5,
      passingThreshold: 75
    },
    adaptiveAssessmentConfig: {
      passingThreshold: 70,
      questionCount: 5,
      difficultyRules: { basicThresholdMax: 80, moderateThresholdMax: 90 }
    },
    questionBank: {
      basic: [
        {
          id: 'cpr-b1',
          question: 'What is the recommended chest compression rate for an adult victim in cardiac arrest?',
          options: ['60 to 80 compressions per minute', '80 to 100 compressions per minute', '100 to 120 compressions per minute', '130 to 150 compressions per minute'],
          correctAnswer: 2,
          explanation: 'Standard BLS guidelines recommend 100 to 120 compressions per minute to optimize coronary perfusion.',
          skill: 'CPR Compression Rate'
        },
        {
          id: 'cpr-b2',
          question: 'What is the recommended compression depth for adult chest compressions?',
          options: ['At least 2 to 3 cm', 'At least 5 to 6 cm (2 to 2.4 inches)', 'At least 7 to 9 cm', 'Whatever depth feels comfortable'],
          correctAnswer: 1,
          explanation: 'Adult compressions must reach 5 to 6 cm to adequately compress the heart against the thoracic spine.',
          skill: 'Compression Depth'
        },
        {
          id: 'cpr-b3',
          question: 'What is the standard compression-to-ventilation ratio for single-rescuer adult CPR?',
          options: ['15 compressions to 2 breaths', '30 compressions to 2 breaths', '50 compressions to 5 breaths', 'Continuous breaths without compressions'],
          correctAnswer: 1,
          explanation: 'The standard adult single and two-rescuer ratio without an advanced airway is 30:2.',
          skill: 'CPR Ratio'
        },
        {
          id: 'cpr-b4',
          question: 'Where should your hands be placed when performing chest compressions on an adult?',
          options: ['Directly over the stomach', 'Upper half of the clavicle', 'Lower half of the breastbone (sternum)', 'On the left ribs over the apex of the heart'],
          correctAnswer: 2,
          explanation: 'Hands must be centered on the lower half of the sternum to avoid rib and abdominal organ injury.',
          skill: 'Hand Placement'
        },
        {
          id: 'cpr-b5',
          question: 'Why is allowing complete chest recoil between compressions critical?',
          options: ['It prevents rib fractures', 'It permits the heart chambers to refill with blood', 'It gives the rescuer time to rest', 'It increases body temperature'],
          correctAnswer: 1,
          explanation: 'Incomplete recoil keeps thoracic pressure high, preventing venous return and coronary perfusion.',
          skill: 'Chest Recoil'
        }
      ],
      moderate: [
        {
          id: 'cpr-m1',
          question: 'How long should a rescuer spend checking for breathing and a carotid pulse before starting CPR?',
          options: ['At least 15 to 20 seconds', 'At least 5 seconds, but no more than 10 seconds', 'Exactly 30 seconds', 'Pulse checks are completely forbidden'],
          correctAnswer: 1,
          explanation: 'Pulse check must be limited to 5–10 seconds to avoid unnecessary pauses in life-saving compressions.',
          skill: 'Pulse Assessment'
        },
        {
          id: 'cpr-m2',
          question: 'When an AED arrives on scene, what is the immediate first step?',
          options: ['Deliver 30 more compressions before touching it', 'Open the lid and turn the AED ON', 'Wipe down the entire torso with alcohol', 'Place pads on top of clothing'],
          correctAnswer: 1,
          explanation: 'Turning the AED on activates the voice prompts and guides all subsequent rescue steps.',
          skill: 'AED Operation'
        },
        {
          id: 'cpr-m3',
          question: 'What should the rescuer do immediately after an AED delivers a shock?',
          options: ['Check the victim pulse for 15 seconds', 'Resume chest compressions immediately starting with 30 compressions', 'Wait for the AED to advise further', 'Deliver 5 rescue breaths'],
          correctAnswer: 1,
          explanation: 'Immediately resume CPR starting with chest compressions without waiting for pulse checks.',
          skill: 'Post-Shock Protocol'
        },
        {
          id: 'cpr-m4',
          question: 'What is the physiological consequence of chest compressions delivered faster than 120 BPM?',
          options: ['Significantly higher blood pressure', 'Inadequate diastolic ventricular filling time and decreased stroke volume', 'Hyperventilation', 'Immediate return of spontaneous circulation'],
          correctAnswer: 1,
          explanation: 'Excessive rates (>120 BPM) shorten diastole, leading to shallow compressions and reduced blood flow.',
          skill: 'CPR Physiology'
        },
        {
          id: 'cpr-m5',
          question: 'If a victim has a transdermal medication patch on the chest where an AED pad belongs, you should:',
          options: ['Place the pad directly over the patch', 'Remove the patch with a gloved hand and wipe the skin clean first', 'Refuse to use the AED', 'Place both pads on the abdomen'],
          correctAnswer: 1,
          explanation: 'Medication patches can block electrical conduction and cause skin burns during defibrillation.',
          skill: 'AED Special Situations'
        }
      ],
      advanced: [
        {
          id: 'cpr-a1',
          question: 'Coronary Perfusion Pressure (CPP) is primarily generated during which phase of CPR compressions?',
          options: ['During the downstroke peak compression', 'During the relaxation/recoil phase (diastole)', 'During rescue ventilations', 'Only during AED shock delivery'],
          correctAnswer: 1,
          explanation: 'Just like in a beating heart, coronary perfusion occurs during the decompression/recoil phase.',
          skill: 'Hemodynamics of CPR'
        },
        {
          id: 'cpr-a2',
          question: 'What is the primary hemodynamic consequence of hyperventilation during CPR?',
          options: ['Increased coronary blood flow', 'Increased intrathoracic pressure causing decreased venous return and cardiac output', 'Decreased cerebral vascular resistance', 'Improved arterial oxygen tension without side effects'],
          correctAnswer: 1,
          explanation: 'Excessive ventilations raise intrathoracic pressure, hindering venous return and lowering cardiac output.',
          skill: 'Ventilation Dynamics'
        },
        {
          id: 'cpr-a3',
          question: 'What is the target Chest Compression Fraction (CCF) recommended in high-performance CPR teams?',
          options: ['At least 40%', 'At least 60%, ideally >80%', 'Exactly 50%', 'Less than 30%'],
          correctAnswer: 1,
          explanation: 'A CCF of at least 60% (ideally >80%) is correlated with significantly higher survival to hospital discharge.',
          skill: 'High-Performance BLS'
        },
        {
          id: 'cpr-a4',
          question: 'In a victim with an implanted cardiac pacemaker in the right upper chest, how should the anterolateral AED pad be positioned?',
          options: ['Directly over the pacemaker bulge', 'At least 1 inch (2.5 cm) away from the implanted device', 'On the victim back only', 'Pacemakers completely contraindicate AED usage'],
          correctAnswer: 1,
          explanation: 'Placing the pad at least 1 inch away avoids shunting defibrillator current through the pacemaker circuitry.',
          skill: 'AED Electrical Safety'
        },
        {
          id: 'cpr-a5',
          question: 'Why must chest compressions be paused for no more than 10 seconds during rhythm analysis or breath delivery?',
          options: ['Because blood clots instantly', 'Because CPP drops to near zero and requires multiple compressions to build back up', 'Because the AED will shut down', 'Because of rapid hypothermia onset'],
          correctAnswer: 1,
          explanation: 'Pausing compressions drops CPP to baseline; several compressions are required just to regain therapeutic levels.',
          skill: 'Coronary Perfusion'
        }
      ]
    }
  },

  // LEVEL 2: SEVERE HEMORRHAGE CONTROL
  {
    levelNumber: 2,
    title: 'Severe Hemorrhage Control & Tourniquet Application',
    subtitle: 'Stop the Bleed & Arterial Hemostasis',
    description: 'Master life-threatening hemorrhage control: personal protective equipment, direct firm manual pressure (40–60 N), deep junctional wound packing, Combat Application Tourniquet (CAT) placement, windlass hemostasis, and timestamping.',
    estimatedMinutes: 15,
    learningContent: {
      overview: 'Exsanguinating hemorrhage is the number one cause of preventable death in trauma. A person can bleed to death from a severed femoral or brachial artery in less than 3 minutes. Immediate recognition, aggressive direct pressure, deep wound packing, and tactical tourniquet deployment are critical BLS skills.',
      clinicalGuidelines: [
        'Always ensure personal safety and don PPE (gloves, eye protection) before encountering active arterial bleeding.',
        'Apply direct, localized manual pressure with sterile gauze using both hands, locking elbows and using body weight (40–60 N).',
        'For deep junctional/extremity wounds, tightly pack hemostatic or sterile gauze directly against the ruptured vessel until the cavity is completely filled.',
        'If bleeding is from an extremity and uncontrolled by direct pressure, apply a commercial windlass tourniquet 5–7 cm (2–3 inches) proximal to the wound (never over a joint).',
        'Twist the windlass rod until arterial spurting stops and the distal pulse disappears. Lock the windlass in the clip.',
        'Secure the windlass with the time strap and legibly record the application time (e.g., "T = 14:32").'
      ],
      corePrinciples: [
        { title: 'Immediate Pressure', description: 'Arterial blood loss must be stopped within 15 seconds of identification to prevent hemorrhagic shock.', icon: 'ShieldAlert' },
        { title: 'Wound Packing', description: 'Gauze must contact the actively bleeding vessel at the base of the wound cavity to promote clotting.', icon: 'Package' },
        { title: 'Tourniquet Placement', description: 'Place 5–7 cm proximal to the wound, avoiding the joint. Tighten until bleeding stops completely.', icon: 'Crosshair' },
        { title: 'Documentation', description: 'Recording the exact tourniquet placement time is vital for downstream surgical revascularization.', icon: 'Clock' }
      ],
      criticalWarnings: [
        'Never place a tourniquet directly over a joint (elbow or knee); the bone structure prevents vessel occlusion.',
        'Never loosen or remove a tourniquet once applied unless ordered by an authorized trauma physician.',
        'Do not apply direct pressure gingerly; 40–60 N of force is required to overcome arterial systolic pressures.'
      ],
      equipmentNeeded: [
        'Nitrile Gloves & Eye Protection',
        'Sterile Hemostatic Dressing / Gauze Roll',
        'Combat Application Tourniquet (CAT)',
        'Trauma Shears & Permanent Marker'
      ]
    },
    procedureSteps: [
      {
        stepIndex: 1,
        name: 'Don Personal Protective Equipment (PPE)',
        actionType: 'tap',
        instruction: 'Put on nitrile gloves immediately before coming into contact with blood or bodily fluids.',
        targetArea: 'ppe-gloves',
        timeLimitSeconds: 8,
        criticalErrorIfWrong: true,
        errorFeedback: 'Failing to wear PPE exposes the rescuer to bloodborne pathogen transmission.'
      },
      {
        stepIndex: 2,
        name: 'Apply Firm Direct Manual Pressure (40–60 N)',
        actionType: 'hold',
        instruction: 'Place sterile gauze directly over the bleeding site. Lean forward with locked elbows to apply 40–60 N of pressure.',
        targetArea: 'wound-pressure-pad',
        timeLimitSeconds: 15,
        tolerance: { forceMin: 40, forceMax: 60 },
        criticalErrorIfWrong: false,
        errorFeedback: 'Apply firm, continuous pressure (40–60 N) directly onto the bleeding artery within 15 seconds.'
      },
      {
        stepIndex: 3,
        name: 'Pack Deep Wound with Hemostatic Gauze',
        actionType: 'click',
        instruction: 'Maintain pressure while feeding hemostatic gauze into the deep wound cavity until packed firmly to the bone.',
        targetArea: 'wound-cavity',
        timeLimitSeconds: 20,
        criticalErrorIfWrong: false,
        errorFeedback: 'Pack gauze directly down into the base of the wound cavity where the severed vessel lies.'
      },
      {
        stepIndex: 4,
        name: 'Position CAT Tourniquet (5–7 cm Proximal)',
        actionType: 'position',
        instruction: 'Route the tourniquet band 5–7 cm (2–3 inches) above the injury, ensuring it is NOT placed over a joint.',
        targetArea: 'tourniquet-zone',
        timeLimitSeconds: 15,
        criticalErrorIfWrong: true,
        errorFeedback: 'Tourniquets must be positioned 5–7 cm above the wound and never over a joint.'
      },
      {
        stepIndex: 5,
        name: 'Tighten Windlass Until Bleeding Stops',
        actionType: 'slider',
        instruction: 'Turn the windlass rod firmly until the bright red arterial bleeding stops and the distal pulse is absent.',
        targetArea: 'windlass-rod',
        timeLimitSeconds: 15,
        criticalErrorIfWrong: true,
        errorFeedback: 'The windlass must be turned until all bleeding stops and the rod is secured in the windlass clip.'
      },
      {
        stepIndex: 6,
        name: 'Secure Windlass Strap & Record Timestamp',
        actionType: 'sequence',
        instruction: 'Route the remaining band over the windlass, secure the time strap, and write the current time (e.g. 19:45).',
        targetArea: 'time-strap',
        timeLimitSeconds: 12,
        criticalErrorIfWrong: false,
        errorFeedback: 'Documenting the application timestamp is essential for limb viability assessment in surgery.'
      }
    ],
    objectives: [
      'Don PPE and initiate direct pressure within 15 seconds of hemorrhage discovery.',
      'Sustain direct pressure between 40 and 60 Newtons.',
      'Correctly pack a deep junctional wound without releasing arterial tamponade.',
      'Deploy and lock a CAT tourniquet 5–7 cm proximal to wound with accurate timestamp.'
    ],
    interactiveTargets: [
      { name: 'Manual Pressure Force', targetMetric: 'Force', idealRange: '40–60', toleranceMin: 35, toleranceMax: 65, unit: 'N' },
      { name: 'First Pressure Latency', targetMetric: 'Latency', idealRange: '< 15', toleranceMin: 0, toleranceMax: 15, unit: 'sec' },
      { name: 'Tourniquet Placement', targetMetric: 'Distance', idealRange: '5–7', toleranceMin: 4, toleranceMax: 8, unit: 'cm proximal' },
      { name: 'Hemostasis Achieved', targetMetric: 'Bleeding Control', idealRange: '100', toleranceMin: 100, toleranceMax: 100, unit: '%' }
    ],
    scoringConfig: {
      actionAccuracyWeight: 0.40,
      sequenceScoreWeight: 0.35,
      timeScoreWeight: 0.25,
      mistakePenalty: 5,
      passingThreshold: 75
    },
    adaptiveAssessmentConfig: {
      passingThreshold: 70,
      questionCount: 5,
      difficultyRules: { basicThresholdMax: 80, moderateThresholdMax: 90 }
    },
    questionBank: {
      basic: [
        {
          id: 'hem-b1',
          question: 'Where should a tourniquet be placed on an injured limb with severe bleeding?',
          options: ['Directly over the open wound', 'Directly over the nearest joint (elbow or knee)', '5 to 7 cm (2 to 3 inches) proximal to the wound, above any joint', 'On the opposite limb'],
          correctAnswer: 2,
          explanation: 'Placing the tourniquet 5–7 cm proximal to the wound occludes the feeding artery without bone interference.',
          skill: 'Tourniquet Placement'
        },
        {
          id: 'hem-b2',
          question: 'How do you know when a tourniquet is tight enough?',
          options: ['When the victim screams in pain', 'When the bright red arterial bleeding stops and the distal pulse is absent', 'After exactly three turns of the windlass', 'When the strap turns white'],
          correctAnswer: 1,
          explanation: 'Hemostasis is confirmed when active bleeding stops and the distal pulse is no longer palpable.',
          skill: 'Tourniquet Tightness'
        },
        {
          id: 'hem-b3',
          question: 'What is the very first action a rescuer should take when encountering severe bleeding?',
          options: ['Put on PPE (gloves) and apply firm direct manual pressure', 'Wash the wound with tap water', 'Search for a tourniquet before touching the wound', 'Administer oral fluids'],
          correctAnswer: 0,
          explanation: 'Immediate direct pressure with PPE minimizes blood loss while advanced gear is retrieved.',
          skill: 'First Action'
        },
        {
          id: 'hem-b4',
          question: 'Why must the application time be written on the tourniquet time strap?',
          options: ['To prove who applied the tourniquet', 'So surgeons know the exact ischemic duration to prevent unnecessary limb amputation', 'It is required for police reports', 'It is optional and rarely used'],
          correctAnswer: 1,
          explanation: 'Ischemic time dictates surgical revascularization urgency and prevents premature limb necrosis.',
          skill: 'Tourniquet Timestamp'
        },
        {
          id: 'hem-b5',
          question: 'Can a tourniquet be loosened by a first aider if the patient complains of severe pain?',
          options: ['Yes, loosen it for 5 minutes every hour', 'No, never loosen or remove a tourniquet once applied in the field', 'Yes, loosen it until the pain subsides', 'Only if the wound looks clean'],
          correctAnswer: 1,
          explanation: 'Loosening a tourniquet can cause rapid fatal re-bleeding and release toxic metabolites.',
          skill: 'Tourniquet Safety'
        }
      ],
      moderate: [
        {
          id: 'hem-m1',
          question: 'If a properly placed tourniquet fails to completely stop arterial bleeding on a large muscular thigh, what is the correct action?',
          options: ['Remove the first tourniquet and apply direct pressure', 'Apply a second tourniquet immediately proximal (above) to the first', 'Twist the windlass with pliers until the rod snaps', 'Wait 20 minutes for a clot to form'],
          correctAnswer: 1,
          explanation: 'Applying a second tourniquet side-by-side above the first provides greater circumferential compression.',
          skill: 'Secondary Tourniquet'
        },
        {
          id: 'hem-m2',
          question: 'In junctional wounds (e.g., groin, axilla, base of neck) where a tourniquet cannot be applied, what is the primary bleeding control technique?',
          options: ['Elevation of the limb above the heart', 'Aggressive wound packing with hemostatic or sterile gauze followed by 3+ minutes of direct manual pressure', 'Applying an ice pack', 'Applying a loose bandage'],
          correctAnswer: 1,
          explanation: 'Junctional wounds require deep packing directly against the damaged artery with sustained pressure.',
          skill: 'Junctional Hemorrhage'
        },
        {
          id: 'hem-m3',
          question: 'Why should hemostatic gauze be packed tightly all the way down to the base of the wound cavity?',
          options: ['To absorb the maximum amount of blood', 'To place the pro-coagulant agent directly against the bleeding vessel opening', 'To prevent cosmetic scarring', 'To numb the local nerves'],
          correctAnswer: 1,
          explanation: 'Hemostatic agents need direct physical contact with the vessel wall and pressure against bone/tissue to initiate clotting.',
          skill: 'Hemostatic Mechanism'
        },
        {
          id: 'hem-m4',
          question: 'What is the characteristic appearance of severe arterial bleeding compared to venous bleeding?',
          options: ['Dark red blood that oozes slowly', 'Bright red blood spurting under pulsatile high pressure', 'Clear fluid with streaks of blood', 'Dark red blood flowing smoothly without pulsation'],
          correctAnswer: 1,
          explanation: 'Arterial blood is oxygenated (bright red) and driven by systolic cardiac pressure (pulsatile spurts).',
          skill: 'Vessel Differentiation'
        },
        {
          id: 'hem-m5',
          question: 'How much manual downward force is typically required to control major extremity arterial bleeding with direct pressure?',
          options: ['5 to 10 Newtons (light finger touch)', '40 to 60 Newtons (firm pressure with body weight and locked arms)', '150 to 200 Newtons', 'Any amount as long as gauze is present'],
          correctAnswer: 1,
          explanation: '40–60 N overcomes systolic arterial pressure and collapses the artery against underlying bone.',
          skill: 'Pressure Physics'
        }
      ],
      advanced: [
        {
          id: 'hem-a1',
          question: 'What is the lethal triad of trauma that rapidly develops in uncontrolled hemorrhagic shock?',
          options: ['Hypothermia, acidosis, and coagulopathy', 'Hypertension, bradycardia, and irregular respirations', 'Hyperglycemia, hypokalemia, and hyponatremia', 'Tachycardia, fever, and leukocytosis'],
          correctAnswer: 0,
          explanation: 'Blood loss causes hypothermia and metabolic acidosis, which in turn impairs enzymatic clotting (coagulopathy).',
          skill: 'Pathophysiology of Shock'
        },
        {
          id: 'hem-a2',
          question: 'What is the maximum safe ischemic time limit generally accepted for a properly placed commercial tourniquet before permanent neuromuscular damage begins?',
          options: ['15 minutes', '30 minutes', 'Up to 2 hours', '6 to 8 hours'],
          correctAnswer: 2,
          explanation: 'Tourniquet application times under 2 hours rarely cause permanent nerve injury or limb loss.',
          skill: 'Ischemia Thresholds'
        },
        {
          id: 'hem-a3',
          question: 'Which physiological mechanism allows hemostatic dressings containing kaolin or chitosan to accelerate clot formation?',
          options: ['They chemically burn and cauterize the tissue', 'Kaolin activates Factor XII (intrinsic pathway); chitosan binds negatively charged erythrocytes and platelets', 'They freeze the local blood vessels', 'They act purely as a sponge without chemical interaction'],
          correctAnswer: 1,
          explanation: 'Kaolin initiates the contact activation pathway (Factor XII) while chitosan mechanically electro-binds blood cells.',
          skill: 'Hemostatic Pharmacology'
        },
        {
          id: 'hem-a4',
          question: 'In hemorrhagic shock, what happens to pulse pressure (systolic minus diastolic pressure) as compensatory mechanisms activate?',
          options: ['Pulse pressure widens', 'Pulse pressure narrows due to sympathetic vasoconstriction elevating diastolic pressure', 'Pulse pressure remains unaffected', 'Diastolic pressure drops to zero'],
          correctAnswer: 1,
          explanation: 'Compensatory peripheral vasoconstriction maintains diastolic pressure while stroke volume drops, narrowing pulse pressure.',
          skill: 'Hemodynamic Compensations'
        },
        {
          id: 'hem-a5',
          question: 'Why is aggressive rapid crystalloid infusion (normal saline) no longer recommended in pre-hospital uncontrolled hemorrhagic shock?',
          options: ['It causes instant kidney failure', 'It dilutes clotting factors, disrupts formed clots (popping the clot), and worsens hypothermia', 'It turns the blood alkaline', 'It increases blood glucose dangerously'],
          correctAnswer: 1,
          explanation: 'Permissive hypotension (MAP ~65 mmHg) prevents hemodilution and clot dislodgement until surgical control is achieved.',
          skill: 'Damage Control Resuscitation'
        }
      ]
    }
  },

  // LEVEL 3: THERMAL BURN STABILIZATION
  {
    levelNumber: 3,
    title: 'Thermal Burn Stabilization & Cooling Protocol',
    subtitle: 'Acute Thermal Injury & Edema Management',
    description: 'Master evidence-based burn management: scene safety, stopping the burning process, controlled cooling with running water (15–20°C for 10–20 minutes), early jewelry removal before edema, sterile non-adherent dressing, and critical error avoidance (no ice/butter).',
    estimatedMinutes: 15,
    learningContent: {
      overview: 'Thermal burns destroy the skin barrier, leading to rapid fluid loss, hypothermia, severe pain, and life-threatening systemic inflammation. Immediate appropriate cooling stops the thermal cascade, preserves the zone of stasis, and reduces burn depth. Applying harmful home remedies like ice, butter, or oil severely aggravates tissue ischemia and leads to irreversible necrosis.',
      clinicalGuidelines: [
        'Ensure scene safety first: eliminate thermal, electrical, or chemical hazards before touching the victim.',
        'Stop the burning process: extinguish flames, remove smoldering non-adherent clothing, and irrigate immediately.',
        'Cool the burn wound with clean running water at 15–20°C (59–68°F) for 10 to 20 minutes.',
        'Never use ice, freezing water, or ice packs: extreme cold induces intense dermal vasoconstriction, deepening the burn injury.',
        'Immediately remove rings, watches, bracelets, and constrictive clothing before post-burn edema develops and causes compartment syndrome.',
        'Cover the burn loosely with a clean, sterile, non-adherent dressing (such as plastic wrap or dry sterile burn sheets).',
        'Prevent hypothermia: keep the rest of the patient warm with blankets, especially children and extensive burn victims.'
      ],
      corePrinciples: [
        { title: 'Controlled Cooling', description: 'Clean water at 15–20°C for 10–20 min dissipates stored heat and preserves viable dermis.', icon: 'Droplets' },
        { title: 'Edema Prevention', description: 'Constrictive items must be removed within minutes to prevent vascular strangulation as tissue swells.', icon: 'Watch' },
        { title: 'Sterile Protection', description: 'Loose non-adherent dressings shield exposed nerve endings and protect against pathogens.', icon: 'Shield' },
        { title: 'Zero Harm', description: 'Strictly avoid ice, butter, grease, toothpaste, or bursting blisters.', icon: 'AlertTriangle' }
      ],
      criticalWarnings: [
        'CRITICAL ERROR: NEVER apply ice or ice water. Ice induces severe vasoconstriction, converting partial-thickness burns to full-thickness necrosis.',
        'CRITICAL ERROR: NEVER apply butter, oil, grease, or ointments. They trap heat inside the tissue and cause catastrophic wound infections.',
        'Do not break intact blisters; the blister roof provides a natural biological sterile barrier.'
      ],
      equipmentNeeded: [
        'Clean Running Water Source (15–20°C)',
        'Sterile Burn Sheet / Non-Adherent Gauze',
        'Trauma Shears (for cutting clothes)',
        'Warm Blankets (to prevent systemic hypothermia)'
      ]
    },
    procedureSteps: [
      {
        stepIndex: 1,
        name: 'Ensure Scene Safety & Stop Burning Process',
        actionType: 'tap',
        instruction: 'Verify scene safety. Extinguish any residual flames or remove the heat source from contact with the victim.',
        targetArea: 'heat-source',
        timeLimitSeconds: 8,
        criticalErrorIfWrong: false,
        errorFeedback: 'Failing to stop the burning process causes continued progression of thermal tissue necrosis.'
      },
      {
        stepIndex: 2,
        name: 'Irrigate with Cool Running Water (15–20°C)',
        actionType: 'slider',
        instruction: 'Adjust water temperature to 15–20°C and cool the burn continuously for 10–20 minutes. Avoid ice cold water!',
        targetArea: 'water-temperature-control',
        timeLimitSeconds: 20,
        tolerance: { tempMin: 15, tempMax: 20, durationMin: 10, durationMax: 20 },
        criticalErrorIfWrong: true,
        errorFeedback: 'Water must be between 15–20°C. Using ice causes severe dermal vasoconstriction.'
      },
      {
        stepIndex: 3,
        name: 'Remove Constrictive Jewelry & Watches',
        actionType: 'drag',
        instruction: 'Gently slide rings, watches, and tight clothing off the injured limb before tissue edema sets in.',
        targetArea: 'jewelry-items',
        timeLimitSeconds: 15,
        criticalErrorIfWrong: false,
        errorFeedback: 'Failing to remove jewelry leads to tourniquet-like tissue ischemia as post-burn edema expands.'
      },
      {
        stepIndex: 4,
        name: 'Avoid Inappropriate Remedies (Ice/Butter)',
        actionType: 'click',
        instruction: 'Discard any dangerous home remedies (ice cubes, butter, toothpaste). Select only evidence-based wound care.',
        targetArea: 'remedy-selector',
        timeLimitSeconds: 10,
        criticalErrorIfWrong: true,
        errorFeedback: 'CRITICAL ERROR: Applying ice or butter severely damages viable tissue and worsens the burn depth.'
      },
      {
        stepIndex: 5,
        name: 'Apply Loose Sterile Non-Adherent Dressing',
        actionType: 'position',
        instruction: 'Place a clean, dry, non-adherent sterile dressing or clean plastic wrap loosely over the cooled burn area.',
        targetArea: 'burn-dressing-pad',
        timeLimitSeconds: 15,
        criticalErrorIfWrong: false,
        errorFeedback: 'Dressings must be loose and non-adherent to prevent sticking to dermis and allow swelling.'
      },
      {
        stepIndex: 6,
        name: 'Maintain Normothermia & Estimate TBSA',
        actionType: 'sequence',
        instruction: 'Cover unburned body parts with a warm blanket to prevent hypothermia and prepare for EMS transfer.',
        targetArea: 'warm-blanket',
        timeLimitSeconds: 12,
        criticalErrorIfWrong: false,
        errorFeedback: 'Burn patients lose thermal regulation rapidly; keep the patient warm to avoid lethal hypothermia.'
      }
    ],
    objectives: [
      'Stop the thermal burning process within 10 seconds.',
      'Maintain running water irrigation between 15°C and 20°C for 10–20 minutes.',
      'Remove all constricting rings, watches, and tight apparel before edema develops.',
      'Reject all harmful contraindications (ice, butter, toothpaste) and protect with non-adherent cover.'
    ],
    interactiveTargets: [
      { name: 'Water Temperature', targetMetric: 'Temperature', idealRange: '15–20', toleranceMin: 14, toleranceMax: 22, unit: '°C' },
      { name: 'Irrigation Duration', targetMetric: 'Duration', idealRange: '10–20', toleranceMin: 10, toleranceMax: 25, unit: 'minutes' },
      { name: 'Jewelry Removal Latency', targetMetric: 'Latency', idealRange: '< 60', toleranceMin: 0, toleranceMax: 60, unit: 'sec' },
      { name: 'Contraindication Avoidance', targetMetric: 'Safety', idealRange: '100', toleranceMin: 100, toleranceMax: 100, unit: '%' }
    ],
    scoringConfig: {
      actionAccuracyWeight: 0.40,
      sequenceScoreWeight: 0.35,
      timeScoreWeight: 0.25,
      mistakePenalty: 5,
      passingThreshold: 75
    },
    adaptiveAssessmentConfig: {
      passingThreshold: 70,
      questionCount: 5,
      difficultyRules: { basicThresholdMax: 80, moderateThresholdMax: 90 }
    },
    questionBank: {
      basic: [
        {
          id: 'burn-b1',
          question: 'What is the recommended temperature for cooling a fresh thermal burn?',
          options: ['Freezing ice water (0°C to 4°C)', 'Cool running water between 15°C and 20°C', 'Lukewarm water (35°C to 40°C)', 'Boiling hot water'],
          correctAnswer: 1,
          explanation: 'Cool running water at 15–20°C safely dissipates heat without inducing vasoconstriction or frostbite.',
          skill: 'Cooling Temperature'
        },
        {
          id: 'burn-b2',
          question: 'Why should you NEVER apply ice or ice packs directly to a burn wound?',
          options: ['Ice costs too much money', 'Ice causes extreme vasoconstriction, worsening tissue ischemia and converting the burn to deeper necrosis', 'Ice makes the victim too hot', 'Ice causes the dressing to slip off'],
          correctAnswer: 1,
          explanation: 'Ice induces profound dermal vasoconstriction, cutting off microvascular blood flow to compromised tissue.',
          skill: 'Ice Contraindication'
        },
        {
          id: 'burn-b3',
          question: 'Why is it critical to remove rings, watches, and bracelets immediately after a burn to an arm or hand?',
          options: ['To clean the jewelry', 'Because rapid edema (swelling) will cause the jewelry to cut off distal blood flow like a tourniquet', 'Jewelry attracts heat', 'Jewelry increases burn depth automatically'],
          correctAnswer: 1,
          explanation: 'Post-burn edema develops rapidly; rigid rings can strangle fingers and lead to gangrene.',
          skill: 'Edema & Jewelry'
        },
        {
          id: 'burn-b4',
          question: 'Which of the following home remedies is recommended for a thermal burn?',
          options: ['Butter or margarine', 'Toothpaste or mayonnaise', 'Raw egg whites', 'None of these; only cool running water and sterile non-adherent dressings should be used'],
          correctAnswer: 3,
          explanation: 'Food products and household chemicals trap heat, harbor bacteria, and cause massive wound infections.',
          skill: 'Harmful Remedies'
        },
        {
          id: 'burn-b5',
          question: 'What should be done with intact blisters formed on a second-degree burn?',
          options: ['Pop them with a needle to drain fluid', 'Leave them completely intact and cover loosely with a sterile dressing', 'Peel the skin off immediately', 'Rub them with salt'],
          correctAnswer: 1,
          explanation: 'Intact blisters provide a sterile biological dressing that protects raw dermis from bacteria.',
          skill: 'Blister Management'
        }
      ],
      moderate: [
        {
          id: 'burn-m1',
          question: 'How long should cool water irrigation be maintained on an acute thermal burn?',
          options: ['30 seconds only', '1 to 2 minutes', '10 to 20 minutes', '4 to 6 hours'],
          correctAnswer: 2,
          explanation: 'Evidence confirms that 10–20 minutes of cooling minimizes burn progression, depth, and grafting requirements.',
          skill: 'Irrigation Duration'
        },
        {
          id: 'burn-m2',
          question: 'In extensive burns involving greater than 20% Total Body Surface Area (TBSA), what systemic complication must rescuers actively prevent during cooling?',
          options: ['Hypertension', 'Severe systemic hypothermia', 'Hyperglycemia', 'Dehydration of unburned skin'],
          correctAnswer: 1,
          explanation: 'Burn patients lose the cutaneous insulation layer; over-cooling large burns leads to lethal core hypothermia.',
          skill: 'Hypothermia Risk'
        },
        {
          id: 'burn-m3',
          question: 'Why is clear food-grade plastic wrap (cling film) often recommended as an ideal temporary pre-hospital dressing for burns?',
          options: ['It warms up the skin', 'It is non-adherent, seals against bacteria, prevents fluid evaporation, and allows wound visualization without removal', 'It dissolves into the skin to heal cells', 'It applies high compression to stop swelling'],
          correctAnswer: 1,
          explanation: 'Plastic wrap does not stick to raw dermis, reduces pain by blocking air currents, and keeps the wound clean.',
          skill: 'Burn Dressings'
        },
        {
          id: 'burn-m4',
          question: 'According to the clinical zones of burn injury (Jackson’s Burn Model), which zone represents tissue that can be rescued by timely cooling and resuscitation?',
          options: ['Zone of Coagulation', 'Zone of Stasis', 'Zone of Hyperemia', 'Zone of Complete Necrosis'],
          correctAnswer: 1,
          explanation: 'The Zone of Stasis has compromised microcirculation; effective cooling and fluid resuscitation prevent it from dying.',
          skill: 'Jackson Burn Model'
        },
        {
          id: 'burn-m5',
          question: 'If burned clothing is melted and firmly adhered to the patient skin, the rescuer should:',
          options: ['Rip it off forcefully to expose the wound', 'Cut around the adhered fabric and leave the stuck portions in place for surgical debridement', 'Scrub it off with soapy water', 'Ignore the entire burn area'],
          correctAnswer: 1,
          explanation: 'Forcefully tearing adhered synthetic clothing pulls off viable dermis, converting the injury into a deeper wound.',
          skill: 'Clothing Removal'
        }
      ],
      advanced: [
        {
          id: 'burn-a1',
          question: 'What is the physiological basis of Burn Shock that occurs in severe major thermal injuries?',
          options: ['Neurogenic vasodilation with normal capillary permeability', 'Massive systemic capillary leak causing intravascular plasma extravasation, severe hypovolemia, and hemoconcentration', 'Pure cardiogenic failure without fluid shifts', 'Septic endotoxemia occurring within minutes of injury'],
          correctAnswer: 1,
          explanation: 'Inflammatory mediators induce widespread endothelial permeability, causing intravascular fluid to pour into interstitial spaces.',
          skill: 'Burn Shock Pathophysiology'
        },
        {
          id: 'burn-a2',
          question: 'What is the primary danger of a circumferential full-thickness burn around an extremity or the chest wall?',
          options: ['Rapid keloid scar formation', 'Inelastic burn eschar restricting blood flow or thoracic expansion, leading to compartment syndrome or asphyxia', 'Excessive perspiration', 'Sudden hypokalemia'],
          correctAnswer: 1,
          explanation: 'Leathery, unyielding eschar combined with sub-eschar edema creates an internal tourniquet effect requiring escharotomy.',
          skill: 'Circumferential Burns'
        },
        {
          id: 'burn-a3',
          question: 'According to the Rule of Nines for an adult, what percentage of Total Body Surface Area (TBSA) is assigned to the entire anterior torso (chest and abdomen)?',
          options: ['9%', '18%', '36%', '4.5%'],
          correctAnswer: 1,
          explanation: 'The anterior torso represents 18% TBSA (chest 9% + abdomen 9%), and the posterior torso represents another 18%.',
          skill: 'Rule of Nines'
        },
        {
          id: 'burn-a4',
          question: 'In inhalation thermal injury, what clinical findings indicate impending catastrophic upper airway compromise requiring immediate endotracheal intubation?',
          options: ['Superficial redness of the cheeks', 'Stridor, hoarseness, singed nasal hairs, and carbonaceous sputum', 'Decreased bowel sounds', 'Mild cough with clear sputum'],
          correctAnswer: 1,
          explanation: 'Stridor and vocal changes signal acute supraglottic edema that can completely close the airway within minutes.',
          skill: 'Airway Burn Assessment'
        },
        {
          id: 'burn-a5',
          question: 'How does effective pre-hospital water cooling within the first 30 minutes impact the depth and ultimate outcome of a deep partial-thickness burn?',
          options: ['It has no measurable clinical benefit', 'It reduces histamine and thromboxane release, preserves microvascular perfusion, decreases pain, and significantly reduces the need for surgical skin grafting', 'It converts full-thickness burns to superficial burns instantly', 'It eliminates all bacterial colonization permanently'],
          correctAnswer: 1,
          explanation: 'Controlled cooling suppresses eicosanoid and inflammatory cascade release, protecting viable capillaries in the zone of stasis.',
          skill: 'Microvascular Salvage'
        }
      ]
    }
  },

  // LEVEL 4: CHOKING / FOREIGN BODY AIRWAY OBSTRUCTION
  {
    levelNumber: 4,
    title: 'Foreign Body Airway Obstruction (Choking)',
    subtitle: 'Relief of Complete Upper Airway Blockage',
    description: 'Master life-saving airway clearance: differentiate mild vs severe obstruction, patient positioning, 5 sharp back blows between shoulder blades, 5 upward abdominal thrusts (Heimlich), airway reassessment, and seamless transition to modified CPR if unconscious.',
    estimatedMinutes: 15,
    learningContent: {
      overview: 'Foreign body airway obstruction (choking) can cause irreversible brain damage within 4–6 minutes and death within 10 minutes. Distinguishing between a mild obstruction (victim can cough forcefully and speak) and a severe obstruction (silent cough, inability to speak/breathe, cyanosis, universal choking sign) is the fundamental first step.',
      clinicalGuidelines: [
        'Recognize obstruction severity: if victim can cough loudly and speak, encourage them to cough; do NOT interfere.',
        'If severe obstruction (cannot speak, silent cough, clutching neck, stridor, cyanosis): intervene immediately.',
        'Stand to the side and slightly behind the victim. Support their chest with one hand and lean them well forward so dislodged objects exit the mouth rather than sliding back down.',
        'Deliver up to 5 sharp back blows between the shoulder blades using the heel of your hand.',
        'If back blows fail, stand behind the victim, wrap arms around the waist, make a fist with thumb side against the abdomen slightly above the navel (well below xiphoid), grasp fist with other hand, and deliver 5 quick, upward, inward abdominal thrusts (Heimlich).',
        'Continue 5 back blows alternating with 5 abdominal thrusts until object is expelled or victim becomes unconscious.',
        'If victim becomes unconscious: lower safely to the ground, activate EMS, and begin modified CPR immediately. Look into the mouth each time you open the airway for breaths, and remove visible objects (NO blind finger sweeps).'
      ],
      corePrinciples: [
        { title: 'Severity Triage', description: 'Mild = encourage coughing. Severe = immediate physical intervention (5:5 cadence).', icon: 'AlertCircle' },
        { title: 'Lean Forward', description: 'Leaning the patient forward uses gravity to ensure expelled objects fall out of the oral cavity.', icon: 'ArrowDownRight' },
        { title: '5:5 Cadence', description: 'Alternate 5 interscapular back blows with 5 subdiaphragmatic abdominal thrusts.', icon: 'Repeat' },
        { title: 'Unconscious Pivot', description: 'Immediately transition to supine CPR if responsiveness is lost; chest compressions generate higher airway pressures.', icon: 'HeartHandshake' }
      ],
      criticalWarnings: [
        'CRITICAL ERROR: NEVER perform a blind finger sweep. Pushing blind fingers into the pharynx forces the object deeper into the laryngeal inlet.',
        'Do NOT perform abdominal thrusts on pregnant women or infants under 1 year (use chest thrusts instead).',
        'Do not press on the xiphoid process or lower ribs; this can fracture bone and cause hepatic or splenic lacerations.'
      ],
      equipmentNeeded: [
        'PPE (Gloves)',
        'Suction Device (if available)',
        'BLS Resuscitation Mask'
      ]
    },
    procedureSteps: [
      {
        stepIndex: 1,
        name: 'Assess Obstruction Severity',
        actionType: 'tap',
        instruction: 'Ask the victim: "Are you choking? Can you speak?" Observe for universal choking sign (hands at throat) and silent cough.',
        targetArea: 'victim-throat',
        timeLimitSeconds: 8,
        criticalErrorIfWrong: false,
        errorFeedback: 'Promptly differentiate mild obstruction (coughing) from severe obstruction (silent, unable to breathe).'
      },
      {
        stepIndex: 2,
        name: 'Position Patient Forward with Chest Support',
        actionType: 'position',
        instruction: 'Stand behind and to the side. Support the victim chest with one arm and lean the victim well forward.',
        targetArea: 'victim-torso',
        timeLimitSeconds: 10,
        criticalErrorIfWrong: false,
        errorFeedback: 'Leaning the victim forward is essential so gravity assists the foreign body out rather than down the trachea.'
      },
      {
        stepIndex: 3,
        name: 'Deliver 5 Sharp Back Blows',
        actionType: 'tap',
        instruction: 'Deliver 5 sharp, forceful blows between the shoulder blades using the heel of your hand.',
        targetArea: 'interscapular-target',
        timeLimitSeconds: 12,
        tolerance: { count: 5 },
        criticalErrorIfWrong: false,
        errorFeedback: 'Back blows must strike firmly between the scapulae to create sudden intrathoracic airway pressure.'
      },
      {
        stepIndex: 4,
        name: 'Deliver 5 Upward Abdominal Thrusts',
        actionType: 'drag',
        instruction: 'Position fist just above the navel (below xiphoid). Grasp fist and pull inward and upward with 5 sharp thrusts.',
        targetArea: 'subdiaphragm-vector',
        timeLimitSeconds: 14,
        tolerance: { count: 5, vector: 'inward-upward' },
        criticalErrorIfWrong: true,
        errorFeedback: 'Thrusts must be aimed inward and upward above the navel to elevate the diaphragm and expel air.'
      },
      {
        stepIndex: 5,
        name: 'Reassess Airway & Object Expulsion',
        actionType: 'click',
        instruction: 'Check if the foreign body was expelled or if the victim can now breathe and speak.',
        targetArea: 'oral-airway',
        timeLimitSeconds: 8,
        criticalErrorIfWrong: false,
        errorFeedback: 'Reassess after each 5-blow/5-thrust cycle before deciding whether to continue or transition.'
      },
      {
        stepIndex: 6,
        name: 'Unconscious Transition to Modified CPR',
        actionType: 'sequence',
        instruction: 'If the victim becomes unresponsive, ease them to the floor, call 911, and begin modified CPR immediately.',
        targetArea: 'supine-cpr-bed',
        timeLimitSeconds: 12,
        criticalErrorIfWrong: true,
        errorFeedback: 'When a choking victim loses consciousness, start CPR immediately. Never perform blind finger sweeps.'
      }
    ],
    objectives: [
      'Accurately identify severe complete foreign body airway obstruction within 8 seconds.',
      'Deliver 5 interscapular back blows with the victim leaned forward.',
      'Perform 5 inward-and-upward abdominal thrusts with proper subdiaphragmatic hand placement.',
      'Transition seamlessly to modified CPR if unresponsiveness occurs, avoiding blind finger sweeps.'
    ],
    interactiveTargets: [
      { name: 'Back Blow Location', targetMetric: 'Position', idealRange: 'Interscapular', toleranceMin: 90, toleranceMax: 100, unit: '%' },
      { name: 'Thrust Vector', targetMetric: 'Direction', idealRange: 'Inward & Upward', toleranceMin: 90, toleranceMax: 100, unit: '%' },
      { name: 'Cadence Adherence', targetMetric: 'Ratio', idealRange: '5:5', toleranceMin: 5, toleranceMax: 5, unit: 'blows/thrusts' },
      { name: 'CPR Transition Latency', targetMetric: 'Latency', idealRange: '< 10', toleranceMin: 0, toleranceMax: 10, unit: 'sec' }
    ],
    scoringConfig: {
      actionAccuracyWeight: 0.40,
      sequenceScoreWeight: 0.35,
      timeScoreWeight: 0.25,
      mistakePenalty: 5,
      passingThreshold: 75
    },
    adaptiveAssessmentConfig: {
      passingThreshold: 70,
      questionCount: 5,
      difficultyRules: { basicThresholdMax: 80, moderateThresholdMax: 90 }
    },
    questionBank: {
      basic: [
        {
          id: 'choke-b1',
          question: 'What is the universal distress signal for choking?',
          options: ['Waving one arm overhead', 'Clutching the throat with one or both hands', 'Lying down on the floor', 'Coughing loudly into a handkerchief'],
          correctAnswer: 1,
          explanation: 'Clutching the throat with hands is recognized globally as the universal sign of airway obstruction.',
          skill: 'Choking Recognition'
        },
        {
          id: 'choke-b2',
          question: 'If a choking victim is coughing forcefully and can speak words, what should the rescuer do?',
          options: ['Immediately perform 5 abdominal thrusts', 'Encourage them to continue coughing forcefully and monitor closely without hitting them', 'Perform a blind finger sweep', 'Slap them on the back while they stand upright'],
          correctAnswer: 1,
          explanation: 'In mild obstruction, spontaneous coughing produces higher airway pressures than external thrusts.',
          skill: 'Mild vs Severe Triage'
        },
        {
          id: 'choke-b3',
          question: 'Where should your hands be placed when performing abdominal thrusts on a conscious adult?',
          options: ['Directly over the lower ribs on the left side', 'Just above the navel and well below the xiphoid process', 'Directly over the sternum (breastbone)', 'On the lower abdomen near the pelvis'],
          correctAnswer: 1,
          explanation: 'Placing the fist just above the navel directs force into the diaphragm without fracturing ribs or xiphoid.',
          skill: 'Hand Placement'
        },
        {
          id: 'choke-b4',
          question: 'In what direction should abdominal thrusts be directed?',
          options: ['Directly downward toward the feet', 'Straight backward horizontally only', 'Quick, sharp thrusts directed inward and upward', 'Gently outward'],
          correctAnswer: 2,
          explanation: 'Inward and upward thrusts elevate the diaphragm, compressing the lungs and expelling the foreign object like a cork.',
          skill: 'Thrust Vector'
        },
        {
          id: 'choke-b5',
          question: 'Why is leaning the victim forward important before delivering back blows?',
          options: ['It makes the victim lighter', 'It ensures gravity helps the dislodged foreign object fall out of the mouth instead of sliding deeper into the airway', 'It stretches the neck muscles', 'It makes the blows hurt less'],
          correctAnswer: 1,
          explanation: 'If the victim stands upright, a dislodged object is pulled by gravity straight back down the trachea.',
          skill: 'Positioning Physics'
        }
      ],
      moderate: [
        {
          id: 'choke-m1',
          question: 'What should you do if a conscious choking victim is in late-stage pregnancy or has severe obesity where your arms cannot encircle the abdomen?',
          options: ['Perform chest thrusts with your fist centered on the middle of the breastbone instead of abdominal thrusts', 'Give up and wait for EMS', 'Lie them on the floor and jump on their stomach', 'Deliver back blows only and never touch the chest'],
          correctAnswer: 0,
          explanation: 'Chest thrusts over the mid-sternum are the standard guideline-recommended alternative for pregnancy and obesity.',
          skill: 'Special Populations'
        },
        {
          id: 'choke-m2',
          question: 'If a conscious choking victim becomes unconscious while you are performing thrusts, what is the immediate sequence of actions?',
          options: ['Deliver 5 more abdominal thrusts on the floor', 'Carefully lower them to the floor, call 911/EMS, and immediately begin CPR starting with 30 chest compressions', 'Perform a blind finger sweep to find the obstruction', 'Leave them to find an AED'],
          correctAnswer: 1,
          explanation: 'Unresponsive choking victims require immediate modified CPR; chest compressions generate effective airway pressure.',
          skill: 'Unconscious Transition'
        },
        {
          id: 'choke-m3',
          question: 'Why are blind finger sweeps strictly contraindicated in both conscious and unconscious choking victims?',
          options: ['They take too long', 'The finger can push an unseen foreign body deeper into the laryngeal opening, causing complete irreversible occlusion or tissue trauma', 'They cause tooth decay', 'They are only allowed for doctors'],
          correctAnswer: 1,
          explanation: 'Blind sweeps routinely lodge loose objects into the subglottic space; fingers should only retrieve visually confirmed objects.',
          skill: 'Blind Sweep Hazard'
        },
        {
          id: 'choke-m4',
          question: 'During modified CPR for an unconscious choking victim, when should the rescuer inspect the oral cavity for the foreign object?',
          options: ['Every 5 minutes', 'Each time the airway is opened to deliver rescue breaths (after each 30 compressions)', 'Only after an AED delivers a shock', 'Before touching the patient chest'],
          correctAnswer: 1,
          explanation: 'Chest compressions often dislodge the object into the mouth; look before delivering breaths and remove if visible.',
          skill: 'Modified CPR Protocol'
        },
        {
          id: 'choke-m5',
          question: 'For an infant under 1 year of age who is choking with severe obstruction, what is the correct intervention?',
          options: ['5 abdominal thrusts followed by 5 chest compressions', '5 gentle back slaps followed by 5 chest thrusts with the infant face-down then face-up along the rescuer forearm', 'Adult Heimlich maneuver with full force', 'Blind finger sweep with pinky finger'],
          correctAnswer: 1,
          explanation: 'Abdominal thrusts cause hepatic damage in infants; alternating 5 back slaps and 5 chest thrusts is the safe standard.',
          skill: 'Infant Choking'
        }
      ],
      advanced: [
        {
          id: 'choke-a1',
          question: 'What physiological peak airway pressure is generated by chest compressions in an unconscious supine victim compared to upright abdominal thrusts?',
          options: ['Chest compressions generate substantially lower airway pressures', 'Chest compressions generate equivalent or higher intrathoracic and airway pressures than abdominal thrusts', 'Chest compressions generate zero airway pressure', 'Upright abdominal thrusts are 10 times more powerful in all cardiac arrest patients'],
          correctAnswer: 1,
          explanation: 'Studies show chest compressions generate airway pressures equal to or exceeding Heimlich thrusts, aiding dislodgement.',
          skill: 'Airway Pressure Dynamics'
        },
        {
          id: 'choke-a2',
          question: 'What acute internal injury is most frequently reported following improperly placed or excessively violent abdominal thrusts?',
          options: ['Fracture of the femur', 'Gastric rupture, splenic rupture, liver laceration, or diaphragmatic herniation', 'Pneumothorax without rib fracture', 'Renal artery thrombosis'],
          correctAnswer: 1,
          explanation: 'Incorrect hand placement on the epigastrium or xiphoid can rupture the stomach or tear liver/spleen parenchyma.',
          skill: 'Iatrogenic Complications'
        },
        {
          id: 'choke-a3',
          question: 'How does the anatomy of the pediatric larynx (specifically in toddlers) differ from that of adults regarding foreign body impaction?',
          options: ['The pediatric airway is widest at the vocal cords', 'The infant larynx is funnel-shaped and narrowest at the non-distensible cricoid ring, making complete occlusion by round objects much more likely', 'The pediatric larynx is rigid and cannot spasm', 'The trachea is completely cylindrical in infants'],
          correctAnswer: 1,
          explanation: 'In children under 8, the subglottic cricoid ring is the narrowest point, where circular foods (grapes, hotdogs) impact tightly.',
          skill: 'Pediatric Airway Anatomy'
        },
        {
          id: 'choke-a4',
          question: 'If a conscious patient with complete airway obstruction cannot be relieved by back blows or abdominal thrusts and is about to collapse, what is the metabolic status of the myocardium and brain?',
          options: ['Fully oxygenated and stable', 'Rapidly developing hypercapnia, severe hypoxemia, and acute respiratory acidosis leading to bradycardia and PEA arrest', 'Metabolic alkalosis due to tachypnea', 'Hyperkalemia only'],
          correctAnswer: 1,
          explanation: 'Asphyxia produces profound hypoxemia and hypercapnic acidosis, which triggers vagal bradycardia and cardiac arrest.',
          skill: 'Asphyxial Arrest Pathophysiology'
        },
        {
          id: 'choke-a5',
          question: 'Following successful dislodgement of a foreign body in an adult through abdominal thrusts, why must the patient still be evaluated at an emergency department even if feeling well?',
          options: ['To confirm their identity', 'Because abdominal thrusts can cause occult internal visceral lacerations, mesenteric tears, or pneumatic esophageal rupture that may be initially asymptomatic', 'It is purely an administrative policy without medical basis', 'To administer antibiotics'],
          correctAnswer: 1,
          explanation: 'High subdiaphragmatic pressures can cause occult splenic/liver hematomas or delayed gastric tears requiring imaging.',
          skill: 'Post-Resuscitation Care'
        }
      ]
    }
  },

  // LEVEL 5: MUSCULOSKELETAL FRACTURE SPLINTING
  {
    levelNumber: 5,
    title: 'Musculoskeletal Fracture Stabilization & Splinting',
    subtitle: 'Pre/Post Neurovascular Assessment & Joint Immobilization',
    description: 'Master anatomical limb splinting: limb support in position of comfort, meticulous Pre-splint Pulse-Motor-Sensory (PMS) assessment, rigid/padded splint selection, joint-above and joint-below immobilization, safe non-constrictive securing, and mandatory Post-splint PMS reassessment.',
    estimatedMinutes: 15,
    learningContent: {
      overview: 'Unstable musculoskeletal fractures can convert closed fractures into open wounds, lacerate adjacent major neurovascular bundles, and cause catastrophic permanent paralysis or hemorrhagic shock. The primary goal of emergency splinting is immobilization of the fracture site and the joints immediately above and below the injury, while preserving distal neurovascular perfusion.',
      clinicalGuidelines: [
        'Support the injured extremity manually in the position found; never attempt forceful realignment or gross reduction unless distal circulation (pulse) is absent and medical protocol authorizes gentle in-line traction.',
        'Perform a meticulous Pre-splint PMS (Pulse, Motor, Sensory) evaluation distal to the injury site:',
        '  • Pulse: Palpate radial pulse (upper limb) or dorsalis pedis / posterior tibial pulse (lower limb). Check capillary refill (<2 sec).',
        '  • Motor: Ask the conscious patient to wiggle fingers or toes.',
        '  • Sensory: Lightly touch distal digits and ask: "Which finger/toe am I touching? Can you feel this normally?"',
        'Select a splint of appropriate length and contour. The splint MUST immobilize the joint ABOVE and the joint BELOW the fracture site (e.g., for a forearm fracture, immobilize both wrist and elbow).',
        'Pad all rigid splint surfaces, especially over bony prominences, to prevent pressure necrosis.',
        'Secure the splint with elastic bandages or cravats. Apply snug tension to stabilize without constricting circulation.',
        'Immediately perform a Post-splint PMS assessment. If distal pulse, sensation, or movement deteriorates after splinting, loosen the securing straps immediately!'
      ],
      corePrinciples: [
        { title: 'Support in Position Found', description: 'Prevent jagged bone fragments from tearing arteries, veins, and major nerve trunks.', icon: 'Hand' },
        { title: 'Two-Joint Rule', description: 'Always immobilize the joint ABOVE and the joint BELOW the suspected fracture.', icon: 'Maximize2' },
        { title: 'PMS Assessment', description: 'Pulse, Motor, and Sensory must be verified BEFORE and immediately AFTER splinting.', icon: 'CheckCircle2' },
        { title: 'Safe Tension', description: 'Straps must be snug enough to prevent movement, but never tight enough to compromise distal blood flow.', icon: 'Sliders' }
      ],
      criticalWarnings: [
        'CRITICAL ERROR: Splinting too tightly and obliterating distal pulses causes acute ischemic compartment syndrome and limb necrosis.',
        'CRITICAL ERROR: Failing to immobilize the joints above and below allows ongoing bone motion and neurovascular injury.',
        'Never push protruding open bone ends back inside the wound; dress open wounds with sterile moist gauze before splinting.'
      ],
      equipmentNeeded: [
        'SAM Splint / Rigid Board Splints / Padded Board Splints',
        'Elastic Roller Bandages / Cravats',
        'Sterile Gauze & Padding',
        'Ice Pack (applied around, never directly on bare skin)'
      ]
    },
    procedureSteps: [
      {
        stepIndex: 1,
        name: 'Support Injured Limb in Position Found',
        actionType: 'hold',
        instruction: 'Place gentle hands above and below the suspected fracture to manually stabilize the extremity in the position found.',
        targetArea: 'limb-support-zone',
        timeLimitSeconds: 10,
        criticalErrorIfWrong: false,
        errorFeedback: 'Failing to support the limb allows bone fragments to move, lacerating nerves and arteries.'
      },
      {
        stepIndex: 2,
        name: 'Perform Pre-Splint PMS Assessment',
        actionType: 'sequence',
        instruction: 'Check distal Pulse (radial/pedal), Motor function (finger/toe wiggle), and Sensory perception (touch check).',
        targetArea: 'pms-pre-checklist',
        timeLimitSeconds: 15,
        criticalErrorIfWrong: true,
        errorFeedback: 'CRITICAL: Never apply a splint without documenting pre-existing neurovascular status (PMS).'
      },
      {
        stepIndex: 3,
        name: 'Select & Shape Anatomical Splint',
        actionType: 'position',
        instruction: 'Select a splint long enough to span past both adjacent joints. Mold or pad the splint to fit the limb contours.',
        targetArea: 'splint-bed',
        timeLimitSeconds: 14,
        criticalErrorIfWrong: false,
        errorFeedback: 'The splint must be of sufficient length to immobilize the joint above and below the fracture.'
      },
      {
        stepIndex: 4,
        name: 'Immobilize Joint Above & Joint Below',
        actionType: 'click',
        instruction: 'Align the splint so it firmly spans past the joint above (e.g., elbow) and the joint below (e.g., wrist).',
        targetArea: 'two-joint-targets',
        timeLimitSeconds: 15,
        criticalErrorIfWrong: true,
        errorFeedback: 'CRITICAL ERROR: You must immobilize the joint above AND the joint below the fracture site.'
      },
      {
        stepIndex: 5,
        name: 'Secure Straps with Safe Non-Constrictive Tension',
        actionType: 'slider',
        instruction: 'Fasten the securing straps. Adjust tension so the splint is firm and stable without cutting off circulation.',
        targetArea: 'strap-tension-gauge',
        timeLimitSeconds: 15,
        tolerance: { tensionMin: 50, tensionMax: 75 },
        criticalErrorIfWrong: true,
        errorFeedback: 'Straps that are too tight compromise distal blood flow; straps that are too loose fail to immobilize.'
      },
      {
        stepIndex: 6,
        name: 'Perform Post-Splint PMS Reassessment',
        actionType: 'sequence',
        instruction: 'Recheck distal Pulse, Motor, and Sensory immediately. Confirm circulation remains fully intact after securing.',
        targetArea: 'pms-post-checklist',
        timeLimitSeconds: 12,
        criticalErrorIfWrong: true,
        errorFeedback: 'CRITICAL: If post-splint PMS is diminished or absent, the splint is too tight and must be loosened immediately!'
      }
    ],
    objectives: [
      'Manually stabilize the injured limb in position of comfort without gross manipulation.',
      'Execute a complete 3-point Pre-splint PMS (Pulse, Motor, Sensory) evaluation within 15 seconds.',
      'Apply a padded splint immobilizing both the joint above and joint below the fracture site.',
      'Fasten straps to a secure physiological tension and verify post-splint PMS integrity.'
    ],
    interactiveTargets: [
      { name: 'Pre-Splint PMS Verification', targetMetric: 'Checklist', idealRange: '100', toleranceMin: 100, toleranceMax: 100, unit: '%' },
      { name: 'Joint Immobilization Span', targetMetric: 'Span', idealRange: 'Above & Below', toleranceMin: 100, toleranceMax: 100, unit: 'joints' },
      { name: 'Strap Tension Level', targetMetric: 'Tension', idealRange: '50–75', toleranceMin: 45, toleranceMax: 80, unit: '%' },
      { name: 'Post-Splint PMS Verification', targetMetric: 'Checklist', idealRange: '100', toleranceMin: 100, toleranceMax: 100, unit: '%' }
    ],
    scoringConfig: {
      actionAccuracyWeight: 0.40,
      sequenceScoreWeight: 0.35,
      timeScoreWeight: 0.25,
      mistakePenalty: 5,
      passingThreshold: 75
    },
    adaptiveAssessmentConfig: {
      passingThreshold: 70,
      questionCount: 5,
      difficultyRules: { basicThresholdMax: 80, moderateThresholdMax: 90 }
    },
    questionBank: {
      basic: [
        {
          id: 'fx-b1',
          question: 'What does the clinical acronym PMS stand for when evaluating an injured extremity?',
          options: ['Pressure, Movement, Strength', 'Pulse, Motor, Sensory', 'Pain, Moisture, Swelling', 'Position, Mobility, Stability'],
          correctAnswer: 1,
          explanation: 'PMS stands for Pulse (circulation), Motor (nerve movement), and Sensory (nerve sensation).',
          skill: 'PMS Assessment'
        },
        {
          id: 'fx-b2',
          question: 'What is the "Two-Joint Rule" when splinting a long-bone fracture?',
          options: ['The splint must only touch two joints', 'The splint must immobilize the joint ABOVE and the joint BELOW the fracture site', 'Two rescuers must hold each joint', 'The victim must be able to bend both joints freely'],
          correctAnswer: 1,
          explanation: 'Immobilizing the joint above and below prevents muscular traction from displacing bone ends.',
          skill: 'Two-Joint Rule'
        },
        {
          id: 'fx-b3',
          question: 'When should PMS assessments be conducted during the splinting procedure?',
          options: ['Only before applying the splint', 'Only after the patient arrives at the hospital', 'Both BEFORE applying the splint and immediately AFTER securing the splint', 'Only if the patient screams'],
          correctAnswer: 2,
          explanation: 'Pre-check establishes baseline deficits; post-check confirms the splint has not cut off circulation or pinched nerves.',
          skill: 'PMS Timing'
        },
        {
          id: 'fx-b4',
          question: 'In what position should an injured extremity generally be splinted by a first responder?',
          options: ['In whatever position it is found, supporting it without forced straightening', 'Forced into full anatomical extension regardless of resistance', 'Bent at a sharp 90-degree angle', 'Dangling downward to increase blood flow'],
          correctAnswer: 0,
          explanation: 'Splinting in the position found avoids converting a closed fracture to an open one or severing nerves.',
          skill: 'Positioning'
        },
        {
          id: 'fx-b5',
          question: 'What should you do if an open fracture has a jagged bone end protruding through the skin?',
          options: ['Push the bone end back under the skin to keep it sterile', 'Cover the wound and protruding bone loosely with a sterile moist dressing, and splint around it without pushing the bone in', 'Wash the exposed bone vigorously with alcohol', 'Tie a tight tourniquet directly around the bone'],
          correctAnswer: 1,
          explanation: 'Never push protruding bone ends back into tissue; doing so introduces virulent bacteria deep into muscles.',
          skill: 'Open Fracture Management'
        }
      ],
      moderate: [
        {
          id: 'fx-m1',
          question: 'If you recheck PMS after applying a forearm splint and discover that the radial pulse is now absent and fingers are cold and pale, what is your immediate action?',
          options: ['Elevate the arm higher and wait 30 minutes', 'Loosen the securing bandage immediately until the distal pulse returns', 'Tighten the splint further to stop internal bleeding', 'Administer oral painkillers'],
          correctAnswer: 1,
          explanation: 'Loss of distal pulse indicates the bandage is too tight and causing acute arterial occlusion; loosen immediately.',
          skill: 'Distal Vascular Compromise'
        },
        {
          id: 'fx-m2',
          question: 'Under what specific circumstance may a trained first responder attempt gentle in-line traction/realignment of a severely deformed fracture?',
          options: ['Whenever the limb looks cosmetically abnormal', 'Only if the distal limb is pulseless, cyanotic, and cold (severely compromised circulation) and medical protocol authorizes a single attempt', 'Whenever the patient asks to straighten it', 'Never under any circumstances, even if pulseless'],
          correctAnswer: 1,
          explanation: 'A pulseless, ischemic limb threatens limb loss; a single gentle attempt to restore anatomical alignment may restore blood flow.',
          skill: 'In-Line Traction Indications'
        },
        {
          id: 'fx-m3',
          question: 'Why should soft padding be placed between a rigid splint and the patient skin, especially over bony prominences?',
          options: ['To make the splint heavier', 'To prevent focal pressure necrosis, skin breakdown, and relieve localized pain', 'To absorb perspiration so the splint does not slip', 'To keep the bone warm'],
          correctAnswer: 1,
          explanation: 'Unpadded rigid splints pressing against bony landmarks (malleoli, olecranon) cause pressure ulcers and severe nerve compression.',
          skill: 'Splint Padding'
        },
        {
          id: 'fx-m4',
          question: 'For a suspected fracture of the radius/ulna (mid-forearm), which two joints MUST be immobilized by the splint?',
          options: ['The shoulder and the neck', 'The elbow joint and the wrist joint', 'The fingers and the thumb only', 'The hip and the knee'],
          correctAnswer: 1,
          explanation: 'The forearm is bounded proximally by the elbow and distally by the wrist; both must be immobilized.',
          skill: 'Forearm Splint Anatomy'
        },
        {
          id: 'fx-m5',
          question: 'What is the purpose of elevating a splinted extremity slightly above the level of the heart (assuming spinal injury is ruled out and no compartment syndrome is suspected)?',
          options: ['To increase arterial blood pressure in the limb', 'To promote venous return and reduce inflammatory edema and throbbing pain', 'To prevent the patient from moving the limb', 'To stretch the muscles'],
          correctAnswer: 1,
          explanation: 'Elevation promotes gravitational venous and lymphatic drainage, minimizing painful swelling.',
          skill: 'Post-Splint Elevation'
        }
      ],
      advanced: [
        {
          id: 'fx-a1',
          question: 'What are the classic "6 Ps" signs and symptoms of acute traumatic Compartment Syndrome?',
          options: ['Pain out of proportion to injury, Pallor, Pulselessness, Paresthesia, Paralysis, and Poikilothermia', 'Pustules, Petechiae, Purpura, Pruritus, Palpitations, and Polyuria', 'Pressure, Perspiration, Phlebitis, Pyrexia, Prostration, and Pallor', 'Petechiae only'],
          correctAnswer: 0,
          explanation: 'The 6 Ps characterize tissue ischemia inside an osteofascial compartment: Pain (early/hallmark), Paresthesia, Pallor, Poikilothermia, Paralysis, Pulselessness (late).',
          skill: 'Compartment Syndrome'
        },
        {
          id: 'fx-a2',
          question: 'Why is "pain out of proportion to physical exam findings and pain on passive stretching of the distal digits" the most sensitive early clinical indicator of compartment syndrome?',
          options: ['Because bones have more pain receptors than muscles', 'Because sensory nerves within the tight fascial compartment become ischemic and hyperexcitable before arterial flow is completely extinguished', 'Because patients always exaggerate pain', 'Because tendons tear immediately'],
          correctAnswer: 1,
          explanation: 'Deep intracompartmental pressure compromises microvascular perfusion to nerve fibers first, creating excruciating ischemic stretch pain.',
          skill: 'Microvascular Ischemia'
        },
        {
          id: 'fx-a3',
          question: 'In a mid-shaft humeral fracture, which major peripheral nerve travels directly in the spiral groove against the bone and is at highest risk for entrapment or transection?',
          options: ['Median nerve', 'Ulnar nerve', 'Radial nerve (presenting as wrist drop)', 'Sciatic nerve'],
          correctAnswer: 2,
          explanation: 'The radial nerve wraps tightly around the mid-humerus in the radial groove; injury results in loss of wrist and finger extension ("wrist drop").',
          skill: 'Radial Nerve Neuropathy'
        },
        {
          id: 'fx-a4',
          question: 'What life-threatening metabolic and renal complication can occur when a severely crushed, entrapped limb is suddenly extricated after prolonged compression (Crush Syndrome)?',
          options: ['Massive release of myoglobin and potassium into systemic circulation, causing hyperkalemic cardiac arrest and acute tubular necrosis (kidney failure)', 'Hypercalcemia and alkalosis', 'Sudden systemic hypokalemia', 'Immediate diabetic ketoacidosis'],
          correctAnswer: 0,
          explanation: 'Rhabdomyolysis floods the circulation with toxic intracellular potassium, myoglobin, and acids upon reperfusion.',
          skill: 'Crush Syndrome Pathophysiology'
        },
        {
          id: 'fx-a5',
          question: 'What is the primary hemodynamic difference between a traction splint (e.g., Hare or Sager splint) and a rigid board splint when managing a mid-shaft femoral fracture?',
          options: ['Traction splints are only used for the upper arm', 'Traction restores anatomical length and alignment, counteracting strong quadriceps spasms, converting the thigh from a spherical hematoma space to a cylinder, thereby reducing occult internal hemorrhage by up to 1000 mL', 'Traction splints stop all blood flow to the foot', 'Traction splints are only applied in the operating room'],
          correctAnswer: 1,
          explanation: 'Femur fractures can bleed 1000–1500 mL into the thigh; restoring cylindrical geometry through traction creates tamponade and stops bleeding.',
          skill: 'Femoral Traction Biomechanics'
        }
      ]
    }
  }
];
