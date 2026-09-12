import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertCircle, Sparkles, HeartPulse } from 'lucide-react';

/**
 * AnatomyArmWound - 2D Anatomical Forearm & Active Bleeding Laceration with Draggable Medical Tray
 * Level 2: Wound Care & Bleeding Control
 */
const AnatomyArmWound = ({
  glovesWorn = false,
  gauzeApplied = false,
  isPressing = false,
  pressureTimer = 0,
  pressureTargetSec = 10,
  bandageApplied = false,
  onWearGloves,
  onApplyGauze,
  onTogglePressure,
  onApplyBandage,
  disabled = false
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [woundHovered, setWoundHovered] = useState(false);

  // Handle drop or click directly onto wound target
  const handleDropOnWound = () => {
    if (draggedItem === 'gauze' || !gauzeApplied) {
      if (onApplyGauze) onApplyGauze();
    } else if (draggedItem === 'bandage' || (gauzeApplied && !bandageApplied)) {
      if (onApplyBandage) onApplyBandage();
    }
    setDraggedItem(null);
    setWoundHovered(false);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
      {/* Interactive Medical Canvas */}
      <div className="relative w-full aspect-[4/3] bg-slate-950/80 rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center p-3">
        {/* Ambient Medical Backlight */}
        <div className="absolute inset-0 bg-radial from-rose-950/20 via-transparent to-transparent pointer-events-none" />

        {/* 2D Anatomical Forearm & Palm Vector SVG */}
        <svg
          viewBox="0 0 460 300"
          className="w-full h-full max-h-[280px] select-none"
        >
          <defs>
            {/* Skin tone gradient with vascular shading */}
            <linearGradient id="armSkin" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="40%" stopColor="#334155" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Radial Artery Glow Gradient */}
            <linearGradient id="radialArtery" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
            </linearGradient>

            {/* Bleeding Wound Crimson Gradient */}
            <radialGradient id="bloodFlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#991b1b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Extended Forearm and Palm Silhouette */}
          {/* Upper forearm entry on left, narrowing wrist in center, opening into hand & thumb on right */}
          <path
            d="M 30 110 
               C 80 100, 140 110, 220 120 
               C 270 125, 300 115, 340 105 
               C 360 100, 390 105, 420 120
               C 440 135, 435 150, 420 160
               C 395 165, 375 160, 350 170
               C 330 185, 300 190, 240 185
               C 160 180, 100 190, 30 195 
               Z"
            fill="url(#armSkin)"
            stroke="#475569"
            strokeWidth="2.5"
          />

          {/* Wrist Joint Crease & Landmarks */}
          <path
            d="M 285 125 C 290 150, 290 165, 285 185"
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            opacity="0.6"
          />
          <text x="285" y="115" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">
            VOLAR WRIST
          </text>

          {/* Palm & Thumb Contour Line */}
          <path
            d="M 345 108 C 360 85, 380 90, 390 110"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            opacity="0.7"
          />
          {/* Fingers Indications */}
          <path
            d="M 390 115 L 430 125 M 395 130 L 435 140 M 390 145 L 425 155"
            stroke="#475569"
            strokeWidth="1.5"
            opacity="0.5"
          />

          {/* Anatomical Radial Artery Course (Pulsating Red Line) */}
          <path
            d="M 40 140 C 120 145, 200 148, 280 142 C 310 140, 335 135, 350 130"
            fill="none"
            stroke="url(#radialArtery)"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            opacity="0.7"
          />
          <circle cx="280" cy="142" r="4" fill="#f43f5e" opacity="0.8" className="animate-ping" />
          <text x="270" y="132" fill="#f43f5e" fontSize="7" fontWeight="bold" fontFamily="monospace">
            RADIAL PULSE
          </text>

          {/* Active Laceration / Bleeding Wound Site (Center Forearm) */}
          <g transform="translate(180, 145)">
            {/* Laceration Wound Margin Outline */}
            <path
              d="M -30 -6 Q -15 8, 0 -2 Q 15 -10, 30 4 Q 10 12, -10 6 Z"
              fill="#450a0a"
              stroke="#991b1b"
              strokeWidth="2"
            />

            {/* Active Arterial / Venous Hemorrhage Pool (Fades if gauze applied) */}
            <ellipse
              cx="0"
              cy="2"
              rx="38"
              ry="18"
              fill="url(#bloodFlow)"
              opacity={bandageApplied ? 0.05 : (gauzeApplied ? 0.2 : 0.9)}
              className={!gauzeApplied ? 'animate-pulse' : ''}
            />

            {/* Blood droplets trickle */}
            {!bandageApplied && !gauzeApplied && (
              <>
                <circle cx="-15" cy="18" r="3" fill="#dc2626" opacity="0.8" />
                <circle cx="10" cy="22" r="2.5" fill="#dc2626" opacity="0.8" />
                <circle cx="25" cy="16" r="2" fill="#b91c1c" opacity="0.7" />
              </>
            )}
          </g>

          {/* Anatomical Target Area Boundary Indicator */}
          <rect
            x="140"
            y="120"
            width="80"
            height="55"
            rx="12"
            fill="none"
            stroke={woundHovered ? '#38bdf8' : '#e11d48'}
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.8"
          />
          <text x="180" y="112" textAnchor="middle" fill="#f43f5e" fontSize="8" fontWeight="bold" fontFamily="monospace">
            ACTIVE LACERATION SITE
          </text>
        </svg>

        {/* --- Framer Motion Interactive Overlays --- */}

        {/* 1. Dropped/Applied Sterile Gauze Pad */}
        <AnimatePresence>
          {gauzeApplied && (
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute top-[48%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-28 h-20 bg-slate-100 rounded-xl border-2 border-dashed border-slate-400 shadow-2xl flex flex-col items-center justify-center p-2 z-20 pointer-events-none"
            >
              <div className="w-full h-full border border-slate-300 rounded-lg flex flex-col items-center justify-center bg-white/90">
                <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                  STERILE GAUZE
                </span>
                <span className="text-[8px] font-mono text-slate-500 mt-0.5">
                  100% Hemostatic Pad
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Direct Pressure Interactive Hand Overlay */}
        {isPressing && (
          <motion.div
            animate={{ scale: [1, 0.95, 1], y: [0, 2, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[48%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-32 h-24 bg-cyan-950/80 border-2 border-cyan-400 rounded-2xl backdrop-blur-md z-30 flex flex-col items-center justify-center shadow-2xl shadow-cyan-950/80"
          >
            <span className="text-xs font-black uppercase text-cyan-200 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Continuous Pressure
            </span>
            <span className="text-xl font-black font-mono text-cyan-400 mt-1">
              {pressureTimer}s / {pressureTargetSec}s
            </span>
            <span className="text-[9px] text-cyan-300/80 uppercase tracking-widest font-semibold mt-0.5">
              Firm Two-Hand Seal
            </span>
          </motion.div>
        )}

        {/* 3. Circular Wrapping Pressure Bandage Animation */}
        <AnimatePresence>
          {bandageApplied && (
            <motion.div
              initial={{ scale: 0.5, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="absolute top-[48%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-36 h-28 bg-gradient-to-r from-amber-100 via-stone-200 to-amber-100 rounded-2xl border-4 border-amber-300 shadow-2xl z-30 flex flex-col items-center justify-center p-3"
            >
              {/* Wrapping Tension Stripes */}
              <div className="w-full flex justify-between px-2 mb-1 opacity-60">
                <div className="w-2 h-14 bg-amber-400/50 rounded-full" />
                <div className="w-2 h-14 bg-amber-400/50 rounded-full" />
                <div className="w-2 h-14 bg-amber-400/50 rounded-full" />
              </div>
              <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Snug Roller Bandage
              </span>
              <span className="text-[9px] font-bold text-amber-800 mt-0.5 flex items-center gap-1">
                <HeartPulse className="w-3 h-3 text-rose-500" /> Radial Pulse Normal (Not Constrictive)
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Drop / Click Hotspot over Wound */}
        <div
          onClick={handleDropOnWound}
          onMouseEnter={() => setWoundHovered(true)}
          onMouseLeave={() => setWoundHovered(false)}
          className="absolute top-[48%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-28 h-20 rounded-2xl cursor-pointer z-20 hover:ring-2 hover:ring-cyan-400/60 transition"
          title="Click to apply sterile item or maintain pressure"
        />
      </div>

      {/* Draggable Medical Tray Items */}
      <div className="w-full mt-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2.5">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Sterile Field Medical Tray:
          </span>
          <span className="text-[11px] text-slate-400">
            {bandageApplied ? 'Procedure Completed ✓' : 'Select or Tap Item'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Tool 1: Protective Gloves */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onWearGloves}
            disabled={glovesWorn || disabled}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
              glovesWorn
                ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-400/40'
                : 'bg-slate-800/80 border-slate-700 hover:border-cyan-500 text-slate-200 cursor-pointer'
            }`}
          >
            <ShieldCheck className={`w-5 h-5 mb-1 ${glovesWorn ? 'text-emerald-400' : 'text-cyan-400'}`} />
            <span className="text-[11px] font-bold">1. PPE Gloves</span>
            <span className="text-[9px] text-slate-400">{glovesWorn ? 'Donned ✓' : 'Tap to Wear'}</span>
          </motion.button>

          {/* Tool 2: Sterile Gauze Pad */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onApplyGauze}
            disabled={gauzeApplied || disabled}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
              gauzeApplied
                ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-400/40'
                : 'bg-slate-800/80 border-slate-700 hover:border-cyan-500 text-slate-200 cursor-pointer'
            }`}
          >
            <div className="w-5 h-5 border-2 border-dashed border-cyan-400 rounded mb-1 flex items-center justify-center text-[9px] font-mono text-cyan-300">
              G
            </div>
            <span className="text-[11px] font-bold">2. Sterile Gauze</span>
            <span className="text-[9px] text-slate-400">{gauzeApplied ? 'Applied ✓' : 'Place on Wound'}</span>
          </motion.button>

          {/* Tool 3: Elastic Roller Bandage */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onApplyBandage}
            disabled={!gauzeApplied || bandageApplied || disabled}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
              bandageApplied
                ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-400/40'
                : (!gauzeApplied
                  ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800/80 border-slate-700 hover:border-cyan-500 text-slate-200 cursor-pointer')
            }`}
          >
            <div className="w-5 h-5 rounded-full border-2 border-amber-400 mb-1 flex items-center justify-center text-[9px] font-mono text-amber-300">
              B
            </div>
            <span className="text-[11px] font-bold">3. Pressure Bandage</span>
            <span className="text-[9px] text-slate-400">{bandageApplied ? 'Secured ✓' : 'Wrap Snugly'}</span>
          </motion.button>
        </div>

        {/* Direct Pressure Action Button (Active once Gauze is placed) */}
        {gauzeApplied && !bandageApplied && (
          <div className="mt-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onTogglePressure}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                isPressing
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-950/50'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>{isPressing ? 'Release Pressure' : 'Apply Continuous Direct Pressure (Hold 10s)'}</span>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnatomyArmWound;
