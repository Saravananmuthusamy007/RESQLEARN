import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bone, Shield, CheckCircle2, Activity, ArrowRight, HeartPulse } from 'lucide-react';
import AnatomyLegFracture from '../../simulations/AnatomyLegFracture';

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
      step: 'position_splint',
      target: 'joints_above_and_below',
      action: 'POSITION_SPLINT',
      targetAccuracy: 95,
      isCorrect: true,
      aligned: true,
      feedback: 'Padded rigid splint aligned spanning both the joint above and joint below fracture.'
    });
  };

  const handleWrapProximal = () => {
    if (!splintAligned) {
      onAction({
        step: 'secure_proximal_binding',
        target: 'proximal_joint_elbow',
        action: 'SECURE_BANDAGES',
        targetAccuracy: 50,
        isCorrect: false,
        feedback: 'Position and align the rigid splint before securing bandage wraps!'
      });
      return;
    }
    setProximalWrapSecured(true);
    onAction({
      step: 'secure_proximal_binding',
      target: 'proximal_joint_elbow',
      action: 'SECURE_BANDAGES',
      targetAccuracy: 95,
      isCorrect: true,
      nonConstrictive: true,
      feedback: 'Proximal tie secured above fracture site (elbow joint immobilized).'
    });
  };

  const handleWrapDistal = () => {
    if (!proximalWrapSecured) {
      onAction({
        step: 'secure_distal_binding',
        target: 'distal_joint_wrist',
        action: 'SECURE_BANDAGES',
        targetAccuracy: 60,
        isCorrect: false,
        feedback: 'Secure the proximal joint tie before wrapping distal joint.'
      });
      return;
    }
    setDistalWrapSecured(true);
    onAction({
      step: 'secure_distal_binding',
      target: 'distal_joint_wrist',
      action: 'SECURE_BANDAGES',
      targetAccuracy: 95,
      isCorrect: true,
      nonConstrictive: true,
      feedback: 'Distal tie secured below fracture site (wrist joint immobilized).'
    });
  };

  const handleCheckCirculation = () => {
    if (!distalWrapSecured) {
      onAction({
        step: 'check_circulation',
        target: 'radial_pulse_csm',
        action: 'CHECK_CIRCULATION',
        targetAccuracy: 50,
        isCorrect: false,
        feedback: 'Complete the splint immobilization wraps before neurovascular re-assessment.'
      });
      return;
    }
    setCirculationChecked(true);
    onAction({
      step: 'check_circulation',
      target: 'radial_pulse_csm',
      action: 'CHECK_CIRCULATION',
      targetAccuracy: 100,
      isCorrect: true,
      capillaryRefill: '<2s',
      feedback: 'Circulation, sensation, and motor function (CSM) checked: Strong radial pulse, warm capillary refill (<2s).'
    });
    onAction({
      step: 'fracture_protocol_complete',
      target: 'splinted_limb',
      action: 'COMPLETE',
      targetAccuracy: 100,
      isCorrect: true,
      feedback: 'Fracture immobilization protocol successfully completed!'
    });
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
      {/* Clinical 2D Anatomical Lower Leg & Rigid Splint Simulation */}
      <AnatomyLegFracture
        splintAligned={splintAligned}
        proximalWrapSecured={proximalWrapSecured}
        distalWrapSecured={distalWrapSecured}
        circulationChecked={circulationChecked}
        onAlignSplint={handleAlignSplint}
        onSecureProximal={handleSecureProximal}
        onSecureDistal={handleSecureDistal}
        onCheckCirculation={handleCheckCirculation}
        disabled={isFinished}
      />

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
