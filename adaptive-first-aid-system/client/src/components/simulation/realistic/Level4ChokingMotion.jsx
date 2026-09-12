import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Activity, CheckCircle2, User, AlertCircle, Sparkles } from 'lucide-react';
import AnatomyChokingTorso from '../../simulations/AnatomyChokingTorso';

const Level4ChokingMotion = ({ currentStep, onAction, isFinished }) => {
  const [backBlowsCount, setBackBlowsCount] = useState(0);
  const [thrustsCount, setThrustsCount] = useState(0);
  const [thrustForce, setThrustForce] = useState(85); // 0 to 100%
  const [thrustAngle, setThrustAngle] = useState('Inward & Upward (45°)');
  const [isThrusting, setIsThrusting] = useState(false);
  const [objectExpelled, setObjectExpelled] = useState(false);

  const targetBlows = 5;
  const targetThrusts = 5;

  const handleBackBlow = () => {
    const next = backBlowsCount + 1;
    setBackBlowsCount(next);

    if (next >= targetBlows) {
      onAction({
        step: 'back_blows',
        target: 'interscapular_zone',
        action: 'PERFORM_BACK_BLOWS',
        targetAccuracy: 95,
        isCorrect: true,
        count: targetBlows,
        feedback: '5 sharp back blows delivered between shoulder blades with heel of hand!'
      });
    } else {
      onAction({
        step: 'back_blows',
        target: 'interscapular_zone',
        action: 'PERFORM_BACK_BLOWS',
        targetAccuracy: 95,
        isCorrect: true,
        count: next,
        feedback: `Back blow ${next}/${targetBlows} administered.`,
        autoAdvance: false
      });
    }
  };

  const handleAbdominalThrust = () => {
    if (backBlowsCount < targetBlows) {
      onAction({
        step: 'abdominal_thrusts',
        target: 'subdiaphragmatic',
        action: 'PERFORM_ABDOMINAL_THRUSTS',
        targetAccuracy: 50,
        isCorrect: false,
        feedback: 'Deliver 5 sharp back blows first before transitioning to abdominal thrusts.'
      });
      return;
    }

    setIsThrusting(true);
    setTimeout(() => setIsThrusting(false), 200);

    const next = thrustsCount + 1;
    setThrustsCount(next);

    if (next >= targetThrusts) {
      setObjectExpelled(true);
      onAction({
        step: 'abdominal_thrusts',
        target: 'subdiaphragmatic',
        action: 'PERFORM_ABDOMINAL_THRUSTS',
        targetAccuracy: 95,
        isCorrect: true,
        vector: 'upward_inward',
        angle: '45_deg',
        vectorAccuracy: 95,
        force: thrustForce,
        count: targetThrusts,
        feedback: '5 quick inward & upward abdominal thrusts delivered with optimal force!'
      });
      onAction({
        step: 'choking_resolved',
        target: 'airway',
        action: 'COMPLETE',
        targetAccuracy: 100,
        isCorrect: true,
        feedback: 'Airway obstruction dislodged! Patient breathing normally.'
      });
    } else {
      onAction({
        step: 'abdominal_thrusts',
        target: 'subdiaphragmatic',
        action: 'PERFORM_ABDOMINAL_THRUSTS',
        targetAccuracy: 90,
        isCorrect: true,
        vector: 'upward_inward',
        angle: '45_deg',
        vectorAccuracy: 90,
        force: thrustForce,
        count: next,
        feedback: `Abdominal thrust ${next}/${targetThrusts} delivered: Quick upward motion (${thrustForce}% Force).`,
        autoAdvance: false
      });
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
      {/* Clinical 2D Lateral Torso & Upward Thrust Gesture Simulation */}
      <AnatomyChokingTorso
        backBlowsCount={backBlowsCount}
        targetBlows={targetBlows}
        thrustsCount={thrustsCount}
        targetThrusts={targetThrusts}
        objectExpelled={objectExpelled}
        isThrusting={isThrusting}
        onBackBlow={handleBackBlow}
        onAbdominalThrust={handleAbdominalThrust}
        disabled={isFinished}
      />

      {/* Force Slider & Angle Indicator Telemetry */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            Maneuver Progress: <strong>{thrustsCount} / {targetThrusts} Thrusts</strong>
          </span>
          <span className="text-amber-400 font-mono text-[11px]">Angle: {thrustAngle}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Thrust Force Setting:</span>
            <span className="font-bold text-cyan-400">{thrustForce}% (Target: 80–100%)</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            value={thrustForce}
            onChange={(e) => setThrustForce(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Sequential Procedure Control Buttons */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <button
          onClick={() => onAction({
            step: 'verify_choking',
            target: 'airway_obstruction',
            action: 'IDENTIFY_CHOKING',
            targetAccuracy: 100,
            isCorrect: true,
            feedback: 'Universal choking sign verified: Victim clutching throat, cannot speak.'
          })}
          className="p-3 rounded-2xl border border-slate-800 bg-slate-900 text-slate-300 font-bold flex flex-col items-center justify-center gap-1.5 hover:border-cyan-500 transition"
        >
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <span>1. Verify Choking</span>
        </button>

        <button
          onClick={handleBackBlow}
          disabled={backBlowsCount >= targetBlows}
          className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
            backBlowsCount >= targetBlows
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 cursor-default'
              : 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
          }`}
        >
          <User className="w-5 h-5" />
          <span>{backBlowsCount >= targetBlows ? '✓ 5 Back Blows Done' : `2. Back Blow (${backBlowsCount}/${targetBlows})`}</span>
        </button>

        <button
          onClick={handleAbdominalThrust}
          disabled={thrustsCount >= targetThrusts}
          className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
            thrustsCount >= targetThrusts
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 cursor-default'
              : backBlowsCount >= targetBlows
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-lg ring-2 ring-cyan-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <ArrowUp className="w-5 h-5 text-yellow-300" />
          <span>{thrustsCount >= targetThrusts ? '✓ 5 Thrusts Done' : `3. Heimlich Thrust (${thrustsCount}/${targetThrusts})`}</span>
        </button>

        <button
          onClick={() => onAction({
            step: 'assess_cough',
            target: 'airway_check',
            action: 'ENCOURAGE_COUGH',
            targetAccuracy: 95,
            isCorrect: true,
            feedback: 'Encouraged forceful coughing while observing for complete obstruction.'
          })}
          className="p-3 rounded-2xl border border-slate-800 bg-slate-900 text-slate-400 font-semibold flex flex-col items-center justify-center gap-1.5 hover:text-slate-200 transition"
        >
          <CheckCircle2 className="w-5 h-5 text-slate-500" />
          <span>Encourage Cough</span>
        </button>
      </div>
    </div>
  );
};

export default Level4ChokingMotion;
