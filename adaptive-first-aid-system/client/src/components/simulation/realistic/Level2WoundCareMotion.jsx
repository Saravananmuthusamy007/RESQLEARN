import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Bandage, Clock, CheckCircle2 } from 'lucide-react';
import AnatomyArmWound from '../../simulations/AnatomyArmWound';

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
              step: 'maintain_pressure',
              target: 'laceration',
              action: 'MAINTAIN_PRESSURE',
              targetAccuracy: 95,
              isCorrect: true,
              durationSec: pressureTargetSec,
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
      step: 'don_ppe',
      target: 'nitrile_gloves',
      action: 'WEAR_PPE',
      targetAccuracy: 100,
      isCorrect: true,
      feedback: 'Nitrile protective gloves put on: Infection control standard met.'
    });
  };

  const handleApplyGauze = () => {
    if (!hasPPE) {
      onAction({
        step: 'place_sterile_gauze',
        target: 'wound_site',
        action: 'SELECT_DRESSING',
        targetAccuracy: 50,
        isCorrect: false,
        feedback: 'PPE Protocol Warning: Put on medical gloves before treating open wound!'
      });
      return;
    }
    setGauzeApplied(true);
    onAction({
      step: 'place_sterile_gauze',
      target: 'wound_site',
      action: 'SELECT_DRESSING',
      targetAccuracy: 95,
      isCorrect: true,
      feedback: 'Sterile gauze pad placed directly over bleeding wound site.'
    });
  };

  const handleDirectPressureToggle = () => {
    if (!gauzeApplied) {
      onAction({
        step: 'apply_direct_pressure',
        target: 'laceration',
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
        step: 'apply_direct_pressure',
        target: 'laceration',
        action: 'APPLY_DIRECT_PRESSURE',
        targetAccuracy: 95,
        isCorrect: true,
        continuous: true,
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
        step: 'secure_compression_bandage',
        target: 'wound_wrap',
        action: 'ADD_BANDAGE',
        targetAccuracy: 60,
        isCorrect: false,
        feedback: 'Maintain direct pressure for the full duration before securing pressure bandage.'
      });
      return;
    }

    setBandageApplied(true);
    onAction({
      step: 'secure_compression_bandage',
      target: 'wound_wrap',
      action: 'ADD_BANDAGE',
      targetAccuracy: 95,
      isCorrect: true,
      tightness: 'snug_non_constricting',
      feedback: 'Pressure bandage snugly wrapped over gauze dressing, securing hemorrhage control.'
    });

    onAction({
      step: 'wound_care_complete',
      target: 'wound_wrap',
      action: 'COMPLETE',
      targetAccuracy: 100,
      isCorrect: true,
      feedback: 'Wound care & hemorrhage control procedure completed successfully!'
    });
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
      {/* Clinical 2D Anatomical Forearm & Interactive Medical Tray */}
      <AnatomyArmWound
        glovesWorn={hasPPE}
        gauzeApplied={gauzeApplied}
        isPressing={isPressing}
        pressureTimer={pressureTimer}
        pressureTargetSec={pressureTargetSec}
        bandageApplied={bandageApplied}
        onWearGloves={handleApplyPPE}
        onApplyGauze={handleApplyGauze}
        onTogglePressure={handleDirectPressureToggle}
        onApplyBandage={handleApplyBandage}
        disabled={isFinished}
      />

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
