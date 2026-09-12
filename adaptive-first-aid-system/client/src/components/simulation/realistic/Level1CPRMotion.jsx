import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity, PhoneCall, Hand, Eye, ShieldCheck } from 'lucide-react';
import AnatomyCPR from '../../simulations/AnatomyCPR';

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
        step: 'chest_compressions',
        target: 'sternum_center',
        action: 'CHEST_COMPRESSIONS',
        targetAccuracy: accuracy,
        isCorrect: true,
        feedback: `30 high-quality compressions completed at 5–6 cm depth!`,
        depthCm: simulatedDepth,
        bpm: 110,
        cycleCount: newCount,
        rhythmPacing: timingMsg,
        autoAdvance: true
      });
      onAction({
        step: 'cpr_protocol_complete',
        target: 'sternum_center',
        action: 'COMPLETE',
        targetAccuracy: 100,
        isCorrect: true,
        feedback: 'CPR protocol successfully completed! Circulation maintained.',
        autoAdvance: true
      });
    } else {
      onAction({
        step: 'chest_compressions',
        target: 'sternum_center',
        action: 'CHEST_COMPRESSIONS',
        targetAccuracy: accuracy,
        isCorrect: true,
        feedback: `Compression ${newCount}/${targetCompressions} • ${simulatedDepth}cm • ${timingMsg}`,
        depthCm: simulatedDepth,
        bpm: 110,
        cycleCount: newCount,
        rhythmPacing: timingMsg,
        autoAdvance: false
      });
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
      {/* Clinical 2D Anatomical Upper Torso & Interactive Hotspots */}
      <AnatomyCPR
        currentStep={currentStep}
        onCompression={handleCompression}
        onClavicleTap={(shoulder) => onAction({
          step: 'check_response',
          target: shoulder || 'shoulders',
          action: 'CHECK_RESPONSIVENESS',
          targetAccuracy: 95,
          isCorrect: true,
          feedback: 'Tapped shoulders: Patient unresponsive to verbal and physical stimuli.'
        })}
        isCompressing={isCompressing}
        compressions={compressions}
        targetCompressions={targetCompressions}
        depthFeedback={depthFeedback}
        rhythmTiming={rhythmTiming}
        disabled={isFinished}
      />

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
            step: 'check_scene',
            target: 'environment',
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
            step: 'check_response',
            target: 'shoulders',
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
            step: 'check_breathing',
            target: 'chest_rise',
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
            step: 'call_emergency',
            target: 'phone_aed',
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
            step: 'position_hands',
            target: 'sternum_hotspot',
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
