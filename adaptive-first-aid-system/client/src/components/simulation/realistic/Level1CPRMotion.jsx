import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity, PhoneCall, Hand, Eye, ShieldCheck } from 'lucide-react';

const Level1CPRMotion = ({ currentStep, onAction, isFinished }) => {
  const [compressions, setCompressions] = useState(0);
  const [depthFeedback, setDepthFeedback] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [rhythmTiming, setRhythmTiming] = useState('Perfect (110 BPM)');
  const lastPressTimeRef = useRef(Date.now());

  const targetCompressions = 30;

  const handleCompression = () => {
    if (isFinished) return;
    if (currentStep !== 'CHEST_COMPRESSIONS') {
      onAction({
        action: 'CHEST_COMPRESSIONS',
        targetAccuracy: 50,
        isCorrect: false,
        feedback: 'Follow proper protocol order: Assess patient responsiveness & breathing before compressions.',
        autoAdvance: false
      });
      return;
    }

    const now = Date.now();
    const interval = now - lastPressTimeRef.current;
    lastPressTimeRef.current = now;

    // Evaluate compression rate (100-120 bpm = 500-600ms interval)
    let accuracy = 95;
    let timingMsg = 'Perfect Rhythm (110 BPM)';
    if (compressions > 0) {
      if (interval < 450) {
        timingMsg = 'Too Fast (Slow down slightly)';
        accuracy = 80;
      } else if (interval > 650) {
        timingMsg = 'Too Slow (Pick up the beat)';
        accuracy = 82;
      }
    }
    setRhythmTiming(timingMsg);

    // Simulated clinical depth (target 5.0 - 6.0 cm)
    const simulatedDepth = (5.0 + Math.random() * 0.8).toFixed(1);
    setDepthFeedback(`${simulatedDepth} cm (Target: 5–6 cm)`);

    setIsCompressing(true);
    setTimeout(() => setIsCompressing(false), 120);

    const newCount = compressions + 1;
    setCompressions(newCount);

    if (newCount >= targetCompressions) {
      onAction({
        action: 'CHEST_COMPRESSIONS',
        targetAccuracy: accuracy,
        isCorrect: true,
        feedback: `30 high-quality compressions completed at 5–6 cm depth!`,
        autoAdvance: true
      });
      onAction({
        action: 'COMPLETE',
        targetAccuracy: 100,
        isCorrect: true,
        feedback: 'CPR protocol successfully completed! Circulation maintained.',
        autoAdvance: true
      });
    } else {
      onAction({
        action: 'CHEST_COMPRESSIONS',
        targetAccuracy: accuracy,
        isCorrect: true,
        feedback: `Compression ${newCount}/${targetCompressions} • ${simulatedDepth}cm • ${timingMsg}`,
        autoAdvance: false
      });
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
      {/* Patient Torso & Anatomical Target Area */}
      <div className="relative w-full max-w-md h-64 bg-slate-900 rounded-3xl border-2 border-slate-700/80 flex flex-col items-center justify-center overflow-hidden shadow-inner">
        {/* Ambient Medical Pulse Background Glow */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-44 h-44 rounded-full bg-rose-500/20 blur-xl pointer-events-none"
        />

        {/* Anatomical Torso Outline */}
        <div className="relative w-64 h-52 bg-slate-800/90 rounded-t-[50px] rounded-b-2xl border border-slate-600/60 p-4 flex flex-col items-center shadow-lg">
          {/* Patient Neck & Head Silhouette */}
          <div className="w-16 h-8 bg-slate-700/80 rounded-t-full -mt-7 border-t border-x border-slate-600/60" />

          {/* Ribcage Outline Visuals */}
          <div className="w-full flex justify-between px-6 mt-2 opacity-30">
            <div className="space-y-2">
              <div className="w-12 h-1 bg-slate-400 rounded-full rotate-6" />
              <div className="w-14 h-1 bg-slate-400 rounded-full rotate-6" />
              <div className="w-10 h-1 bg-slate-400 rounded-full rotate-6" />
            </div>
            <div className="space-y-2">
              <div className="w-12 h-1 bg-slate-400 rounded-full -rotate-6" />
              <div className="w-14 h-1 bg-slate-400 rounded-full -rotate-6" />
              <div className="w-10 h-1 bg-slate-400 rounded-full -rotate-6" />
            </div>
          </div>

          {/* Sternum Center Compression Hotspot */}
          <div className="mt-3 relative flex flex-col items-center">
            {/* 100-120 BPM Metronome Concentric Rhythm Ring */}
            <motion.div
              animate={{ scale: [1, 1.45, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 0.54, repeat: Infinity, ease: 'easeOut' }}
              className="absolute -inset-4 rounded-full border-2 border-rose-500/60 pointer-events-none"
            />

            <motion.button
              animate={isCompressing ? { scale: 0.88, y: 8 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              onClick={handleCompression}
              className={`w-24 h-24 rounded-full flex flex-col items-center justify-center p-2 shadow-2xl transition-all border-4 relative z-10 ${
                currentStep === 'CHEST_COMPRESSIONS'
                  ? 'bg-gradient-to-b from-rose-600 to-red-700 border-rose-400 text-white cursor-pointer hover:shadow-rose-600/50'
                  : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Heart className={`w-6 h-6 ${isCompressing ? 'text-yellow-300 fill-yellow-300' : 'text-white'}`} />
              <span className="text-[10px] font-black uppercase tracking-wider mt-1">
                {currentStep === 'CHEST_COMPRESSIONS' ? 'PUSH 5 CM' : 'STERNUM'}
              </span>
            </motion.button>
          </div>

          {/* Real-time Depth Feedback Indicator */}
          {depthFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 bg-slate-950/90 border border-slate-700/80 px-3 py-1 rounded-full text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 shadow"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Depth: {depthFeedback}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Rhythm Metronome & Compressions Progress Bar */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
            CPR Progress: <strong>{compressions} / {targetCompressions} Compressions</strong>
          </span>
          <span className="text-cyan-400 font-mono text-[11px]">{rhythmTiming}</span>
        </div>

        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <motion.div
            className="bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 h-full rounded-full"
            style={{ width: `${Math.min(100, (compressions / targetCompressions) * 100)}%` }}
          />
        </div>
      </div>

      {/* Sequential Clinical Procedure Buttons */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        <button
          onClick={() => onAction({
            action: 'OBSERVE_VICTIM',
            targetAccuracy: 100,
            isCorrect: true,
            feedback: 'Scene safety verified: No electrical, fire, or chemical hazards.'
          })}
          className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 text-center transition ${
            currentStep === 'OBSERVE_VICTIM'
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[11px]">1. Scene Safety</span>
        </button>

        <button
          onClick={() => onAction({
            action: 'CHECK_RESPONSIVENESS',
            targetAccuracy: 95,
            isCorrect: true,
            feedback: 'Tapped shoulders: Patient unresponsive to verbal and physical stimuli.'
          })}
          className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 text-center transition ${
            currentStep === 'CHECK_RESPONSIVENESS'
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Hand className="w-4 h-4" />
          <span className="text-[11px]">2. Tap Shoulders</span>
        </button>

        <button
          onClick={() => onAction({
            action: 'CHECK_BREATHING',
            targetAccuracy: 95,
            isCorrect: true,
            feedback: 'Checked chest & breathing for 5-10s: No normal respiratory effort.'
          })}
          className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 text-center transition ${
            currentStep === 'CHECK_BREATHING'
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span className="text-[11px]">3. Check Breath</span>
        </button>

        <button
          onClick={() => onAction({
            action: 'CALL_EMERGENCY',
            targetAccuracy: 100,
            isCorrect: true,
            feedback: '911 Emergency EMS called & AED requested immediately.'
          })}
          className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 text-center transition ${
            currentStep === 'CALL_EMERGENCY'
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span className="text-[11px]">4. Call 911/AED</span>
        </button>

        <button
          onClick={() => onAction({
            action: 'POSITION_HANDS',
            targetAccuracy: 95,
            isCorrect: true,
            feedback: 'Heel of hand placed on lower half of sternum with interlaced fingers.'
          })}
          className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 text-center transition ${
            currentStep === 'POSITION_HANDS'
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span className="text-[11px]">5. Align Hands</span>
        </button>
      </div>
    </div>
  );
};

export default Level1CPRMotion;
