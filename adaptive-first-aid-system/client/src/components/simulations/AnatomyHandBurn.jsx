import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Thermometer, CheckCircle2, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

/**
 * AnatomyHandBurn - 2D Anatomical Hand/Wrist Second-Degree Thermal Burn with Dynamic Cooling Water
 * Level 3: Burns Management
 */
const AnatomyHandBurn = ({
  isWaterRunning = false,
  coolingMinutes = 0,
  targetCoolingMinutes = 20,
  dressingApplied = false,
  onToggleWater,
  onApplyDressing,
  onApplyIce,
  disabled = false
}) => {
  // Temperature calculation: starts at 44°C (hot burn), cools down to 21°C (physiological room temp cooling)
  const calculatedTemp = Math.max(21, Math.round(44 - (coolingMinutes / targetCoolingMinutes) * 23));
  const isAdequatelyCooled = coolingMinutes >= 10;

  // Temperature color interpolation: red -> amber -> cyan/blue
  const tempColor = calculatedTemp > 35 ? '#ef4444' : (calculatedTemp > 28 ? '#f59e0b' : '#38bdf8');

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
      {/* Interactive Medical Canvas */}
      <div className="relative w-full aspect-[4/3] bg-slate-950/80 rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center p-3">
        {/* Ambient Thermal Glow (Fades as cooling progresses) */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: isAdequatelyCooled ? 0.05 : [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: tempColor }}
        />

        {/* 2D Anatomical Hand & Wrist Vector SVG */}
        <svg
          viewBox="0 0 460 300"
          className="w-full h-full max-h-[280px] select-none"
        >
          <defs>
            {/* Skin Gradient */}
            <linearGradient id="handSkin" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="35%" stopColor="#334155" />
              <stop offset="75%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Second-Degree Erythema Heat Shading */}
            <radialGradient id="burnErythema" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={tempColor} stopOpacity={isAdequatelyCooled ? 0.35 : 0.85} />
              <stop offset="65%" stopColor="#be123c" stopOpacity={isAdequatelyCooled ? 0.2 : 0.6} />
              <stop offset="100%" stopColor="#881337" stopOpacity="0" />
            </radialGradient>

            {/* Tap Chrome Finish */}
            <linearGradient id="tapMetal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Cool Water Stream Gradient */}
            <linearGradient id="waterFlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Anatomical Hand & Dorsal Forearm Silhouette */}
          {/* Forearm entering left -> wrist center -> metacarpals & digits on right */}
          <path
            d="M 20 115 
               C 80 110, 130 118, 180 120 
               C 220 122, 250 115, 290 100 
               C 320 85, 340 75, 365 75 
               C 380 75, 385 90, 360 105 
               C 390 100, 415 105, 425 118
               C 435 130, 420 142, 380 140 
               C 420 150, 425 165, 400 175
               C 370 185, 350 175, 320 180
               C 270 190, 220 185, 170 182
               C 120 180, 70 188, 20 195 
               Z"
            fill="url(#handSkin)"
            stroke="#475569"
            strokeWidth="2.5"
          />

          {/* Dorsal Hand Veins & Tendon Creases */}
          <path
            d="M 210 135 Q 260 145 310 130"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.4"
          />
          <path
            d="M 220 160 Q 270 165 315 160"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.4"
          />

          {/* Metacarpophalangeal Knuckle Landmarks */}
          <circle cx="310" cy="115" r="3" fill="#64748b" opacity="0.6" />
          <circle cx="320" cy="138" r="3" fill="#64748b" opacity="0.6" />
          <circle cx="315" cy="162" r="3" fill="#64748b" opacity="0.6" />

          {/* Second-Degree Burn Area (Dorsal Hand & Wrist) */}
          <g transform="translate(230, 145)">
            {/* Erythema Patch */}
            <ellipse
              cx="0"
              cy="0"
              rx="46"
              ry="28"
              fill="url(#burnErythema)"
              className="transition-all duration-700"
            />

            {/* Intact Fluid-Filled Blisters (Bullae) */}
            <ellipse
              cx="-12"
              cy="-6"
              rx="10"
              ry="6"
              fill="#fbbf24"
              fillOpacity={isAdequatelyCooled ? 0.3 : 0.6}
              stroke="#f59e0b"
              strokeWidth="1.2"
            />
            <ellipse
              cx="16"
              cy="8"
              rx="8"
              ry="5"
              fill="#fbbf24"
              fillOpacity={isAdequatelyCooled ? 0.3 : 0.6}
              stroke="#f59e0b"
              strokeWidth="1.2"
            />
            <ellipse
              cx="4"
              cy="-14"
              rx="6"
              ry="4"
              fill="#fbbf24"
              fillOpacity={isAdequatelyCooled ? 0.3 : 0.6}
              stroke="#f59e0b"
              strokeWidth="1"
            />

            <text x="0" y="24" textAnchor="middle" fill={tempColor} fontSize="7" fontWeight="bold" fontFamily="monospace">
              2ND-DEGREE THERMAL BURN
            </text>
          </g>

          {/* Water Tap Faucet Vector (Positioned over the burn site) */}
          <g transform="translate(210, 20)">
            {/* Pipe */}
            <rect x="0" y="0" width="36" height="14" rx="3" fill="url(#tapMetal)" stroke="#64748b" strokeWidth="1.5" />
            <rect x="26" y="10" width="16" height="32" rx="4" fill="url(#tapMetal)" stroke="#64748b" strokeWidth="1.5" />
            {/* Spout Nozzle */}
            <path d="M 24 42 L 44 42 L 40 52 L 28 52 Z" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
          </g>

          {/* Running Water Stream Visual */}
          {isWaterRunning && (
            <g transform="translate(238, 72)">
              {/* Continuous stream path */}
              <rect x="-8" y="0" width="16" height="52" rx="6" fill="url(#waterFlow)" />
              {/* Water Splash at Contact Point */}
              <ellipse cx="0" cy="55" rx="26" ry="7" fill="#38bdf8" fillOpacity="0.4" />
            </g>
          )}

          {/* Target Zone Box */}
          <rect
            x="180"
            y="110"
            width="100"
            height="70"
            rx="14"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.6"
          />
        </svg>

        {/* --- Framer Motion Interactive Overlays --- */}

        {/* 1. Animated Cascading Water Droplets */}
        {isWaterRunning && (
          <div className="absolute top-[28%] left-[52%] -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center">
            <motion.div
              animate={{ y: [0, 40], opacity: [1, 0.4] }}
              transition={{ duration: 0.35, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-12 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full blur-[1px]"
            />
          </div>
        )}

        {/* 2. Non-Adherent Dressing Layer */}
        <AnimatePresence>
          {dressingApplied && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="absolute top-[49%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-36 h-28 bg-slate-100/90 rounded-2xl border-2 border-dashed border-cyan-400 shadow-2xl z-30 flex flex-col items-center justify-center p-2"
            >
              <span className="text-[11px] font-black uppercase text-slate-800 tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Non-Adherent Wrap
              </span>
              <span className="text-[8px] font-mono text-slate-500 mt-0.5">
                Sterile Loose Dressing
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Real-time Dynamic Temperature HUD Readout */}
        <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-xl z-20">
          <Thermometer className="w-4 h-4" style={{ color: tempColor }} />
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Tissue Temp</span>
            <span className="text-sm font-black font-mono" style={{ color: tempColor }}>
              {calculatedTemp}°C
            </span>
          </div>
        </div>

        {/* 4. Cooling Progress Countdown Ring */}
        <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-xl z-20">
          <Droplets className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Cooling Duration</span>
            <span className={`text-sm font-black font-mono ${isAdequatelyCooled ? 'text-emerald-400' : 'text-amber-400'}`}>
              {coolingMinutes} / {targetCoolingMinutes} mins
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Protocol Control Bar */}
      <div className="w-full mt-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-cyan-400" />
            Thermal Protocol Actions:
          </span>
          <span className="text-[11px] text-cyan-400 font-mono">
            {isAdequatelyCooled ? 'Adequately Cooled (10–20m) ✓' : 'Cool with tap water'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Water Tap Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onToggleWater}
            disabled={dressingApplied || disabled}
            className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
              isWaterRunning
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-950/60'
                : 'bg-slate-800/80 border-slate-700 hover:border-cyan-500 text-slate-200 cursor-pointer'
            }`}
          >
            <Droplets className={`w-4 h-4 ${isWaterRunning ? 'animate-bounce text-cyan-200' : 'text-cyan-400'}`} />
            <span>{isWaterRunning ? 'Stop Tap Water' : 'Run Cool Tap Water'}</span>
          </motion.button>

          {/* Sterile Non-Adherent Dressing Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onApplyDressing}
            disabled={dressingApplied || disabled}
            className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
              dressingApplied
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : (isAdequatelyCooled
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg cursor-pointer'
                  : 'bg-slate-800/80 border-slate-700 hover:border-cyan-500 text-slate-200 cursor-pointer')
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{dressingApplied ? 'Dressing Secured ✓' : 'Apply Sterile Non-Stick Wrap'}</span>
          </motion.button>

          {/* Contraindicated Ice / Butter Test Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onApplyIce}
            disabled={disabled}
            className="p-2.5 rounded-xl border border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Apply Ice / Home Salve (Trap)</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AnatomyHandBurn;
