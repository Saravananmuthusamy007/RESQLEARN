import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Bandage, Clock, CheckCircle2 } from 'lucide-react';

const Level2WoundCareMotion = ({ currentStep, onAction, isFinished }) => {
  const [hasPPE, setHasPPE] = useState(false);
  const [gauzeApplied, setGauzeApplied] = useState(false);
  const [pressureTimer, setPressureTimer] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [bandageApplied, setBandageApplied] = useState(false);

  const pressureTargetSec = 8;
  const pressIntervalRef = useRef(null);

  useEffect(() => {
    if (isPressing) {
      pressIntervalRef.current = setInterval(() => {
        setPressureTimer(prev => {
          const next = prev + 1;
          if (next >= pressureTargetSec) {
            clearInterval(pressIntervalRef.current);
            setIsPressing(false);
            onAction({
              action: 'MAINTAIN_PRESSURE',
              targetAccuracy: 95,
              isCorrect: true,
              feedback: 'Continuous direct firm pressure held for full duration! Bleeding controlled.'
            });
          }
          return next;
        });
      }, 1000);
    } else {
      if (pressIntervalRef.current) clearInterval(pressIntervalRef.current);
    }

    return () => {
      if (pressIntervalRef.current) clearInterval(pressIntervalRef.current);
    };
  }, [isPressing]);

  const handleApplyPPE = () => {
    setHasPPE(true);
    onAction({
      action: 'WEAR_PPE',
      targetAccuracy: 100,
      isCorrect: true,
      feedback: 'Nitrile protective gloves put on: Infection control standard met.'
    });
  };

  const handleApplyGauze = () => {
    if (!hasPPE) {
      onAction({
        action: 'SELECT_DRESSING',
        targetAccuracy: 50,
        isCorrect: false,
        feedback: 'PPE Protocol Warning: Put on medical gloves before treating open wound!'
      });
      return;
    }
    setGauzeApplied(true);
    onAction({
      action: 'SELECT_DRESSING',
      targetAccuracy: 95,
      isCorrect: true,
      feedback: 'Sterile gauze pad placed directly over bleeding wound site.'
    });
  };

  const handleDirectPressureToggle = () => {
    if (!gauzeApplied) {
      onAction({
        action: 'APPLY_DIRECT_PRESSURE',
        targetAccuracy: 50,
        isCorrect: false,
        feedback: 'Apply sterile gauze dressing before pressing on bare laceration!'
      });
      return;
    }

    if (!isPressing) {
      setIsPressing(true);
      onAction({
        action: 'APPLY_DIRECT_PRESSURE',
        targetAccuracy: 95,
        isCorrect: true,
        feedback: 'Applying firm, continuous two-handed direct pressure on wound.',
        autoAdvance: false
      });
    } else {
      setIsPressing(false);
    }
  };

  const handleApplyBandage = () => {
    if (pressureTimer < pressureTargetSec) {
      onAction({
        action: 'ADD_BANDAGE',
        targetAccuracy: 60,
        isCorrect: false,
        feedback: 'Maintain direct pressure for the full duration before securing pressure bandage.'
      });
      return;
    }

    setBandageApplied(true);
    onAction({
      action: 'ADD_BANDAGE',
      targetAccuracy: 95,
      isCorrect: true,
      feedback: 'Pressure bandage snugly wrapped over gauze dressing, securing hemorrhage control.'
    });

    onAction({
      action: 'COMPLETE',
      targetAccuracy: 100,
      isCorrect: true,
      feedback: 'Wound care & hemorrhage control procedure completed successfully!'
    });
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
      {/* Patient Arm & Laceration Interactive Canvas */}
      <div className="relative w-full max-w-md h-64 bg-slate-900 rounded-3xl border-2 border-slate-700/80 flex items-center justify-center overflow-hidden shadow-inner p-4">
        {/* Arm Contour Graphic */}
        <div className="relative w-80 h-32 bg-amber-200/90 rounded-full border-2 border-amber-300/40 shadow-xl flex items-center justify-center overflow-hidden">
          {/* Muscle tone shading */}
          <div className="absolute inset-x-0 top-0 h-8 bg-amber-300/30 rounded-t-full" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-amber-400/20 rounded-b-full" />

          {/* Laceration / Bleeding Wound Site Target */}
          <div className="relative flex items-center justify-center">
            {/* Active Bleeding Animation (Slows down after pressure) */}
            {!bandageApplied && (
              <motion.div
                animate={
                  pressureTimer >= pressureTargetSec
                    ? { scale: 0.9, opacity: 0.3 }
                    : { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }
                }
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-16 h-8 bg-red-600 rounded-full blur-[2px] shadow-lg shadow-red-600/60"
              />
            )}

            {/* Sterile Gauze Dressing Layer */}
            {gauzeApplied && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute w-24 h-16 bg-slate-100 rounded-lg border-2 border-dashed border-slate-400 shadow-md flex items-center justify-center z-10"
              >
                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">Sterile Gauze</span>
              </motion.div>
            )}

            {/* Direct Pressure Hand Overlay */}
            {isPressing && (
              <motion.div
                animate={{ scale: [1, 0.95, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute w-28 h-20 bg-cyan-600/40 border-2 border-cyan-400 rounded-2xl backdrop-blur-sm z-20 flex items-center justify-center"
              >
                <span className="text-[10px] font-black uppercase text-cyan-200 tracking-wider">
                  Holding Pressure ({pressureTimer}s)
                </span>
              </motion.div>
            )}

            {/* Pressure Bandage Wrap Layer */}
            {bandageApplied && (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute w-36 h-28 bg-gradient-to-r from-amber-100 via-stone-200 to-amber-100 rounded-xl border-4 border-amber-300 shadow-2xl z-30 flex items-center justify-center"
              >
                <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Secured Bandage
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Hemorrhage Control Pressure Timer Bar */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            Continuous Pressure: <strong>{pressureTimer} / {pressureTargetSec} Seconds</strong>
          </span>
          <span className="text-emerald-400 font-mono text-[11px]">
            {pressureTimer >= pressureTargetSec ? 'Hemorrhage Arrested ✓' : 'Holding Required'}
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="bg-cyan-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (pressureTimer / pressureTargetSec) * 100)}%` }}
          />
        </div>
      </div>

      {/* Interactive Drag/Click Equipment Tray */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <button
          onClick={handleApplyPPE}
          disabled={hasPPE}
          className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
            hasPPE
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 cursor-default'
              : currentStep === 'WEAR_PPE' || currentStep === 'IDENTIFY_BLEEDING'
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span>{hasPPE ? '✓ 1. Gloves On' : '1. Wear Gloves (PPE)'}</span>
        </button>

        <button
          onClick={handleApplyGauze}
          disabled={gauzeApplied}
          className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
            gauzeApplied
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 cursor-default'
              : currentStep === 'SELECT_DRESSING'
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>{gauzeApplied ? '✓ 2. Gauze Placed' : '2. Apply Sterile Gauze'}</span>
        </button>

        <button
          onClick={handleDirectPressureToggle}
          disabled={pressureTimer >= pressureTargetSec}
          className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
            pressureTimer >= pressureTargetSec
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 cursor-default'
              : isPressing
              ? 'bg-amber-600 border-amber-400 text-white animate-pulse'
              : currentStep === 'APPLY_DIRECT_PRESSURE' || currentStep === 'MAINTAIN_PRESSURE'
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>{isPressing ? 'Holding Pressure...' : '3. Apply Firm Pressure'}</span>
        </button>

        <button
          onClick={handleApplyBandage}
          disabled={bandageApplied}
          className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
            bandageApplied
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 cursor-default'
              : currentStep === 'ADD_BANDAGE'
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bandage className="w-5 h-5" />
          <span>{bandageApplied ? '✓ 4. Bandaged' : '4. Secure Bandage Wrap'}</span>
        </button>
      </div>
    </div>
  );
};

export default Level2WoundCareMotion;
