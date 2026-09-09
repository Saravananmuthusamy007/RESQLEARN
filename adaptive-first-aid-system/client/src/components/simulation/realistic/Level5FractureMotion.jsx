import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bone, Shield, CheckCircle2, Activity, ArrowRight, HeartPulse } from 'lucide-react';

const Level5FractureMotion = ({ currentStep, onAction, isFinished }) => {
  const [splintAligned, setSplintAligned] = useState(false);
  const [proximalWrapSecured, setProximalWrapSecured] = useState(false);
  const [distalWrapSecured, setDistalWrapSecured] = useState(false);
  const [circulationChecked, setCirculationChecked] = useState(false);
  const [splintOffset, setSplintOffset] = useState(0);

  const handleAlignSplint = () => {
    setSplintAligned(true);
    setSplintOffset(0);
    onAction({
      action: 'POSITION_SPLINT',
      targetAccuracy: 95,
      isCorrect: true,
      feedback: 'Padded rigid splint aligned spanning both the joint above and joint below fracture.'
    });
  };

  const handleWrapProximal = () => {
    if (!splintAligned) {
      onAction({
        action: 'SECURE_BANDAGES',
        targetAccuracy: 50,
        isCorrect: false,
        feedback: 'Position and align the rigid splint before securing bandage wraps!'
      });
      return;
    }
    setProximalWrapSecured(true);
    onAction({
      action: 'SECURE_BANDAGES',
      targetAccuracy: 95,
      isCorrect: true,
      feedback: 'Proximal tie secured above fracture site (elbow joint immobilized).'
    });
  };

  const handleWrapDistal = () => {
    if (!proximalWrapSecured) {
      onAction({
        action: 'SECURE_BANDAGES',
        targetAccuracy: 60,
        isCorrect: false,
        feedback: 'Secure the proximal joint tie before wrapping distal joint.'
      });
      return;
    }
    setDistalWrapSecured(true);
    onAction({
      action: 'SECURE_BANDAGES',
      targetAccuracy: 95,
      isCorrect: true,
      feedback: 'Distal tie secured below fracture site (wrist joint immobilized).'
    });
  };

  const handleCheckCirculation = () => {
    if (!distalWrapSecured) {
      onAction({
        action: 'CHECK_CIRCULATION',
        targetAccuracy: 50,
        isCorrect: false,
        feedback: 'Complete the splint immobilization wraps before neurovascular re-assessment.'
      });
      return;
    }
    setCirculationChecked(true);
    onAction({
      action: 'CHECK_CIRCULATION',
      targetAccuracy: 100,
      isCorrect: true,
      feedback: 'Circulation, sensation, and motor function (CSM) checked: Strong radial pulse, warm capillary refill (<2s).'
    });
    onAction({
      action: 'COMPLETE',
      targetAccuracy: 100,
      isCorrect: true,
      feedback: 'Fracture immobilization protocol successfully completed!'
    });
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
      {/* Limb & Splint Immobilization Canvas */}
      <div className="relative w-full max-w-md h-64 bg-slate-900 rounded-3xl border-2 border-slate-700/80 flex items-center justify-center overflow-hidden shadow-inner p-4">
        {/* Forearm Surface Graphic */}
        <div className="relative w-80 h-28 bg-amber-200/90 rounded-2xl border-2 border-amber-300/60 shadow-xl flex items-center justify-center overflow-hidden">
          {/* Internal Bone Structure & Fracture Line Indicator */}
          <div className="absolute inset-x-4 h-6 bg-slate-100 rounded-full flex items-center justify-center opacity-60">
            <span className="text-[9px] font-mono text-slate-700 font-bold tracking-widest uppercase">
              Radius & Ulna
            </span>
          </div>

          {/* Fracture Midshaft Deformity */}
          <div className="relative z-10 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 rounded-full bg-rose-600/40 border border-rose-500/80 flex items-center justify-center"
            >
              <Bone className="w-4 h-4 text-rose-300 rotate-45" />
            </motion.div>
          </div>

          {/* Rigid Splint Board Placement */}
          {splintAligned && (
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute inset-x-2 bottom-1 h-8 bg-amber-700 rounded-lg border-2 border-amber-500 shadow-md flex items-center justify-center z-20"
            >
              <span className="text-[9px] font-black uppercase text-amber-200 tracking-wider">
                Padded Rigid Splint Board
              </span>
            </motion.div>
          )}

          {/* Proximal Joint Immobilization Tie (Above Fracture) */}
          {proximalWrapSecured && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute left-6 inset-y-0 w-8 bg-cyan-700/90 border-x-2 border-cyan-400 z-30 flex items-center justify-center"
            >
              <span className="text-[8px] font-black text-white -rotate-90">WRAP 1</span>
            </motion.div>
          )}

          {/* Distal Joint Immobilization Tie (Below Fracture) */}
          {distalWrapSecured && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute right-6 inset-y-0 w-8 bg-cyan-700/90 border-x-2 border-cyan-400 z-30 flex items-center justify-center"
            >
              <span className="text-[8px] font-black text-white -rotate-90">WRAP 2</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Circulation & CSM Check Indicator */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
            Neurovascular Status: <strong>{circulationChecked ? 'Normal Circulation ✓' : 'Pending Wrap'}</strong>
          </span>
          <span className="text-cyan-400 font-mono text-[11px]">
            Radial Pulse: {circulationChecked ? 'Strong & Regular' : 'Not Verified'}
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="bg-purple-500 h-full rounded-full transition-all duration-300"
            style={{
              width: `${
                circulationChecked ? 100 : distalWrapSecured ? 75 : proximalWrapSecured ? 50 : splintAligned ? 25 : 0
              }%`
            }}
          />
        </div>
      </div>

      {/* Sequential Clinical Procedure Control Buttons */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <button
          onClick={handleAlignSplint}
          disabled={splintAligned}
          className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
            splintAligned
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 cursor-default'
              : 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span>{splintAligned ? '✓ 1. Splint Aligned' : '1. Align Rigid Splint'}</span>
        </button>

        <button
          onClick={handleWrapProximal}
          disabled={proximalWrapSecured}
          className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
            proximalWrapSecured
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 cursor-default'
              : splintAligned
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <ArrowRight className="w-5 h-5" />
          <span>{proximalWrapSecured ? '✓ 2. Joint Above' : '2. Wrap Joint Above'}</span>
        </button>

        <button
          onClick={handleWrapDistal}
          disabled={distalWrapSecured}
          className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
            distalWrapSecured
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 cursor-default'
              : proximalWrapSecured
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <ArrowRight className="w-5 h-5" />
          <span>{distalWrapSecured ? '✓ 3. Joint Below' : '3. Wrap Joint Below'}</span>
        </button>

        <button
          onClick={handleCheckCirculation}
          disabled={circulationChecked}
          className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
            circulationChecked
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 cursor-default'
              : distalWrapSecured
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <HeartPulse className="w-5 h-5" />
          <span>{circulationChecked ? '✓ 4. CSM Verified' : '4. Check Circulation (CSM)'}</span>
        </button>
      </div>
    </div>
  );
};

export default Level5FractureMotion;
