import React from 'react';
import { Activity, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const HUD = ({
  currentStep = 1,
  totalSteps = 6,
  stepName = '',
  elapsedSeconds = 0,
  liveAccuracy = 100,
  mistakes = 0,
  criticalErrors = [],
  patientStatus = 'STABLE RESUSCITATION IN PROGRESS',
  isDemo = false,
}) => {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getAccuracyColor = (acc) => {
    if (acc >= 85) return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    if (acc >= 75) return 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10';
    if (acc >= 60) return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
  };

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 py-3 sticky top-0 z-30">
      {/* Top Bar: Vitals & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-800 text-rose-300 font-mono">
            <Activity className="w-4 h-4 text-rose-500 animate-heartbeat" />
            <span className="font-semibold tracking-wide">SIMULATION TELEMETRY</span>
          </div>

          {isDemo && (
            <span className="px-2 py-0.5 rounded bg-purple-900/50 border border-purple-500/40 text-purple-300 font-semibold uppercase tracking-wider text-[11px]">
              Admin Demo Sandbox
            </span>
          )}

          <div className="hidden sm:flex items-center space-x-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase font-medium">{patientStatus}</span>
          </div>
        </div>

        {/* Real-time Telemetry Metrics */}
        <div className="flex items-center space-x-2 md:space-x-4 font-mono">
          {/* Live Accuracy */}
          <div className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${getAccuracyColor(liveAccuracy)}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ACCURACY: <strong className="text-white">{Math.round(liveAccuracy)}%</strong></span>
          </div>

          {/* Mistakes Counter */}
          <div className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
            mistakes === 0
              ? 'text-slate-400 border-slate-700 bg-slate-800/40'
              : 'text-amber-400 border-amber-500/50 bg-amber-500/10'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ERRORS: <strong className={mistakes > 0 ? 'text-amber-300' : 'text-slate-300'}>{mistakes}</strong></span>
          </div>

          {/* Timer */}
          <div className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Step Progress Bar & Subtitle */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">
              STEP <strong className="text-cyan-400 font-bold">{currentStep}</strong> OF {totalSteps}:{' '}
              <span className="text-slate-200 font-medium">{stepName}</span>
            </span>
            <span className="text-cyan-400 font-semibold">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-rose-500 transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Critical Error Alert Banner */}
      {criticalErrors.length > 0 && (
        <div className="mt-2 px-3 py-1.5 bg-rose-950/80 border border-rose-600 rounded-lg flex items-center space-x-2 text-rose-200 text-xs animate-bounce">
          <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>
            <strong>CRITICAL PROTOCOL ERROR:</strong> {criticalErrors[criticalErrors.length - 1]}
          </span>
        </div>
      )}
    </div>
  );
};

export default HUD;
