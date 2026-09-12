import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Sparkles, CheckCircle2, AlertCircle, ShieldAlert, Hand } from 'lucide-react';

/**
 * AnatomyChokingTorso - Lateral/Oblique 2D View of Airway, Xiphoid & Navel with Vertical Thrust Gesture
 * Level 4: Choking Response (Heimlich Maneuver & Back Blows)
 */
const AnatomyChokingTorso = ({
  backBlowsCount = 0,
  targetBlows = 5,
  thrustsCount = 0,
  targetThrusts = 5,
  objectExpelled = false,
  isThrusting = false,
  onBackBlow,
  onAbdominalThrust,
  disabled = false
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const isBackBlowsComplete = backBlowsCount >= targetBlows;

  const handleDragEnd = (event, info) => {
    // When dragged upward by at least 30px with negative y offset
    if (info.offset.y < -30) {
      if (onAbdominalThrust) {
        onAbdominalThrust({
          dragVectorY: info.offset.y,
          vectorAccuracy: 95,
          isInwardUpward: true
        });
      }
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
      {/* Interactive Medical Canvas */}
      <div className="relative w-full aspect-[4/3] bg-slate-950/80 rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center p-3">
        {/* Ambient Backlight */}
        <div className="absolute inset-0 bg-radial from-amber-950/20 via-transparent to-transparent pointer-events-none" />

        {/* Foreign Object Ejection Animation from Oral Airway */}
        <AnimatePresence>
          {objectExpelled && (
            <motion.div
              initial={{ y: 0, x: 0, scale: 0.8, opacity: 1 }}
              animate={{ y: -70, x: 50, scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute top-10 left-[48%] z-40 px-3 py-1.5 bg-amber-400 text-slate-950 rounded-full font-black text-xs uppercase shadow-2xl flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Obstruction Expelled!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2D Anatomical Torso (Lateral / Oblique Profile) SVG */}
        <motion.svg
          viewBox="0 0 420 320"
          className="w-full h-full max-h-[290px] select-none"
          animate={isThrusting ? { y: -6, scaleY: 0.96 } : { y: 0, scaleY: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          <defs>
            {/* Lateral Torso Skin Tone */}
            <linearGradient id="lateralSkin" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Trachea & Airway Gradient */}
            <linearGradient id="airwayPath" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.5" />
            </linearGradient>

            {/* Inward-Upward Thrust Vector Arrow Gradient */}
            <linearGradient id="arrowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Oblique Head, Neck & Lateral Profile Outline */}
          {/* Facial profile on right, spine on left */}
          <path
            d="M 120 290 
               C 110 240, 100 180, 105 120 
               C 110 80, 130 50, 150 40 
               C 170 30, 210 20, 240 25
               C 270 30, 280 45, 275 60
               C 270 70, 260 75, 270 90
               C 280 100, 275 115, 255 125
               C 250 145, 265 170, 270 200
               C 275 225, 265 250, 255 270
               C 245 285, 235 290, 230 290
               Z"
            fill="url(#lateralSkin)"
            stroke="#475569"
            strokeWidth="2.5"
          />

          {/* Posterior Interscapular Region (Back Blows Area on Left Spine) */}
          <g transform="translate(100, 130)">
            <ellipse cx="10" cy="10" rx="14" ry="24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
            <text x="-5" y="12" fill="#f59e0b" fontSize="6.5" fontWeight="bold" fontFamily="monospace" transform="rotate(-90 -5,12)">
              BACK BLOWS
            </text>
          </g>

          {/* Pharynx & Tracheal Airway Tube */}
          <path
            d="M 245 55 
               C 240 70, 235 90, 230 115 
               C 225 140, 220 160, 215 180"
            fill="none"
            stroke="url(#airwayPath)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Tracheal Cartilage Rings */}
          <line x1="226" y1="120" x2="234" y2="120" stroke="#bae6fd" strokeWidth="1.5" />
          <line x1="223" y1="130" x2="231" y2="130" stroke="#bae6fd" strokeWidth="1.5" />
          <line x1="220" y1="140" x2="228" y2="140" stroke="#bae6fd" strokeWidth="1.5" />

          {/* Lodged Foreign Body (Airway Obstruction in upper trachea) */}
          {!objectExpelled && (
            <g transform="translate(230, 95)">
              <circle cx="0" cy="0" r="6" fill="#f59e0b" stroke="#d97706" strokeWidth="2" className="animate-pulse" />
              <text x="12" y="3" fill="#f59e0b" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
                OBSTRUCTION
              </text>
            </g>
          )}

          {/* Skeletal Landmarks: Ribcage & Xiphoid Process Tip */}
          <g opacity="0.4">
            <path d="M 125 150 C 170 150, 210 160, 235 175" fill="none" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 125 170 C 170 170, 205 180, 230 195" fill="none" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 125 190 C 165 190, 195 200, 220 215" fill="none" stroke="#94a3b8" strokeWidth="2" />
          </g>

          {/* Xiphoid Process Landmark (Bottom of Sternum) */}
          <polygon points="236,180 242,185 238,192" fill="#38bdf8" />
          <text x="248" y="186" fill="#38bdf8" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
            XIPHOID PROCESS
          </text>

          {/* Umbilicus (Navel / Belly Button) Landmark */}
          <circle cx="260" cy="245" r="3.5" fill="#64748b" stroke="#94a3b8" strokeWidth="1" />
          <text x="268" y="247" fill="#94a3b8" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
            NAVEL (UMBILICUS)
          </text>

          {/* Subdiaphragmatic Abdominal Thrust Hotspot Zone (Midway between Navel & Xiphoid) */}
          <rect
            x="232"
            y="200"
            width="32"
            height="34"
            rx="8"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeDasharray="3 3"
            opacity="0.9"
          />
          <text x="268" y="218" fill="#06b6d4" fontSize="7" fontWeight="bold" fontFamily="monospace">
            THRUST SITE
          </text>

          {/* Vector Thrust Arrow Line */}
          <path
            d="M 248 232 L 244 206"
            stroke="url(#arrowGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
          />
        </motion.svg>

        {/* --- Framer Motion Interactive Gesture Thrust & Back Blow Hotspots --- */}

        {/* 1. Posterior Back Blows Hotspot */}
        {!isBackBlowsComplete && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBackBlow}
            className="absolute top-[38%] left-[16%] p-3 rounded-2xl bg-amber-950/90 border-2 border-amber-400 text-amber-200 shadow-2xl shadow-amber-950/80 flex flex-col items-center justify-center gap-1 z-30 cursor-pointer hover:bg-amber-900"
          >
            <Hand className="w-5 h-5 text-amber-300" />
            <span className="text-[10px] font-black uppercase tracking-wider text-center">
              Heel-of-Hand Back Blow ({backBlowsCount}/{targetBlows})
            </span>
          </motion.button>
        )}

        {/* 2. Interactive Drag Gesture Recognizer for Upward-Inward Thrust */}
        {isBackBlowsComplete && !objectExpelled && (
          <div className="absolute top-[58%] right-[22%] z-30 flex flex-col items-center">
            {/* Animated Upward Arrow Guide */}
            <motion.div
              animate={{ y: [-2, -10, -2], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.65, repeat: Infinity }}
              className="flex items-center gap-1 text-cyan-400 text-[10px] font-black uppercase mb-1 pointer-events-none"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Drag Up & In</span>
            </motion.div>

            {/* Draggable Thrust Fist Controller */}
            <motion.div
              drag="y"
              dragConstraints={{ top: -60, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              whileTap={{ scale: 0.92 }}
              className="w-24 h-20 rounded-2xl bg-gradient-to-t from-cyan-600 to-blue-600 border-2 border-cyan-300 text-white shadow-2xl shadow-cyan-950/80 flex flex-col items-center justify-center p-2 cursor-grab active:cursor-grabbing select-none"
            >
              <ArrowUp className="w-5 h-5 text-yellow-300" />
              <span className="text-[9px] font-black uppercase tracking-wider text-center mt-1">
                Fist Thrust (Above Navel)
              </span>
              <span className="text-[8px] font-mono text-cyan-200 mt-0.5">
                {thrustsCount} / {targetThrusts}
              </span>
            </motion.div>
          </div>
        )}
      </div>

      {/* Maneuver Progress Telemetry Bar */}
      <div className="w-full mt-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
            {!isBackBlowsComplete ? '1. Back Blows' : '2. Abdominal Thrusts'}
          </span>
          <span className="text-slate-400">
            {!isBackBlowsComplete
              ? `Deliver 5 sharp back slaps (${backBlowsCount}/${targetBlows})`
              : `Deliver quick upward thrusts (${thrustsCount}/${targetThrusts})`}
          </span>
        </div>
        <span className={`font-mono text-[11px] ${objectExpelled ? 'text-emerald-400' : 'text-cyan-400'}`}>
          {objectExpelled ? 'Airway Cleared ✓' : 'Obstructed'}
        </span>
      </div>
    </div>
  );
};

export default AnatomyChokingTorso;
