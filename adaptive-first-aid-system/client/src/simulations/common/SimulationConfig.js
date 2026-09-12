// SimulationConfig.js - Weighted score config, level definitions, and thresholds

export const SCORING_WEIGHTS = {
  actionCorrectness: 0.30,
  targetAccuracy: 0.25,
  sequenceAccuracy: 0.20,
  responseTime: 0.15,
  attemptEfficiency: 0.10
};

export const PRACTICAL_THRESHOLD = 75; // Default pass threshold 75%

export const LEVEL_SIMULATION_CONFIGS = {
  1: {
    levelId: 1,
    title: 'Level 1 – CPR & Response Check',
    procedureName: 'Cardiopulmonary Resuscitation (CPR)',
    totalSteps: 7,
    expectedSequence: [
      'OBSERVE_VICTIM',
      'CHECK_RESPONSIVENESS',
      'CHECK_BREATHING',
      'CALL_EMERGENCY',
      'POSITION_HANDS',
      'CHEST_COMPRESSIONS',
      'COMPLETE'
    ],
    targetZones: {
      chest: { x: 0.5, y: 0.52, radius: 45, label: 'Sternum (Lower Half)' }
    },
    requiredCompressions: 30,
    targetBpmRange: [100, 120]
  },
  2: {
    levelId: 2,
    title: 'Level 2 – Wound Care & Bleeding Control',
    procedureName: 'Severe Bleeding & Hemorrhage Control',
    totalSteps: 7,
    expectedSequence: [
      'IDENTIFY_BLEEDING',
      'WEAR_PPE',
      'SELECT_DRESSING',
      'APPLY_DIRECT_PRESSURE',
      'MAINTAIN_PRESSURE',
      'ADD_BANDAGE',
      'COMPLETE'
    ],
    targetZones: {
      wound: { x: 0.52, y: 0.48, radius: 40, label: 'Bleeding Wound Site' }
    },
    requiredPressureDurationSec: 10
  },
  3: {
    levelId: 3,
    title: 'Level 3 – Burns Management',
    procedureName: 'Thermal Burn Response & Cooling',
    totalSteps: 7,
    expectedSequence: [
      'IDENTIFY_BURN',
      'REMOVE_HAZARD',
      'COOL_BURN_AREA',
      'SELECT_COOLING_METHOD',
      'MONITOR_COOLING',
      'APPLY_STERILE_DRESSING',
      'COMPLETE'
    ],
    targetZones: {
      burn: { x: 0.5, y: 0.5, radius: 45, label: 'Affected Burn Zone' }
    },
    requiredCoolingDurationSec: 10,
    forbiddenActions: ['APPLY_ICE', 'APPLY_BUTTER', 'POKE_BLISTERS']
  },
  4: {
    levelId: 4,
    title: 'Level 4 – Choking Response',
    procedureName: 'Airway Obstruction & Heimlich Maneuver',
    totalSteps: 6,
    expectedSequence: [
      'IDENTIFY_CHOKING',
      'ASSESS_SEVERITY',
      'ENCOURAGE_COUGH',
      'PERFORM_BACK_BLOWS',
      'PERFORM_ABDOMINAL_THRUSTS',
      'COMPLETE'
    ],
    targetZones: {
      upperBack: { x: 0.5, y: 0.4, radius: 40, label: 'Between Shoulder Blades' },
      abdomen: { x: 0.5, y: 0.54, radius: 40, label: 'Above Navel, Below Ribcage' }
    },
    requiredBackBlows: 5,
    requiredAbdominalThrusts: 5
  },
  5: {
    levelId: 5,
    title: 'Level 5 – Fracture & Sprain Support',
    procedureName: 'Limb Fracture & Splint Immobilization',
    totalSteps: 7,
    expectedSequence: [
      'IDENTIFY_FRACTURE',
      'IMMOBILIZE_LIMB',
      'SELECT_SPLINT',
      'POSITION_SPLINT',
      'SECURE_BANDAGES',
      'CHECK_CIRCULATION',
      'COMPLETE'
    ],
    targetZones: {
      limb: { x: 0.55, y: 0.55, width: 140, height: 60, label: 'Injured Arm/Leg Target Area' }
    }
  }
};
