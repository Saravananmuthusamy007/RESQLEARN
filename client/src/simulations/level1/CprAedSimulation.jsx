import React, { useState, useEffect, useRef } from 'react';
import { Heart, Activity, PhoneCall, Radio, Zap, Wind } from 'lucide-react';

export const CprAedSimulation = ({ step, onAction, onStepComplete }) => {
  // Step 1 state: Responsiveness
  const [tappedShoulders, setTappedShoulders] = useState(false);
  const [shouted, setShouted] = useState(false);

  // Step 2 state: EMS
  const [emsCalled, setEmsCalled] = useState(false);
  const [aedRequested, setAedRequested] = useState(false);

  // Step 3 state: Pulse Check
  const [pulseHoldStart, setPulseHoldStart] = useState(null);
  const [pulseProgress, setPulseProgress] = useState(0);

  // Step 4 state: Hand placement
  const [selectedTarget, setSelectedTarget] = useState(null);

  // Step 5 state: 30 Compressions (100-120 BPM, 5-6 cm depth, recoil)
  const [compressionsCount, setCompressionsCount] = useState(0);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [isRecoiled, setIsRecoiled] = useState(true);
  const [metronomeBpm, setMetronomeBpm] = useState(110);
  const [beatPhase, setBeatPhase] = useState(false);
  const [lastCompressionTime, setLastCompressionTime] = useState(null);
  const [measuredBpm, setMeasuredBpm] = useState(110);

  // Step 6 state: Rescue breaths
  const [headTiltActive, setHeadTiltActive] = useState(false);
  const [breathsDelivered, setBreathsDelivered] = useState(0);

  // Metronome visual ticker (110 BPM = ~545ms per beat)
  useEffect(() => {
    if (step !== 5) return;
    const intervalMs = Math.round(60000 / metronomeBpm);
    const interval = setInterval(() => {
      setBeatPhase(prev => !prev);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [step, metronomeBpm]);

  // STEP 1 HANDLERS
  const handleTapShoulder = () => {
    setTappedShoulders(true);
    onAction({
      eventType: 'shoulder_tap',
      target: 'victim_shoulders',
      action: 'tap',
      accuracy: 100,
      feedback: { type: 'success', message: 'Shoulders firmly tapped. Check response.' }
    });
  };

  const handleShout = () => {
    setShouted(true);
    onAction({
      eventType: 'verbal_shout',
      target: 'verbal_response',
      action: 'shout',
      accuracy: 100,
      feedback: { type: 'success', message: 'Victim is unresponsive to voice.' }
    });
    setTimeout(() => onStepComplete(), 600);
  };

  // STEP 2 HANDLERS
  const handleEmsCall = () => {
    setEmsCalled(true);
    onAction({
      eventType: 'ems_dispatch',
      target: '911_dispatch',
      action: 'call',
      accuracy: 100,
      feedback: { type: 'success', message: 'EMS Dispatch notified.' }
    });
  };

  const handleAedRequest = () => {
    setAedRequested(true);
    onAction({
      eventType: 'aed_requested',
      target: 'aed_unit',
      action: 'request',
      accuracy: 100,
      feedback: { type: 'success', message: 'AED requested from bystander.' }
    });
    setTimeout(() => onStepComplete(), 600);
  };

  // STEP 3: Pulse Check (Hold 5-10s)
  const handlePulseMouseDown = () => {
    setPulseHoldStart(Date.now());
  };

  const handlePulseMouseUp = () => {
    if (!pulseHoldStart) return;
    const holdDurationMs = Date.now() - pulseHoldStart;
    setPulseHoldStart(null);
    setPulseProgress(0);

    if (holdDurationMs >= 5000 && holdDurationMs <= 10000) {
      onAction({
        eventType: 'carotid_pulse_check',
        target: 'carotid_artery',
        action: 'palpation',
        accuracy: 95,
        techniqueData: { durationMs: holdDurationMs },
        feedback: { type: 'success', message: 'Accurate pulse check (5–10s window). No pulse detected.' }
      });
      setTimeout(() => onStepComplete(), 600);
    } else if (holdDurationMs > 10000) {
      onAction({
        eventType: 'carotid_pulse_check',
        target: 'carotid_artery',
        action: 'palpation',
        accuracy: 60,
        isMistake: true,
        errorMessage: 'Pulse check exceeded 10 seconds. Compressions delayed.',
        feedback: { type: 'warning', message: 'Pulse check exceeded 10 seconds. Do not delay CPR!' }
      });
      setTimeout(() => onStepComplete(), 600);
    } else {
      onAction({
        eventType: 'carotid_pulse_check',
        target: 'carotid_artery',
        action: 'palpation',
        accuracy: 50,
        isMistake: true,
        feedback: { type: 'warning', message: 'Held for <5 seconds. Inadequate check.' }
      });
    }
  };

  // Pulse progress timer
  useEffect(() => {
    if (!pulseHoldStart) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - pulseHoldStart;
      const pct = Math.min(100, (elapsed / 6000) * 100);
      setPulseProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [pulseHoldStart]);

  // STEP 4: Hand position target
  const handleSelectPosition = (targetKey) => {
    setSelectedTarget(targetKey);
    if (targetKey === 'lower_sternum') {
      onAction({
        eventType: 'hand_placement',
        target: targetKey,
        action: 'interlocked_palms',
        accuracy: 100,
        feedback: { type: 'success', message: 'Correct! Center of chest, lower half of sternum.' }
      });
      setTimeout(() => onStepComplete(), 600);
    } else if (targetKey === 'xiphoid') {
      onAction({
        eventType: 'hand_placement',
        target: targetKey,
        action: 'misplaced',
        accuracy: 20,
        isCriticalError: true,
        errorMessage: 'Hand placed over xiphoid process / liver hazard.',
        feedback: { type: 'error', message: 'CRITICAL ERROR: Over xiphoid process! Risk of liver laceration.' }
      });
    } else {
      onAction({
        eventType: 'hand_placement',
        target: targetKey,
        action: 'misplaced',
        accuracy: 40,
        isMistake: true,
        feedback: { type: 'warning', message: 'Misplaced hand position. Target lower half of sternum.' }
      });
    }
  };

  // STEP 5: 30 Compressions (Rate: 100-120 BPM, Depth: 5-6 cm)
  const handleCompressDown = () => {
    const now = Date.now();
    let instantBpm = 110;
    if (lastCompressionTime) {
      const deltaMs = now - lastCompressionTime;
      if (deltaMs > 0) {
        instantBpm = Math.round(60000 / deltaMs);
      }
    }
    setLastCompressionTime(now);
    setMeasuredBpm(instantBpm);

    // Simulate depth between 5.2 and 5.8 cm
    const depth = +(5.0 + Math.random() * 0.9).toFixed(1);
    setCurrentDepth(depth);
    setIsRecoiled(false);

    const isRateGood = instantBpm >= 95 && instantBpm <= 125;
    const isDepthGood = depth >= 5.0 && depth <= 6.0;

    const newCount = compressionsCount + 1;
    setCompressionsCount(newCount);

    onAction({
      eventType: 'chest_compression',
      target: 'lower_sternum',
      action: 'compression_stroke',
      accuracy: isRateGood && isDepthGood ? 98 : isRateGood || isDepthGood ? 85 : 65,
      techniqueData: { strokeNumber: newCount, depthCm: depth, bpm: instantBpm, recoiled: isRecoiled },
      isMistake: !isRateGood && (instantBpm < 85 || instantBpm > 135),
      feedback: isRateGood
        ? { type: 'success', message: `${newCount}/30 • ${instantBpm} BPM • ${depth} cm (Optimal!)` }
        : { type: 'warning', message: `${newCount}/30 • Rate: ${instantBpm} BPM (Target: 100–120)` }
    });

    if (newCount >= 30) {
      setTimeout(() => onStepComplete(), 500);
    }
  };

  const handleCompressUp = () => {
    setCurrentDepth(0);
    setIsRecoiled(true);
  };

  // STEP 6: 2 Rescue Breaths
  const handleToggleHeadTilt = () => {
    const nextState = !headTiltActive;
    setHeadTiltActive(nextState);
    if (nextState) {
      onAction({
        eventType: 'airway_opening',
        target: 'head_tilt_chin_lift',
        action: 'extension',
        accuracy: 100,
        feedback: { type: 'success', message: 'Airway opened via Head-Tilt / Chin-Lift.' }
      });
    }
  };

  const handleDeliverBreath = () => {
    if (!headTiltActive) {
      onAction({
        eventType: 'rescue_breath',
        target: 'mouth_mask',
        action: 'ventilation',
        accuracy: 40,
        isMistake: true,
        errorMessage: 'Attempted ventilation without opening airway.',
        feedback: { type: 'warning', message: 'Open airway with Head-Tilt Chin-Lift first!' }
      });
      return;
    }

    const nextCount = breathsDelivered + 1;
    setBreathsDelivered(nextCount);

    onAction({
      eventType: 'rescue_breath',
      target: 'mouth_mask',
      action: 'ventilation',
      accuracy: 100,
      techniqueData: { breathNumber: nextCount, durationSeconds: 1 },
      feedback: { type: 'success', message: `Rescue Breath ${nextCount}/2 delivered (Chest rose).` }
    });

    if (nextCount >= 2) {
      setTimeout(() => onStepComplete(), 600);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
      {/* STEP 1: Responsiveness Check */}
      {step === 1 && (
        <div className="w-full text-center space-y-6">
          <div className="text-sm text-cyan-400 font-mono">SCENE SAFETY & RESPONSIVENESS EVALUATION</div>
          <div className="relative w-64 h-64 mx-auto rounded-full bg-slate-950 border-2 border-cyan-500/30 flex items-center justify-center p-4">
            <div className="w-48 h-48 rounded-full bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center space-y-2">
              <Heart className="w-12 h-12 text-rose-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">Adult Victim</span>
              <span className="text-[11px] text-slate-400">Appears Unresponsive</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              onClick={handleTapShoulder}
              className={`p-4 rounded-xl border text-sm font-semibold transition-all ${
                tappedShoulders
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200 hover:border-cyan-500'
              }`}
            >
              {tappedShoulders ? '✓ Shoulders Tapped' : '1. Tap Shoulders Firmly'}
            </button>

            <button
              onClick={handleShout}
              disabled={!tappedShoulders}
              className={`p-4 rounded-xl border text-sm font-semibold transition-all ${
                !tappedShoulders
                  ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                  : shouted
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                  : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-white'
              }`}
            >
              {shouted ? '✓ Verbal Callout Given' : '2. Shout: "Are you okay?!"'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: EMS Activation & AED */}
      {step === 2 && (
        <div className="w-full text-center space-y-6">
          <div className="text-sm text-cyan-400 font-mono">EMERGENCY ACTIVATION & AED RETRIEVAL</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Victim is unresponsive. You must immediately activate 911 / EMS and dispatch an Automated External Defibrillator.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={handleEmsCall}
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                emsCalled
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/60 hover:bg-rose-900/60 border-rose-600 text-rose-200'
              }`}
            >
              <PhoneCall className="w-8 h-8 text-rose-400" />
              <span className="font-bold text-sm">{emsCalled ? 'EMS Activated ✓' : 'Dispatch 911 / EMS'}</span>
            </button>

            <button
              onClick={handleAedRequest}
              disabled={!emsCalled}
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                !emsCalled
                  ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                  : aedRequested
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-amber-950/60 hover:bg-amber-900/60 border-amber-500 text-amber-200'
              }`}
            >
              <Zap className="w-8 h-8 text-amber-400" />
              <span className="font-bold text-sm">{aedRequested ? 'AED Requested ✓' : 'Request Bystander AED'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Carotid Pulse Check (Hold 5-10s) */}
      {step === 3 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">CAROTID PULSE & RESPIRATION CHECK</div>
          <p className="text-xs text-slate-300">
            Press and <strong>HOLD</strong> the carotid artery target for <strong>5 to 10 seconds</strong> to check for a pulse and chest rise.
          </p>

          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            {/* Circular Progress Meter */}
            <svg className="w-48 h-48 -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="#1e293b" strokeWidth="8" fill="none" />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#06b6d4"
                strokeWidth="8"
                fill="none"
                strokeDasharray="502"
                strokeDashoffset={502 - (502 * pulseProgress) / 100}
                className="transition-all duration-100"
              />
            </svg>

            <button
              onMouseDown={handlePulseMouseDown}
              onMouseUp={handlePulseMouseUp}
              onTouchStart={handlePulseMouseDown}
              onTouchEnd={handlePulseMouseUp}
              className="absolute inset-4 rounded-full bg-slate-950 hover:bg-slate-900 border-2 border-cyan-500/50 flex flex-col items-center justify-center space-y-1 active:scale-95 transition-transform"
            >
              <Activity className={`w-8 h-8 ${pulseHoldStart ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-xs font-bold text-slate-200">
                {pulseHoldStart ? 'Palpating...' : 'HOLD HERE'}
              </span>
              <span className="text-[10px] text-slate-400">Carotid Groove</span>
            </button>
          </div>

          <div className="text-xs text-slate-400">
            {pulseHoldStart ? `Checking pulse... ${Math.round(pulseProgress)}%` : 'Target: 5–10 seconds window (Never >10s)'}
          </div>
        </div>
      )}

      {/* STEP 4: Hand Placement Target */}
      {step === 4 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">ANATOMICAL HAND POSITIONING</div>
          <p className="text-xs text-slate-300">
            Select the exact anatomical location where the heel of your hand must be placed for adult compressions:
          </p>

          <div className="relative w-64 h-80 mx-auto bg-slate-950 border-2 border-slate-800 rounded-3xl p-4 flex flex-col justify-between items-center">
            {/* Torso Silhouette Representation */}
            <div className="text-[10px] text-slate-500 font-mono">CLINICAL TORSO GRID</div>

            {/* Target 1: Upper Clavicle */}
            <button
              onClick={() => handleSelectPosition('upper_chest')}
              className={`w-40 py-2 rounded-lg border text-xs font-medium transition-all ${
                selectedTarget === 'upper_chest' ? 'bg-rose-950 border-rose-500 text-rose-300' : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              Upper Sternal Notch
            </button>

            {/* Target 2: Correct Lower Sternum */}
            <button
              onClick={() => handleSelectPosition('lower_sternum')}
              className={`w-44 py-3.5 rounded-xl border-2 font-bold text-sm transition-all shadow-lg ${
                selectedTarget === 'lower_sternum'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-emerald-500/30'
                  : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/80 text-cyan-200 animate-pulse'
              }`}
            >
              Lower Half of Sternum (Center of Chest)
            </button>

            {/* Target 3: Xiphoid Process (Critical Error Trap) */}
            <button
              onClick={() => handleSelectPosition('xiphoid')}
              className={`w-40 py-2 rounded-lg border text-xs font-medium transition-all ${
                selectedTarget === 'xiphoid' ? 'bg-rose-950 border-rose-500 text-rose-300' : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              Xiphoid Process (Tip)
            </button>

            <div className="text-[10px] text-slate-500 font-mono">INTERLOCK FINGERS OVER HEEL</div>
          </div>
        </div>
      )}

      {/* STEP 5: 30 Compressions (Rhythm, Depth, Recoil) */}
      {step === 5 && (
        <div className="w-full text-center space-y-5">
          <div className="flex items-center justify-between text-xs font-mono px-4">
            <span className="text-cyan-400">METRONOME: <strong>100–120 BPM</strong></span>
            <span className="text-slate-400">DEPTH TARGET: <strong>5.0–6.0 CM</strong></span>
          </div>

          {/* Visual Metronome Pulse Indicator */}
          <div className="flex items-center justify-center space-x-3">
            <div className={`w-5 h-5 rounded-full transition-all duration-150 ${
              beatPhase ? 'bg-rose-500 scale-125 shadow-lg shadow-rose-500/50' : 'bg-slate-700 scale-90'
            }`} />
            <span className="font-mono text-xs text-slate-300">
              Measured Rhythm: <strong className="text-cyan-400">{measuredBpm} BPM</strong>
            </span>
          </div>

          {/* Compression Counter & Depth Indicator */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            {/* Depth Gauge Outer Ring */}
            <div className="w-56 h-56 rounded-full border-4 border-slate-800 bg-slate-950 flex flex-col items-center justify-center p-4">
              <div className="text-4xl font-extrabold font-mono text-white mb-1">
                {compressionsCount} <span className="text-sm font-normal text-slate-500">/ 30</span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Depth: <strong className="text-cyan-300">{currentDepth} cm</strong>
              </div>
              <div className={`mt-2 text-[10px] font-mono px-2 py-0.5 rounded ${
                isRecoiled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {isRecoiled ? 'RECOIL: 100%' : 'COMPRESSED'}
              </div>
            </div>
          </div>

          {/* Large Tactile Push Button */}
          <button
            onMouseDown={handleCompressDown}
            onMouseUp={handleCompressUp}
            onTouchStart={handleCompressDown}
            onTouchEnd={handleCompressUp}
            className="w-full max-w-sm py-5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white font-bold text-lg shadow-xl shadow-rose-900/40 border border-rose-400/40 transition-all font-mono"
          >
            PUSH TO COMPRESS (5–6 CM)
          </button>
          <div className="text-[11px] text-slate-400">
            Release fully between compressions to permit full ventricular recoil!
          </div>
        </div>
      )}

      {/* STEP 6: 2 Rescue Breaths */}
      {step === 6 && (
        <div className="w-full text-center space-y-6">
          <div className="text-sm text-cyan-400 font-mono">AIRWAY VENTILATION: 2 RESCUE BREATHS</div>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Maintain the 30:2 ratio. Open the airway with <strong>Head-Tilt / Chin-Lift</strong>, then seal mask and deliver 2 gentle breaths (1 sec each).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={handleToggleHeadTilt}
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                headTiltActive
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              <Wind className="w-8 h-8 text-cyan-400" />
              <span className="font-bold text-sm">
                {headTiltActive ? 'Airway Opened (Head-Tilt ✓)' : '1. Head-Tilt / Chin-Lift'}
              </span>
            </button>

            <button
              onClick={handleDeliverBreath}
              disabled={!headTiltActive}
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                !headTiltActive
                  ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                  : breathsDelivered >= 2
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                  : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-white'
              }`}
            >
              <Radio className="w-8 h-8 text-cyan-200" />
              <span className="font-bold text-sm">
                {breathsDelivered >= 2 ? '2 Breaths Delivered ✓' : `2. Deliver Breath (${breathsDelivered}/2)`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CprAedSimulation;
