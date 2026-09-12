import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bone, CheckCircle2, ShieldCheck, HeartPulse, AlertCircle } from 'lucide-react';

/**
 * AnatomyLegFracture - 2D Anatomical Lower Leg with Tibia/Fibula Fracture, Rigid Splint Snapping & Ties
 * Level 5: Fracture & Sprain Support
 */
const AnatomyLegFracture = ({
  splintAligned = false,
  proximalWrapSecured = false,
  distalWrapSecured = false,
  circulationChecked = false,
  onAlignSplint,
  onSecureProximal,
  onSecureDistal,
  onCheckCirculation,
  disabled = false
}) => {
  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
      {/* Interactive Medical Canvas */}
      <div className="relative w-full aspect-[4/3] bg-slate-950/80 rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center p-3">
        {/* Ambient Backlight */}
        <div className="absolute inset-0 bg-radial from-cyan-950/20 via-transparent to-transparent pointer-events-none" />

        {/* 2D Anatomical Lower Leg Vector SVG */}
        <svg
          viewBox="0 0 460 300"
          className="w-full h-full max-h-[280px] select-none"
        >
          <defs>
            {/* Skin Tone Gradient */}
            <linearGradient id="legSkin" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="30%" stopColor="#334155" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Cortical Bone Shading */}
            <linearGradient id="boneStructure" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.6" />
            </linearGradient>

            {/* Fracture Hematoma & Swelling Glow */}
            <radialGradient id="hematomaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#9f1239" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#881337" stopOpacity="0" />
            </radialGradient>

            {/* Rigid Splint Texture */}
            <linearGradient id="splintBoard" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>

          {/* Lower Leg Silhouette */}
          {/* Thigh & Knee joint on left -> calf & tibia shaft in center -> ankle & foot on right */}
          <path
            d="M 25 100 
               C 60 90, 95 95, 120 100 
               C 170 108, 220 115, 270 115 
               C 320 118, 360 120, 390 125 
               C 415 130, 435 150, 440 170
               C 440 185, 415 195, 380 190
               C 350 185, 320 185, 270 190
               C 220 192, 170 190, 120 185
               C 90 180, 55 185, 25 190 
               Z"
            fill="url(#legSkin)"
            stroke="#475569"
            strokeWidth="2.5"
          />

          {/* Joint Landmark 1: Knee Joint & Patella (Proximal Joint on Left) */}
          <g transform="translate(90, 145)">
            <ellipse cx="0" cy="0" rx="22" ry="36" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="0" cy="-6" r="10" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" opacity="0.7" />
            <text x="0" y="32" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold" fontFamily="monospace">
              PROXIMAL: KNEE JOINT
            </text>
          </g>

          {/* Internal Bone Structure: Tibia & Fibula (Translucent X-Ray View) */}
          {/* Tibia (Large weight-bearing shin bone) */}
          <path
            d="M 90 135 L 210 142 M 245 146 L 360 152"
            stroke="url(#boneStructure)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Fibula (Lateral slender bone) */}
          <path
            d="M 95 158 L 215 162 M 245 164 L 355 168"
            stroke="url(#boneStructure)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Midshaft Fracture & Soft Tissue Swelling Deformity */}
          <g transform="translate(230, 148)">
            {/* Hematoma / Ecchymosis Swelling */}
            <ellipse cx="0" cy="0" rx="34" ry="22" fill="url(#hematomaGlow)" />
            {/* Angulation Deformity Line */}
            <path
              d="M -16 -8 L 0 6 L 16 -6"
              fill="none"
              stroke="#fb7185"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <text x="0" y="-14" textAnchor="middle" fill="#f43f5e" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
              CLOSED MIDSHAFT FRACTURE
            </text>
          </g>

          {/* Joint Landmark 2: Ankle Joint & Malleoli (Distal Joint on Right) */}
          <g transform="translate(370, 150)">
            <ellipse cx="0" cy="0" rx="20" ry="30" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="-5" cy="-8" r="4" fill="#94a3b8" opacity="0.7" />
            <circle cx="5" cy="8" r="4" fill="#94a3b8" opacity="0.7" />
            <text x="0" y="28" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold" fontFamily="monospace">
              DISTAL: ANKLE JOINT
            </text>
          </g>

          {/* Dorsalis Pedis Pulse Landmark (Top of foot / distal to ankle) */}
          <g transform="translate(415, 145)">
            <circle cx="0" cy="0" r="4" fill="#f43f5e" className="animate-ping" opacity="0.8" />
            <text x="-5" y="-10" textAnchor="middle" fill="#f43f5e" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
              PEDAL PULSE
            </text>
          </g>
        </svg>

        {/* --- Framer Motion Interactive Splint & Tie Overlays --- */}

        {/* 1. Rigid Splint Board Placement Guide (Spans across knee to past ankle) */}
        <AnimatePresence>
          {splintAligned && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="absolute bottom-6 inset-x-8 h-8 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 border-2 border-amber-400 shadow-2xl flex items-center justify-between px-4 z-20"
            >
              <span className="text-[10px] font-black uppercase text-amber-200 tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Padded Rigid Splint (Immobilizes Above Knee to Past Ankle)
              </span>
              <span className="text-[9px] font-mono text-amber-300 font-bold">
                Length: 55 cm
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Proximal Tie (Above Fracture / Below Knee) */}
        <AnimatePresence>
          {proximalWrapSecured && (
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute left-[34%] top-[34%] w-10 h-28 bg-cyan-950/90 border-2 border-cyan-400 rounded-xl shadow-xl z-30 flex flex-col items-center justify-center p-1"
            >
              <span className="text-[8px] font-black uppercase text-cyan-300 -rotate-90">
                PROXIMAL TIE
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Distal Tie (Below Fracture / Above Ankle) */}
        <AnimatePresence>
          {distalWrapSecured && (
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute right-[34%] top-[34%] w-10 h-28 bg-cyan-950/90 border-2 border-cyan-400 rounded-xl shadow-xl z-30 flex flex-col items-center justify-center p-1"
            >
              <span className="text-[8px] font-black uppercase text-cyan-300 -rotate-90">
                DISTAL TIE
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Splinting Sequence Controls */}
      <div className="w-full mt-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Bone className="w-4 h-4 text-cyan-400" />
            Immobilization Sequence:
          </span>
          <span className="text-[11px] text-cyan-400 font-mono">
            {circulationChecked ? 'Protocol Fully Verified ✓' : 'Follow Clinical Order'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Step 1: Align Splint */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAlignSplint}
            disabled={splintAligned || disabled}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
              splintAligned
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 hover:border-cyan-500 text-slate-200 cursor-pointer'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mb-1 text-cyan-400" />
            <span className="text-[10px] font-bold">1. Align Splint</span>
            <span className="text-[8px] text-slate-400">{splintAligned ? 'Aligned ✓' : 'Span Both Joints'}</span>
          </motion.button>

          {/* Step 2: Proximal Tie */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSecureProximal}
            disabled={!splintAligned || proximalWrapSecured || disabled}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
              proximalWrapSecured
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : (!splintAligned
                  ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800/80 border-slate-700 hover:border-cyan-500 text-slate-200 cursor-pointer')
            }`}
          >
            <div className="w-4 h-4 border border-cyan-400 rounded-sm mb-1 flex items-center justify-center text-[8px] font-mono text-cyan-300">
              P
            </div>
            <span className="text-[10px] font-bold">2. Proximal Tie</span>
            <span className="text-[8px] text-slate-400">{proximalWrapSecured ? 'Tied ✓' : 'Above Fracture'}</span>
          </motion.button>

          {/* Step 3: Distal Tie */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSecureDistal}
            disabled={!proximalWrapSecured || distalWrapSecured || disabled}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
              distalWrapSecured
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : (!proximalWrapSecured
                  ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800/80 border-slate-700 hover:border-cyan-500 text-slate-200 cursor-pointer')
            }`}
          >
            <div className="w-4 h-4 border border-cyan-400 rounded-sm mb-1 flex items-center justify-center text-[8px] font-mono text-cyan-300">
              D
            </div>
            <span className="text-[10px] font-bold">3. Distal Tie</span>
            <span className="text-[8px] text-slate-400">{distalWrapSecured ? 'Tied ✓' : 'Below Fracture'}</span>
          </motion.button>

          {/* Step 4: Circulation / CSM Check */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onCheckCirculation}
            disabled={!distalWrapSecured || circulationChecked || disabled}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
              circulationChecked
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : (!distalWrapSecured
                  ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800/80 border-slate-700 hover:border-cyan-500 text-slate-200 cursor-pointer')
            }`}
          >
            <HeartPulse className="w-4 h-4 mb-1 text-rose-400 animate-pulse" />
            <span className="text-[10px] font-bold">4. CSM Pulse Check</span>
            <span className="text-[8px] text-slate-400">{circulationChecked ? 'Intact ✓' : 'Check Pedal Pulse'}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AnatomyLegFracture;
