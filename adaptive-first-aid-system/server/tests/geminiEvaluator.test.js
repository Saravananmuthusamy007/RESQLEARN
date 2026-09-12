const { evaluatePracticalSimulation } = require('../services/geminiEvaluator');

describe('Clinical Telemetry & Gemini Evaluator Tests (Levels 1 to 5)', () => {
  test('Level 1 (CPR): Valid sequence, depth, and pacing achieves passing score & critique', async () => {
    const payload = {
      levelId: 1,
      actions: [
        { step: 'check_scene', target: 'environment', timestamp: 500, correct: true },
        { step: 'check_response', target: 'shoulders', timestamp: 1200, correct: true },
        { step: 'check_breathing', target: 'chest_rise', timestamp: 2500, correct: true },
        { step: 'call_emergency', target: 'phone_aed', timestamp: 4000, correct: true },
        { step: 'position_hands', target: 'sternum_hotspot', timestamp: 6000, correct: true },
        {
          step: 'chest_compressions',
          target: 'sternum_center',
          timestamp: 18000,
          correct: true,
          depthCm: '5.5',
          bpm: 110,
          cycleCount: 30,
          rhythmPacing: 'Perfect Rhythm (110 BPM)'
        }
      ],
      metrics: {
        totalResponseTime: 18.2,
        attempts: 1,
        sequenceErrors: 0,
        incorrectTargets: 0
      }
    };

    const result = await evaluatePracticalSimulation(payload);
    expect(result.passed).toBe(true);
    expect(result.compositeScore).toBeGreaterThanOrEqual(75);
    expect(result.clinicalCritique).toContain('CPR');
    expect(result.recommendedMCQDifficulty).toBe('advanced');
    expect(result.difficultyMix.hard).toBeGreaterThan(0.3);
  });

  test('Level 2 (Wound Care): Missing PPE flags weak area and provides remediation', async () => {
    const payload = {
      levelId: 2,
      actions: [
        { step: 'place_sterile_gauze', target: 'wound_site', timestamp: 1000, correct: true },
        { step: 'apply_direct_pressure', target: 'laceration', timestamp: 3000, correct: true },
        { step: 'secure_compression_bandage', target: 'wound_wrap', timestamp: 15000, correct: true, tightness: 'snug_non_constricting' }
      ],
      metrics: {
        totalResponseTime: 25.0,
        attempts: 1,
        sequenceErrors: 1,
        incorrectTargets: 1
      }
    };

    const result = await evaluatePracticalSimulation(payload);
    expect(result.weakAreas.some(w => w.includes('PPE') || w.includes('glove'))).toBe(true);
    expect(result.remediation.length).toBeGreaterThan(10);
  });

  test('Level 3 (Burns): Contraindicated home remedy (ice/butter) is flagged as critical error', async () => {
    const payload = {
      levelId: 3,
      actions: [
        { step: 'remove_hazard', target: 'heat_source', timestamp: 1000, correct: true },
        { step: 'contraindicated_remedy', target: 'Ice / Butter', timestamp: 2500, correct: false, flag: 'contraindicated_home_remedy' },
        { step: 'cool_running_water', target: 'running_water', timestamp: 8000, correct: true, durationMinutes: 15, timerAdherence: true },
        { step: 'apply_sterile_dressing', target: 'burn_surface', timestamp: 20000, correct: true, nonAdherent: true }
      ],
      metrics: {
        totalResponseTime: 32.0,
        attempts: 1,
        sequenceErrors: 1,
        incorrectTargets: 1
      }
    };

    const result = await evaluatePracticalSimulation(payload);
    expect(result.weakAreas.some(w => w.toLowerCase().includes('contraindicated') || w.toLowerCase().includes('ice'))).toBe(true);
  });

  test('Level 4 (Choking Response): Upward inward Heimlich vector and back blows evaluated', async () => {
    const payload = {
      levelId: 4,
      actions: [
        { step: 'verify_choking', target: 'airway_obstruction', timestamp: 1000, correct: true },
        { step: 'back_blows', target: 'interscapular_zone', timestamp: 4000, correct: true, count: 5 },
        {
          step: 'abdominal_thrusts',
          target: 'subdiaphragmatic',
          timestamp: 9000,
          correct: true,
          vector: 'upward_inward',
          vectorAccuracy: 95,
          force: 85,
          count: 5
        }
      ],
      metrics: {
        totalResponseTime: 12.5,
        attempts: 1,
        sequenceErrors: 0,
        incorrectTargets: 0
      }
    };

    const result = await evaluatePracticalSimulation(payload);
    expect(result.passed).toBe(true);
    expect(result.compositeScore).toBeGreaterThanOrEqual(85);
  });

  test('Level 5 (Fracture & Sprain): Joint above & below splinting with pulse CSM verification', async () => {
    const payload = {
      levelId: 5,
      actions: [
        { step: 'position_splint', target: 'joints_above_and_below', timestamp: 2000, correct: true, aligned: true },
        { step: 'secure_proximal_binding', target: 'proximal_joint_elbow', timestamp: 5000, correct: true, nonConstrictive: true },
        { step: 'secure_distal_binding', target: 'distal_joint_wrist', timestamp: 8000, correct: true, nonConstrictive: true },
        { step: 'check_circulation', target: 'radial_pulse_csm', timestamp: 12000, correct: true, capillaryRefill: '<2s' }
      ],
      metrics: {
        totalResponseTime: 16.0,
        attempts: 1,
        sequenceErrors: 0,
        incorrectTargets: 0
      }
    };

    const result = await evaluatePracticalSimulation(payload);
    expect(result.passed).toBe(true);
    expect(result.clinicalCritique).toContain('musculoskeletal');
  });

  test('Threshold Enforcement: Sub-threshold simulation triggers failure and remediation', async () => {
    const payload = {
      levelId: 1,
      actions: [
        { step: 'chest_compressions', target: 'wrong_target', timestamp: 5000, correct: false }
      ],
      metrics: {
        totalResponseTime: 75.0,
        attempts: 3,
        sequenceErrors: 3,
        incorrectTargets: 3
      },
      level: { practicalThreshold: 75 }
    };

    const result = await evaluatePracticalSimulation(payload);
    expect(result.passed).toBe(false);
    expect(result.compositeScore).toBeLessThan(75);
    expect(result.remediation.length).toBeGreaterThan(15);
    expect(result.recommendedMCQDifficulty).toBe('foundational');
    expect(result.difficultyMix.easy).toBeGreaterThanOrEqual(0.6);
  });
});
