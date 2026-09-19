import React, { useState, useEffect } from 'react';
import { Shield, Droplets, RotateCw, Clock, CheckCircle2, AlertOctagon } from 'lucide-react';

export const HemorrhageSimulation = ({ step, onAction, onStepComplete }) => {
  // Step 1: PPE
  const [ppeDonned, setPpeDonned] = useState(false);

  // Step 2: Direct Pressure (Target 40-60 N)
  const [appliedForce, setAppliedForce] = useState(0);
  const [isHoldingPressure, setIsHoldingPressure] = useState(false);
  const [pressureSeconds, setPressureSeconds] = useState(0);

  // Step 3: Wound Packing
  const [packedLayers, setPackedLayers] = useState(0);

  // Step 4: Tourniquet Placement (5-7 cm above wound, NOT on joint)
  const [selectedPlacement, setSelectedPlacement] = useState(null);

  // Step 5: Windlass Twist
  const [windlassTurns, setWindlassTurns] = useState(0);
  const [bleedingStopped, setBleedingStopped] = useState(false);

  // Step 6: Timestamp
  const [timestampEntered, setTimestampEntered] = useState('');
  const [timestampConfirmed, setTimestampConfirmed] = useState(false);

  // Pressure hold loop
  useEffect(() => {
    let interval;
    if (isHoldingPressure) {
      interval = setInterval(() => {
        setPressureSeconds(prev => {
          const next = prev + 1;
          if (next >= 4) {
            onAction({
              eventType: 'direct_manual_pressure',
              target: 'femoral_wound',
              action: 'sustained_compression',
              accuracy: appliedForce >= 40 && appliedForce <= 60 ? 98 : 75,
              techniqueData: { forceNewtons: appliedForce, holdSeconds: next },
              feedback: { type: 'success', message: `Pressure sustained at ${appliedForce} N. Hemostasis established.` }
            });
            setTimeout(() => onStepComplete(), 600);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isHoldingPressure, appliedForce]);

  // STEP 1 HANDLER
  const handleDonPpe = () => {
    setPpeDonned(true);
    onAction({
      eventType: 'ppe_donned',
      target: 'gloves_protection',
      action: 'don',
      accuracy: 100,
      feedback: { type: 'success', message: 'Nitrile gloves on. Universal precautions active.' }
    });
    setTimeout(() => onStepComplete(), 600);
  };

  // STEP 2: Force adjustment & hold
  const handleForceChange = (e) => {
    const val = Number(e.target.value);
    setAppliedForce(val);
  };

  // STEP 3: Wound Packing
  const handlePackGauze = () => {
    const next = packedLayers + 1;
    setPackedLayers(next);
    onAction({
      eventType: 'wound_packing',
      target: 'wound_cavity_base',
      action: 'feed_gauze',
      accuracy: 95,
      techniqueData: { layerNumber: next },
      feedback: { type: 'success', message: `Hemostatic gauze packed into base (Layer ${next}/4).` }
    });

    if (next >= 4) {
      setTimeout(() => onStepComplete(), 600);
    }
  };

  // STEP 4: Tourniquet Placement selection
  const handleSelectPlacement = (zone) => {
    setSelectedPlacement(zone);
    if (zone === '5_7cm_proximal') {
      onAction({
        eventType: 'tourniquet_positioning',
        target: '5_7cm_proximal',
        action: 'route_band',
        accuracy: 100,
        feedback: { type: 'success', message: 'Optimal position: 5–7 cm proximal to wound (above joint).' }
      });
      setTimeout(() => onStepComplete(), 600);
    } else if (zone === 'over_joint') {
      onAction({
        eventType: 'tourniquet_positioning',
        target: 'knee_joint',
        action: 'misplaced',
        accuracy: 10,
        isCriticalError: true,
        errorMessage: 'Tourniquet placed directly over knee joint.',
        feedback: { type: 'error', message: 'CRITICAL ERROR: Tourniquets must NEVER be placed directly over joints!' }
      });
    } else {
      onAction({
        eventType: 'tourniquet_positioning',
        target: 'distal_wound',
        action: 'misplaced',
        accuracy: 20,
        isMistake: true,
        errorMessage: 'Tourniquet placed distal to the wound.',
        feedback: { type: 'warning', message: 'Tourniquet must be PROXIMAL (between wound and heart).' }
      });
    }
  };

  // STEP 5: Windlass Twist
  const handleTwistWindlass = () => {
    const nextTurns = windlassTurns + 1;
    setWindlassTurns(nextTurns);

    if (nextTurns >= 3) {
      setBleedingStopped(true);
      onAction({
        eventType: 'windlass_tightening',
        target: 'cat_windlass_rod',
        action: 'lock_clip',
        accuracy: 100,
        feedback: { type: 'success', message: 'Windlass locked! Arterial spurting stopped. Distal pulse absent.' }
      });
      setTimeout(() => onStepComplete(), 600);
    } else {
      onAction({
        eventType: 'windlass_tightening',
        target: 'cat_windlass_rod',
        action: 'rotation',
        accuracy: 90,
        techniqueData: { turn: nextTurns },
        feedback: { type: 'warning', message: `Windlass Turn ${nextTurns}: Bleeding slowing... Continue turning!` }
      });
    }
  };

  // STEP 6: Timestamp
  const handleConfirmTimestamp = () => {
    const timeStr = timestampEntered || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTimestampConfirmed(true);
    onAction({
      eventType: 'tourniquet_timestamp',
      target: 'time_strap',
      action: 'write_timestamp',
      accuracy: 100,
      techniqueData: { timestampText: timeStr },
      feedback: { type: 'success', message: `Timestamp recorded: "${timeStr}". Ready for surgical handoff.` }
    });
    setTimeout(() => onStepComplete(), 600);
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
      {/* STEP 1: PPE */}
      {step === 1 && (
        <div className="w-full text-center space-y-6">
          <div className="text-sm text-cyan-400 font-mono">SCENE SAFETY & PERSONAL PROTECTIVE EQUIPMENT</div>
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex flex-col items-center space-y-4">
            <Droplets className="w-12 h-12 text-rose-500 animate-bounce" />
            <div className="text-xs text-slate-300">
              Active arterial bleeding encountered. You must protect yourself from bloodborne pathogens before physical intervention.
            </div>
            <button
              onClick={handleDonPpe}
              className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg ${
                ppeDonned
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>{ppeDonned ? 'PPE Gloves Donned ✓' : 'Put on Nitrile Gloves (PPE)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Direct Pressure Gauge (40-60 N) */}
      {step === 2 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">DIRECT MANUAL PRESSURE (TARGET: 40–60 N)</div>
          <p className="text-xs text-slate-300">
            Slide the force gauge to the optimal therapeutic range (<strong>40–60 N</strong>), then press and hold to establish tamponade.
          </p>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto space-y-4">
            {/* Force Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-400">Current Force:</span>
                <span className={`font-bold ${appliedForce >= 40 && appliedForce <= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {appliedForce} Newtons {appliedForce >= 40 && appliedForce <= 60 ? '(Optimal)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={appliedForce}
                onChange={handleForceChange}
                className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0 N</span>
                <span className="text-emerald-400 font-bold">40–60 N Target</span>
                <span>80 N</span>
              </div>
            </div>

            {/* Hold Button */}
            <button
              onMouseDown={() => setIsHoldingPressure(true)}
              onMouseUp={() => setIsHoldingPressure(false)}
              onTouchStart={() => setIsHoldingPressure(true)}
              onTouchEnd={() => setIsHoldingPressure(false)}
              disabled={appliedForce < 20}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
                appliedForce < 20
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : isHoldingPressure
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30'
              }`}
            >
              {isHoldingPressure ? `HOLDING PRESSURE (${pressureSeconds}s / 4s)...` : 'PRESS & HOLD ON WOUND WITH GAUZE'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Deep Wound Packing */}
      {step === 3 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">JUNCTIONAL WOUND PACKING</div>
          <p className="text-xs text-slate-300">
            Feed hemostatic dressing layer-by-layer directly down to the bleeding vessel at the base of the cavity.
          </p>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex flex-col items-center space-y-4">
            <div className="w-36 h-36 rounded-full bg-rose-950/80 border-4 border-rose-600 flex flex-col items-center justify-center p-3">
              <div className="text-xs font-mono text-rose-300">Cavity Status:</div>
              <div className="text-xl font-bold text-white font-mono mt-1">
                {packedLayers >= 4 ? 'FULLY PACKED' : `${packedLayers * 25}% Full`}
              </div>
            </div>

            <button
              onClick={handlePackGauze}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all"
            >
              {packedLayers >= 4 ? 'Wound Fully Packed ✓' : `Feed Hemostatic Gauze (${packedLayers}/4 Layers)`}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Tourniquet Placement */}
      {step === 4 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">CAT TOURNIQUET PLACEMENT LOCATION</div>
          <p className="text-xs text-slate-300">
            Select the anatomically correct placement zone along the injured thigh:
          </p>

          <div className="max-w-md mx-auto space-y-3">
            <button
              onClick={() => handleSelectPlacement('5_7cm_proximal')}
              className={`w-full p-4 rounded-xl border text-sm font-bold transition-all ${
                selectedPlacement === '5_7cm_proximal'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              5 to 7 cm (2–3 inches) Proximal to Wound (Above Joint)
            </button>

            <button
              onClick={() => handleSelectPlacement('over_joint')}
              className={`w-full p-4 rounded-xl border text-sm font-medium transition-all ${
                selectedPlacement === 'over_joint'
                  ? 'bg-rose-950 border-rose-500 text-rose-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
              }`}
            >
              Directly Over the Knee Joint (Critical Error Trap)
            </button>

            <button
              onClick={() => handleSelectPlacement('distal')}
              className={`w-full p-4 rounded-xl border text-sm font-medium transition-all ${
                selectedPlacement === 'distal'
                  ? 'bg-amber-950 border-amber-500 text-amber-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
              }`}
            >
              Distal to the Wound (Below Injury)
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Windlass Twisting */}
      {step === 5 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">TIGHTEN WINDLASS UNTIL HEMOSTASIS</div>
          <p className="text-xs text-slate-300">
            Rotate the windlass rod until bright red arterial spurting stops and the distal pulse disappears.
          </p>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-slate-400">Bleeding Status:</span>
              <span className={`font-bold ${bleedingStopped ? 'text-emerald-400' : 'text-rose-400'}`}>
                {bleedingStopped ? 'CONTROLLED (100%)' : 'ACTIVE ARTERIAL SPURT'}
              </span>
            </div>

            <button
              onClick={handleTwistWindlass}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all font-mono"
            >
              <RotateCw className="w-5 h-5 animate-spin-slow" />
              <span>TWIST WINDLASS ROD ({windlassTurns}/3 TURNS)</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Timestamp */}
      {step === 6 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">SECURE TIME STRAP & RECORD TIMESTAMP</div>
          <p className="text-xs text-slate-300">
            Lock the windlass rod inside the clip, fold the Velcro strap over top, and write the current time on the band.
          </p>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto space-y-4">
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                placeholder="e.g., 14:32 (or press Confirm for current time)"
                value={timestampEntered}
                onChange={(e) => setTimestampEntered(e.target.value)}
                className="w-full bg-transparent text-white text-xs outline-none font-mono"
              />
            </div>

            <button
              onClick={handleConfirmTimestamp}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all"
            >
              {timestampConfirmed ? 'Timestamp Verified ✓' : 'Confirm & Write Application Time'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HemorrhageSimulation;
