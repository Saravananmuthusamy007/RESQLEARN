import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Activity, CheckCircle2, User, AlertCircle, Sparkles } from 'lucide-react';

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
        action: 'PERFORM_BACK_BLOWS',
        targetAccuracy: 95,
        isCorrect: true,
        feedback: '5 sharp back blows delivered between shoulder blades with heel of hand!'
      });
    } else {
      onAction({
        action: 'PERFORM_BACK_BLOWS',
        targetAccuracy: 95,
        isCorrect: true,
        feedback: `Back blow ${next}/${targetBlows} administered.`,
        autoAdvance: false
      });
    }
  };

  const handleAbdominalThrust = () => {
    if (backBlowsCount < targetBlows) {
      onAction({
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
        action: 'PERFORM_ABDOMINAL_THRUSTS',
        targetAccuracy: 95,
        isCorrect: true,
        feedback: '5 quick inward & upward abdominal thrusts delivered with optimal force!'
      });
      onAction({
        action: 'COMPLETE',
        targetAccuracy: 100,
        isCorrect: true,
        feedback: 'Airway obstruction dislodged! Patient breathing normally.'
      });
    } else {
      onAction({
        action: 'PERFORM_ABDOMINAL_THRUSTS',
        targetAccuracy: 90,
        isCorrect: true,
        feedback: `Abdominal thrust ${next}/${targetThrusts} delivered: Quick upward motion (${thrustForce}% Force).`,
        autoAdvance: false
      });
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
      {/* Patient Torso & Directional Thrust Hotspot Canvas */}
      <div className="relative w-full max-w-md h-64 bg-slate-900 rounded-3xl border-2 border-slate-700/80 flex items-center justify-center overflow-hidden shadow-inner p-4">
        {/* Dislodged Airway Object Ejection Animation */}
        {objectExpelled && (
          <motion.div
            initial={{ y: 0, scale: 0.5, opacity: 1 }}
            animate={{ y: -70, x: 40, scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute top-16 z-30 p-2 bg-amber-400 text-slate-950 rounded-full font-black text-[10px] uppercase shadow-xl flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4" /> Foreign Object Cleared!
          </motion.div>
        )}

        {/* Anatomical Standing Patient Silhouette */}
        <motion.div
          animate={isThrusting ? { y: -8, scaleY: 0.96 } : { y: 0, scaleY: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 12 }}
          className="relative w-52 h-56 bg-slate-800 rounded-t-[40px] rounded-b-2xl border border-slate-600/60 p-3 flex flex-col items-center shadow-lg"
        >
          {/* Head & Neck */}
          <div className="w-16 h-10 bg-slate-700 rounded-t-full -mt-9 border-t border-x border-slate-600/60 flex items-center justify-center">
            {objectExpelled ? (
              <span className="text-xs">😮💨</span>
            ) : (
              <span className="text-xs">😨</span>
            )}
          </div>

          {/* Ribcage Outline */}
          <div className="w-full text-center mt-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Xiphoid Process & Ribcage
            </span>
            <div className="w-28 h-1 bg-slate-600/40 mx-auto rounded-full mt-1" />
          </div>

          {/* Upward Abdominal Thrust Target Hotspot */}
          <div className="mt-4 relative flex flex-col items-center">
            {/* Directional Force & Angle Arrow Prompt */}
            <motion.div
              animate={{ y: [-4, -12, -4], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="flex items-center gap-1 text-cyan-400 font-black text-[10px] uppercase tracking-wider mb-1"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Inward & Upward Force</span>
            </motion.div>

            {/* Interactive Hotspot Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleAbdominalThrust}
              className={`w-24 h-20 rounded-2xl flex flex-col items-center justify-center p-2 shadow-2xl transition border-4 ${
                backBlowsCount >= targetBlows && thrustsCount < targetThrusts
                  ? 'bg-gradient-to-t from-cyan-600 to-blue-600 border-cyan-400 text-white cursor-pointer hover:shadow-cyan-500/50'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <ArrowUp className="w-6 h-6 text-yellow-300" />
              <span className="text-[9px] font-black uppercase text-center mt-0.5">
                Thrust Hotspot (Above Navel)
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>

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
