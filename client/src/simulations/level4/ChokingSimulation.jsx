import React, { useState } from 'react';
import { AlertCircle, ArrowUp, ArrowDown, Activity, HeartHandshake, CheckCircle } from 'lucide-react';

export const ChokingSimulation = ({ step, onAction, onStepComplete }) => {
  // Step 1: Assess Severity
  const [severityAssessed, setSeverityAssessed] = useState(false);

  // Step 2: Position
  const [isLeanedForward, setIsLeanedForward] = useState(false);

  // Step 3: 5 Back Blows
  const [backBlowsCount, setBackBlowsCount] = useState(0);

  // Step 4: 5 Upward Abdominal Thrusts (Heimlich)
  const [thrustsCount, setThrustsCount] = useState(0);

  // Step 5: Reassess Airway
  const [airwayChecked, setAirwayChecked] = useState(false);

  // Step 6: Unconscious Transition to CPR
  const [loweredToFloor, setLoweredToFloor] = useState(false);
  const [cprStarted, setCprStarted] = useState(false);

  // STEP 1 HANDLER
  const handleAssessSeverity = () => {
    setSeverityAssessed(true);
    onAction({
      eventType: 'choking_severity_assessment',
      target: 'choking_victim',
      action: 'verbal_triage',
      accuracy: 100,
      feedback: { type: 'success', message: 'Severe obstruction confirmed: Unable to speak or cough. Cyanosis noted.' }
    });
    setTimeout(() => onStepComplete(), 600);
  };

  // STEP 2: Position Forward
  const handlePositionForward = () => {
    setIsLeanedForward(true);
    onAction({
      eventType: 'patient_positioning',
      target: 'chest_support',
      action: 'lean_forward',
      accuracy: 100,
      feedback: { type: 'success', message: 'Victim supported and leaned forward so gravity assists object ejection.' }
    });
    setTimeout(() => onStepComplete(), 600);
  };

  // STEP 3: 5 Back Blows
  const handleDeliverBackBlow = () => {
    const nextCount = backBlowsCount + 1;
    setBackBlowsCount(nextCount);

    onAction({
      eventType: 'back_blow',
      target: 'interscapular_zone',
      action: 'heel_strike',
      accuracy: 100,
      techniqueData: { stroke: nextCount },
      feedback: { type: 'success', message: `Firm Back Blow ${nextCount}/5 delivered between shoulder blades.` }
    });

    if (nextCount >= 5) {
      setTimeout(() => onStepComplete(), 600);
    }
  };

  // STEP 4: 5 Upward Abdominal Thrusts (Heimlich)
  const handleDeliverThrust = () => {
    const nextCount = thrustsCount + 1;
    setThrustsCount(nextCount);

    onAction({
      eventType: 'abdominal_thrust',
      target: 'subdiaphragmatic_navel',
      action: 'inward_upward_pull',
      accuracy: 100,
      techniqueData: { thrustNumber: nextCount, vector: 'inward_upward' },
      feedback: { type: 'success', message: `Heimlich Thrust ${nextCount}/5 delivered: Inward & upward above navel.` }
    });

    if (nextCount >= 5) {
      setTimeout(() => onStepComplete(), 600);
    }
  };

  // STEP 5: Airway Reassessment
  const handleReassessAirway = () => {
    setAirwayChecked(true);
    onAction({
      eventType: 'airway_reassessment',
      target: 'oral_airway',
      action: 'visual_inspection',
      accuracy: 100,
      feedback: { type: 'warning', message: 'Foreign body still lodged. Victim is becoming limp and unresponsive.' }
    });
    setTimeout(() => onStepComplete(), 600);
  };

  // STEP 6: Unconscious CPR Transition
  const handleLowerToFloor = () => {
    setLoweredToFloor(true);
    onAction({
      eventType: 'unconscious_transition',
      target: 'supine_position',
      action: 'supportive_descent',
      accuracy: 100,
      feedback: { type: 'success', message: 'Patient safely eased to floor in supine position.' }
    });
  };

  const handleStartModifiedCpr = () => {
    setCprStarted(true);
    onAction({
      eventType: 'modified_cpr_start',
      target: 'chest_compressions',
      action: 'start_30_compressions',
      accuracy: 100,
      feedback: { type: 'success', message: 'Started modified CPR! High intrathoracic pressure dislodges object.' }
    });
    setTimeout(() => onStepComplete(), 600);
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
      {/* STEP 1: Assess Severity */}
      {step === 1 && (
        <div className="w-full text-center space-y-6">
          <div className="text-sm text-cyan-400 font-mono">AIRWAY OBSTRUCTION SEVERITY TRIAGE</div>
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex flex-col items-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 animate-pulse" />
            <div className="text-xs text-slate-300">
              Person clutching neck (universal sign). Silent coughing, unable to vocalize or inhale.
            </div>
            <button
              onClick={handleAssessSeverity}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              {severityAssessed ? 'Severe Obstruction Triage Confirmed ✓' : 'Assess: "Are you choking? Can you speak?"'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Position Forward */}
      {step === 2 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">PATIENT LEAN-FORWARD POSITIONING</div>
          <p className="text-xs text-slate-300">
            Support the victim chest with one arm and lean them forward so gravity assists foreign body expulsion.
          </p>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex flex-col items-center space-y-4">
            <ArrowDown className="w-12 h-12 text-cyan-400" />
            <button
              onClick={handlePositionForward}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              {isLeanedForward ? 'Positioned Forward with Chest Support ✓' : 'Support Chest & Lean Patient Well Forward'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: 5 Back Blows */}
      {step === 3 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">5 SHARP INTERSCAPULAR BACK BLOWS</div>
          <p className="text-xs text-slate-300">
            Strike firmly between the shoulder blades with the heel of your hand (<strong>5 Blows</strong>).
          </p>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex flex-col items-center space-y-4">
            <div className="w-40 h-40 rounded-full border-4 border-cyan-500/50 bg-slate-900 flex flex-col items-center justify-center p-3">
              <span className="text-xs font-mono text-slate-400">Back Blows:</span>
              <span className="text-3xl font-extrabold font-mono text-white mt-1">
                {backBlowsCount} / 5
              </span>
            </div>

            <button
              onClick={handleDeliverBackBlow}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              STRIKE HEEL OF HAND BETWEEN SHOULDER BLADES
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: 5 Abdominal Thrusts (Heimlich) */}
      {step === 4 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">5 UPWARD ABDOMINAL THRUSTS (HEIMLICH)</div>
          <p className="text-xs text-slate-300">
            Place fist slightly above the navel (below xiphoid). Pull inward and upward with sharp force.
          </p>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex flex-col items-center space-y-4">
            <div className="w-40 h-40 rounded-full border-4 border-rose-500/50 bg-slate-900 flex flex-col items-center justify-center p-3">
              <span className="text-xs font-mono text-slate-400">Abdominal Thrusts:</span>
              <span className="text-3xl font-extrabold font-mono text-white mt-1">
                {thrustsCount} / 5
              </span>
            </div>

            <button
              onClick={handleDeliverThrust}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all font-mono"
            >
              <ArrowUp className="w-5 h-5" />
              <span>PULL INWARD & UPWARD ABOVE NAVEL</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Reassess Airway */}
      {step === 5 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">AIRWAY STATUS REASSESSMENT</div>
          <p className="text-xs text-slate-300">
            Evaluate if foreign object has been expelled or if victim respiratory efforts remain completely blocked.
          </p>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex flex-col items-center space-y-4">
            <Activity className="w-12 h-12 text-amber-400 animate-pulse" />
            <button
              onClick={handleReassessAirway}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              {airwayChecked ? 'Airway Reassessed: Obstruction Persists ✓' : 'Inspect Oral Airway & Breathing Status'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Unconscious CPR Transition */}
      {step === 6 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">UNCONSCIOUS PATIENT TRANSITION TO MODIFIED CPR</div>
          <p className="text-xs text-slate-300">
            Victim has lost consciousness. Ease safely to the floor and initiate modified CPR immediately (No blind finger sweeps!).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={handleLowerToFloor}
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                loweredToFloor
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              <HeartHandshake className="w-8 h-8 text-cyan-400" />
              <span className="font-bold text-sm">
                {loweredToFloor ? 'Lowered to Supine Position ✓' : '1. Ease Patient to Floor'}
              </span>
            </button>

            <button
              onClick={handleStartModifiedCpr}
              disabled={!loweredToFloor}
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                !loweredToFloor
                  ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                  : cprStarted
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                  : 'bg-rose-600 hover:bg-rose-500 border-rose-500 text-white'
              }`}
            >
              <CheckCircle className="w-8 h-8 text-rose-200" />
              <span className="font-bold text-sm">
                {cprStarted ? 'Modified CPR Active ✓' : '2. Start 30 Compressions'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChokingSimulation;
