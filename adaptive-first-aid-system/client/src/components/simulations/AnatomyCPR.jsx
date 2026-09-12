import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Hand, Sparkles } from 'lucide-react';

/**
 * AnatomyCPR - 2D Anatomical SVG Upper Torso Illustration & Framer Motion CPR Mechanics
 * Level 1: CPR & Response Check
 */
const AnatomyCPR = ({
  currentStep,
  onCompression,
  onClavicleTap,
  isCompressing = false,
  compressions = 0,
  targetCompressions = 30,
  depthFeedback = null,
  rhythmTiming = 'Perfect (110 BPM)',
  disabled = false
}) => {
  const isCompressionPhase = currentStep === 'CHEST_COMPRESSIONS';
  const isResponsivenessPhase = currentStep === 'OBSERVE_VICTIM' || currentStep === 'CHECK_RESPONSIVENESS';

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
      {/* SVG Container with Anatomical Upper Torso */}
      <div className="relative w-full aspect-[4/3] bg-slate-950/80 rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center p-2">
        {/* Ambient Pulse Glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 0.54, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-60 h-60 rounded-full bg-rose-500/20 blur-3xl pointer-events-none"
        />

        {/* Anatomical Torso SVG */}
        <motion.svg
          viewBox="0 0 400 320"
          className="w-full h-full max-h-[300px] select-none"
          animate={isCompressing ? { scaleY: 0.94, y: 4 } : { scaleY: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          <defs>
            {/* Gradients for anatomical shading */}
            <linearGradient id="torsoSkin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="sternumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
            </linearGradient>

            <filter id="neonGlowRose" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="neonGlowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Torso Outer Silhouette */}
          <path
            d="M 130 50 
               C 120 70, 70 85, 40 120 
               C 20 145, 25 210, 35 300 
               L 365 300 
               C 375 210, 380 145, 360 120 
               C 330 85, 280 70, 270 50 
               Z"
            fill="url(#torsoSkin)"
            stroke="#334155"
            strokeWidth="2"
          />

          {/* Head & Neck (Supine, slight head-tilt chin-lift) */}
          <path
            d="M 170 50 L 170 25 C 170 12, 180 5, 200 5 C 220 5, 230 12, 230 25 L 230 50 Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="1.5"
          />
          {/* Jawline & Chin Contour */}
          <path
            d="M 185 30 Q 200 40 215 30"
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Bilateral Clavicles (Collarbones) */}
          <path
            d="M 140 70 Q 170 65 195 72"
            fill="none"
            stroke="#64748b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 260 70 Q 230 65 205 72"
            fill="none"
            stroke="#64748b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Symmetrical Ribcage (True & False Ribs 1 to 8) */}
          <g opacity="0.35">
            {/* Left Ribs */}
            <path d="M 190 95 C 150 95, 110 110, 95 130" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M 190 115 C 145 115, 100 130, 85 150" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M 190 135 C 140 135, 95 150, 80 170" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M 190 155 C 140 155, 95 170, 80 190" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M 190 175 C 145 175, 105 190, 90 210" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M 190 195 C 150 195, 115 210, 100 230" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

            {/* Right Ribs */}
            <path d="M 210 95 C 250 95, 290 110, 305 130" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M 210 115 C 255 115, 300 130, 315 150" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M 210 135 C 260 135, 305 150, 320 170" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M 210 155 C 260 155, 305 170, 320 190" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M 210 175 C 255 175, 295 190, 310 210" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M 210 195 C 250 195, 285 210, 300 230" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Pectoral & Intermammary Reference Markers */}
          <line x1="110" y1="170" x2="290" y2="170" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="115" cy="170" r="3" fill="#475569" opacity="0.5" />
          <circle cx="285" cy="170" r="3" fill="#475569" opacity="0.5" />
          <text x="75" y="165" fill="#64748b" fontSize="8" fontFamily="monospace" opacity="0.7">NIPPLE LINE</text>

          {/* Sternum Structure (Manubrium -> Body -> Xiphoid) */}
          <g>
            {/* Manubrium */}
            <path d="M 193 72 L 207 72 L 205 90 L 195 90 Z" fill="#475569" opacity="0.7" />
            {/* Sternal Body Line */}
            <line x1="200" y1="90" x2="200" y2="200" stroke="url(#sternumGrad)" strokeWidth="8" strokeLinecap="round" />
            {/* Sternal Segments */}
            <line x1="196" y1="115" x2="204" y2="115" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
            <line x1="196" y1="140" x2="204" y2="140" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
            <line x1="196" y1="165" x2="204" y2="165" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
            {/* Xiphoid Process Tip */}
            <polygon points="197,200 203,200 200,210" fill="#0284c7" />
          </g>

          {/* Lower Half of Sternum Target Landmark Box (Clinical Landmark) */}
          <rect
            x="184"
            y="145"
            width="32"
            height="46"
            rx="6"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            opacity="0.8"
          />
          <text x="200" y="140" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold" fontFamily="monospace">
            LOWER STERNUM
          </text>
        </motion.svg>

        {/* --- Interactive Framer Motion Overlays --- */}

        {/* 1. Shoulder Clavicle Tap Hotspots (Response Check) */}
        {isResponsivenessPhase && (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onClavicleTap && onClavicleTap('left_shoulder')}
              className="absolute top-[22%] left-[24%] p-2 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-950/60 flex items-center gap-1.5 text-[10px] font-bold z-20 hover:bg-cyan-900"
            >
              <Hand className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tap Left Shoulder</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onClavicleTap && onClavicleTap('right_shoulder')}
              className="absolute top-[22%] right-[24%] p-2 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-950/60 flex items-center gap-1.5 text-[10px] font-bold z-20 hover:bg-cyan-900"
            >
              <Hand className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tap Right Shoulder</span>
            </motion.button>
          </>
        )}

        {/* 2. Prominent Sternum Compression Hotspot */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
          {/* Concentric Pulsing Rhythm Rings (100–120 bpm = 0.54s) */}
          {isCompressionPhase && (
            <>
              <motion.div
                animate={{ scale: [1, 1.45], opacity: [0.85, 0] }}
                transition={{ duration: 0.54, repeat: Infinity, ease: 'easeOut' }}
                className="absolute -inset-4 rounded-full border-2 border-rose-500/70 pointer-events-none"
              />
              <motion.div
                animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
                transition={{ duration: 0.54, repeat: Infinity, ease: 'easeOut', delay: 0.15 }}
                className="absolute -inset-8 rounded-full border border-rose-400/40 pointer-events-none"
              />
            </>
          )}

          {/* Main Compression Sternal Pad Button */}
          <motion.button
            whileTap={{ scale: 0.88, y: 4 }}
            onClick={onCompression}
            disabled={disabled}
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center p-2 shadow-2xl transition-all border-4 select-none ${
              isCompressionPhase
                ? 'bg-gradient-to-b from-rose-600 to-red-800 border-rose-400 text-white cursor-pointer hover:shadow-rose-600/60 ring-4 ring-rose-500/30'
                : 'bg-slate-900/90 border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Heart className={`w-7 h-7 ${isCompressing ? 'text-yellow-300 fill-yellow-300 animate-ping' : 'text-white'}`} />
            <span className="text-[11px] font-black uppercase tracking-wider mt-1 text-center leading-tight">
              {isCompressionPhase ? 'PUSH 5-6 CM' : 'STERNUM'}
            </span>
            <span className="text-[9px] font-mono text-rose-200 opacity-80 mt-0.5">
              {compressions}/{targetCompressions}
            </span>
          </motion.button>
        </div>

        {/* Real-time Depth Feedback Indicator Overlay */}
        {depthFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-3 bg-slate-950/95 border border-slate-700/90 px-3.5 py-1.5 rounded-full text-xs font-mono text-emerald-400 font-bold flex items-center gap-2 shadow-xl z-30"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>{depthFeedback}</span>
          </motion.div>
        )}
      </div>

      {/* Metronome Bar & Pacing Telemetry */}
      <div className="w-full mt-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>Compression Rhythm:</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-mono text-cyan-400 font-bold text-[11px]">
          {rhythmTiming}
        </span>
      </div>
    </div>
  );
};

export default AnatomyCPR;
