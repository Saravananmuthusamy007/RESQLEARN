import React, { useState } from 'react';
import { Hand, Activity, CheckCircle2, Sliders, Maximize2, AlertTriangle } from 'lucide-react';

export const SplintingSimulation = ({ step, onAction, onStepComplete }) => {
  // Step 1: Support
  const [limbSupported, setLimbSupported] = useState(false);

  // Step 2: Pre-Splint PMS
  const [prePulseChecked, setPrePulseChecked] = useState(false);
  const [preMotorChecked, setPreMotorChecked] = useState(false);
  const [preSensoryChecked, setPreSensoryChecked] = useState(false);

  // Step 3: Splint selection
  const [splintSelected, setSplintSelected] = useState(false);

  // Step 4: Two-Joint Rule
  const [jointAboveLocked, setJointAboveLocked] = useState(false);
  const [jointBelowLocked, setJointBelowLocked] = useState(false);

  // Step 5: Strap Tension (Target 50-75%)
  const [strapTension, setStrapTension] = useState(60);
  const [strapsSecured, setStrapsSecured] = useState(false);

  // Step 6: Post-Splint PMS
  const [postPulseChecked, setPostPulseChecked] = useState(false);
  const [postMotorChecked, setPostMotorChecked] = useState(false);
  const [postSensoryChecked, setPostSensoryChecked] = useState(false);

  // STEP 1 HANDLER
  const handleSupportLimb = () => {
    setLimbSupported(true);
    onAction({
      eventType: 'limb_stabilization',
      target: 'forearm_fracture',
      action: 'support_position_found',
      accuracy: 100,
      feedback: { type: 'success', message: 'Limb supported in position found. Jagged bone ends stabilized.' }
    });
    setTimeout(() => onStepComplete(), 600);
  };

  // STEP 2: Pre-Splint PMS
  const handleCheckPrePms = (component) => {
    let p = prePulseChecked, m = preMotorChecked, s = preSensoryChecked;
    if (component === 'pulse') p = true;
    if (component === 'motor') m = true;
    if (component === 'sensory') s = true;

    setPrePulseChecked(p);
    setPreMotorChecked(m);
    setPreSensoryChecked(s);

    onAction({
      eventType: 'pre_splint_pms',
      target: `distal_${component}`,
      action: 'check',
      accuracy: 100,
      feedback: { type: 'success', message: `Pre-splint ${component.toUpperCase()} verified: Intact baseline.` }
    });

    if (p && m && s) {
      setTimeout(() => onStepComplete(), 600);
    }
  };

  // STEP 3: Splint selection
  const handleSelectSplint = () => {
    setSplintSelected(true);
    onAction({
      eventType: 'splint_selection',
      target: 'sam_padded_splint',
      action: 'contour_and_pad',
      accuracy: 100,
      feedback: { type: 'success', message: 'Padded rigid splint shaped and contoured to extremity.' }
    });
    setTimeout(() => onStepComplete(), 600);
  };

  // STEP 4: Two-Joint Rule
  const handleLockJoint = (joint) => {
    let above = jointAboveLocked, below = jointBelowLocked;
    if (joint === 'above') above = true;
    if (joint === 'below') below = true;

    setJointAboveLocked(above);
    setJointBelowLocked(below);

    onAction({
      eventType: 'two_joint_immobilization',
      target: `joint_${joint}`,
      action: 'span_and_stabilize',
      accuracy: 100,
      feedback: { type: 'success', message: `Joint ${joint.toUpperCase()} immobilized. Bone displacement prevented.` }
    });

    if (above && below) {
      setTimeout(() => onStepComplete(), 600);
    }
  };

  // STEP 5: Strap Tension
  const handleTensionChange = (e) => {
    setStrapTension(Number(e.target.value));
  };

  const handleSecureStraps = () => {
    setStrapsSecured(true);
    const isOptimal = strapTension >= 50 && strapTension <= 75;
    const isTooTight = strapTension > 85;

    onAction({
      eventType: 'splint_strap_tensioning',
      target: 'elastic_straps',
      action: 'fasten',
      accuracy: isOptimal ? 100 : isTooTight ? 35 : 70,
      techniqueData: { tensionPercent: strapTension },
      isCriticalError: isTooTight,
      errorMessage: isTooTight ? 'Straps excessively tight! Cut off distal microcirculation.' : '',
      feedback: isOptimal
        ? { type: 'success', message: `Straps secured at ${strapTension}% safe physiological tension.` }
        : isTooTight
        ? { type: 'error', message: 'CRITICAL ERROR: Bandage too tight! Occluding arterial blood flow.' }
        : { type: 'warning', message: 'Straps a bit loose. Ensure firm stabilization.' }
    });

    setTimeout(() => onStepComplete(), 600);
  };

  // STEP 6: Post-Splint PMS
  const handleCheckPostPms = (component) => {
    let p = postPulseChecked, m = postMotorChecked, s = postSensoryChecked;
    if (component === 'pulse') p = true;
    if (component === 'motor') m = true;
    if (component === 'sensory') s = true;

    setPostPulseChecked(p);
    setPostMotorChecked(m);
    setPostSensoryChecked(s);

    onAction({
      eventType: 'post_splint_pms',
      target: `post_distal_${component}`,
      action: 'recheck',
      accuracy: 100,
      feedback: { type: 'success', message: `Post-splint ${component.toUpperCase()} confirmed intact: Distal circulation preserved.` }
    });

    if (p && m && s) {
      setTimeout(() => onStepComplete(), 600);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
      {/* STEP 1: Support in Position Found */}
      {step === 1 && (
        <div className="w-full text-center space-y-6">
          <div className="text-sm text-cyan-400 font-mono">SUPPORT EXTREMITY IN POSITION FOUND</div>
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex flex-col items-center space-y-4">
            <Hand className="w-12 h-12 text-cyan-400 animate-pulse" />
            <div className="text-xs text-slate-300">
              Closed forearm fracture with deformity. Manually support the limb with gentle hands above and below the site. Do NOT attempt realignment!
            </div>
            <button
              onClick={handleSupportLimb}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              {limbSupported ? 'Extremity Manually Supported ✓' : 'Manually Support Limb in Position Found'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Pre-Splint PMS */}
      {step === 2 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">PRE-SPLINT NEUROVASCULAR ASSESSMENT (PMS)</div>
          <p className="text-xs text-slate-300">
            Document baseline distal neurovascular status by checking Pulse, Motor, and Sensation:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
            <button
              onClick={() => handleCheckPrePms('pulse')}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${
                prePulseChecked
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              {prePulseChecked ? '✓ Radial Pulse Present' : '1. Check Radial Pulse'}
            </button>

            <button
              onClick={() => handleCheckPrePms('motor')}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${
                preMotorChecked
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              {preMotorChecked ? '✓ Motor: Wiggle Fingers' : '2. Motor: Wiggle Fingers'}
            </button>

            <button
              onClick={() => handleCheckPrePms('sensory')}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${
                preSensoryChecked
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              {preSensoryChecked ? '✓ Sensation Intact' : '3. Sensory: Light Touch'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Select & Shape Splint */}
      {step === 3 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">SELECT & CONTOUR PADDED SPLINT</div>
          <p className="text-xs text-slate-300">
            Select a rigid/SAM splint of appropriate length to span past both adjacent joints. Pad over bony prominences.
          </p>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex flex-col items-center space-y-4">
            <Maximize2 className="w-12 h-12 text-cyan-400" />
            <button
              onClick={handleSelectSplint}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              {splintSelected ? 'Padded Splint Positioned ✓' : 'Select Padded Splint & Pad Bony Contours'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Two-Joint Rule */}
      {step === 4 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">TWO-JOINT IMMOBILIZATION MANDATE</div>
          <p className="text-xs text-slate-300">
            For long-bone forearm fractures, you MUST immobilize both the joint ABOVE (elbow) and joint BELOW (wrist):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={() => handleLockJoint('above')}
              className={`p-5 rounded-2xl border text-sm font-bold transition-all ${
                jointAboveLocked
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              {jointAboveLocked ? '✓ Elbow Joint Immobilized' : '1. Immobilize Joint Above (Elbow)'}
            </button>

            <button
              onClick={() => handleLockJoint('below')}
              className={`p-5 rounded-2xl border text-sm font-bold transition-all ${
                jointBelowLocked
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              {jointBelowLocked ? '✓ Wrist Joint Immobilized' : '2. Immobilize Joint Below (Wrist)'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Strap Tension Gauge */}
      {step === 5 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">SECURE STRAPS: PHYSIOLOGICAL TENSION (50–75%)</div>
          <p className="text-xs text-slate-300">
            Adjust strap tightness. Snug enough to prevent joint motion, but NEVER tight enough to compromise distal perfusion.
          </p>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-400">Strap Tension:</span>
                <span className={`font-bold ${strapTension >= 50 && strapTension <= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {strapTension}% {strapTension >= 50 && strapTension <= 75 ? '(Optimal Snug)' : strapTension > 85 ? '(TOO TIGHT - TOURNIQUET EFFECT!)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={strapTension}
                onChange={handleTensionChange}
                className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>20% (Loose)</span>
                <span className="text-emerald-400 font-bold">50–75% Ideal</span>
                <span className="text-rose-400 font-bold">100% (Arterial Occlusion)</span>
              </div>
            </div>

            <button
              onClick={handleSecureStraps}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              {strapsSecured ? 'Straps Fastened at Selected Tension ✓' : 'Fasten Splint Bandages & Straps'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Post-Splint PMS Reassessment */}
      {step === 6 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">POST-SPLINT PMS REASSESSMENT</div>
          <p className="text-xs text-slate-300">
            Verify distal Pulse, Motor, and Sensory immediately after splinting to guarantee circulation was not impaired:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
            <button
              onClick={() => handleCheckPostPms('pulse')}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${
                postPulseChecked
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              {postPulseChecked ? '✓ Radial Pulse Strong' : '1. Recheck Radial Pulse'}
            </button>

            <button
              onClick={() => handleCheckPostPms('motor')}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${
                postMotorChecked
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              {postMotorChecked ? '✓ Motor Intact' : '2. Recheck Motor Movement'}
            </button>

            <button
              onClick={() => handleCheckPostPms('sensory')}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${
                postSensoryChecked
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              {postSensoryChecked ? '✓ Sensation Verified' : '3. Recheck Digit Sensation'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplintingSimulation;
