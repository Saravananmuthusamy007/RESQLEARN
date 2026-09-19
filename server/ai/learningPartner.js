import { chatWithGeminiPartner } from './geminiService.js';

// Comprehensive offline clinical first-aid knowledge base for zero-downtime responses
const CLINICAL_KNOWLEDGE_BASE = [
  {
    keywords: ['cpr', 'chest compression', 'heart attack', 'cardiac', 'bpm', 'recoil'],
    response: `**Cardiopulmonary Resuscitation (CPR) Protocol:**
• **Compression Rate:** 100–120 compressions per minute.
• **Depth:** 5.0 to 6.0 cm (2.0 to 2.4 inches) on the lower half of the sternum.
• **Chest Recoil:** Allow 100% full recoil between compressions; do not lean on the chest.
• **Ratio:** 30 chest compressions followed by 2 gentle rescue breaths (1 sec each with head-tilt/chin-lift).
• **AED:** Turn on immediately upon arrival and attach pads (upper right chest, lower left ribs).`
  },
  {
    keywords: ['bleeding', 'hemorrhage', 'tourniquet', 'pressure', 'wound', 'cat'],
    response: `**Severe Hemorrhage Control Protocol:**
• **1. PPE:** Always wear nitrile gloves before touching blood.
• **2. Direct Pressure:** Apply firm manual downward force (40–60 N) with sterile gauze immediately.
• **3. Wound Packing:** For deep junctional or extremity wounds, pack hemostatic gauze tightly into the base of the cavity.
• **4. Tourniquet:** Apply a CAT tourniquet 5–7 cm (2–3 inches) proximal to the wound (never over a joint).
• **5. Windlass:** Tighten until arterial spurting stops and distal pulse disappears. Lock into clip.
• **6. Timestamp:** Always record the exact application time on the time strap.`
  },
  {
    keywords: ['burn', 'scald', 'thermal', 'water', 'ice', 'blister'],
    response: `**Thermal Burn Stabilization Protocol:**
• **1. Safety:** Stop the burning process immediately and remove heat contact.
• **2. Cool Water:** Irrigate with cool running water at **15–20°C for 10–20 minutes**.
• **3. Constrictions:** Remove rings, watches, and tight clothing early before tissue edema develops.
• **4. Sterile Cover:** Dress loosely with dry, sterile, non-adherent sheets or clean plastic wrap.
• **5. CRITICAL WARNINGS:** NEVER apply ice (causes severe vasoconstriction and frostbite) or butter/grease (traps heat and causes infection). Never pop intact blisters.`
  },
  {
    keywords: ['choking', 'heimlich', 'airway', 'back blow', 'thrust', 'obstruction'],
    response: `**Foreign Body Airway Obstruction (Choking) Protocol:**
• **1. Assess Severity:** If coughing forcefully and speaking, encourage coughing. If silent cough or unable to speak, intervene immediately.
• **2. Positioning:** Lean the victim forward and support the chest with one hand.
• **3. 5 Back Blows:** Deliver 5 sharp blows between the shoulder blades using the heel of your hand.
• **4. 5 Abdominal Thrusts:** Stand behind, place fist slightly above the navel, and pull inward and upward sharply.
• **5. Unconscious Transition:** If victim becomes unresponsive, lower to the floor and start modified CPR immediately. Look in mouth before breaths; NO blind finger sweeps.`
  },
  {
    keywords: ['fracture', 'splint', 'pms', 'broken bone', 'joint', 'arm', 'leg'],
    response: `**Musculoskeletal Fracture Splinting Protocol:**
• **1. Support:** Stabilize the limb in the position found without forceful realignment.
• **2. Pre-Splint PMS:** Check distal **Pulse** (radial/pedal), **Motor** (finger/toe wiggle), and **Sensory** (touch feeling).
• **3. Two-Joint Rule:** The splint MUST immobilize the joint ABOVE and the joint BELOW the fracture.
• **4. Pad Splint:** Pad all rigid surfaces, especially over bony prominences.
• **5. Safe Tension:** Secure straps snugly without cutting off circulation.
• **6. Post-Splint PMS:** Recheck Pulse, Motor, and Sensory immediately. If pulse is lost, loosen straps at once!`
  },
  {
    keywords: ['certificate', 'certification', 'score', 'pass', 'verify'],
    response: `**ResqLearn Certification Requirements:**
• You must achieve at least **75%** on the practical simulation to unlock the theoretical assessment.
• You must score at least **70%** on the adaptive MCQ assessment to pass the level.
• Complete all **5 Emergency Levels** to automatically earn the **First-Aid & BLS Clinical Competency Certificate**.
• Each certificate includes a unique verification ID and a tamper-evident SHA-256 cryptographic hash.`
  }
];

export async function processPartnerMessage({ message, history = [], userRole = 'learner', platformContext = {} }) {
  // 1. Attempt Gemini 2.5 Flash
  const geminiResponse = await chatWithGeminiPartner({
    message,
    history,
    userRole,
    platformContext,
  });

  if (geminiResponse) {
    return {
      text: geminiResponse,
      source: 'gemini-2.5-flash',
    };
  }

  // 2. Intelligent Knowledge-Base Fallback Matcher
  const lowerMsg = message.toLowerCase();
  for (const item of CLINICAL_KNOWLEDGE_BASE) {
    if (item.keywords.some(k => lowerMsg.includes(k))) {
      return {
        text: item.response + `\n\n*(Note: ResqLearn Clinical Educational Knowledge Base)*`,
        source: 'clinical-knowledge-base',
      };
    }
  }

  // Default fallback if no keyword match
  return {
    text: `Hello! I am your ResqLearn Emergency Simulation Partner. 
I can help guide you through the 5 BLS emergency modules:
1. **CPR & AED Operations**
2. **Severe Hemorrhage & CAT Tourniquet Application**
3. **Thermal Burn Stabilization & Cooling**
4. **Choking & Airway Obstruction Relief**
5. **Musculoskeletal Fracture Splinting**

Ask me any question regarding procedures, target thresholds, or BLS principles!`,
    source: 'clinical-knowledge-base',
  };
}

export default {
  processPartnerMessage,
};
