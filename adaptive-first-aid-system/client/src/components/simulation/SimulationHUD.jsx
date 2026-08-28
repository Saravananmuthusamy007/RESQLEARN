// SimulationHUD.jsx - Modern medical dashboard HUD header overlay

import React from 'react';
import { Clock, ShieldAlert, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import ProgressBar from './ProgressBar';

const SimulationHUD = ({
  levelTitle = 'Level Simulation',
  procedureName = 'First Aid Protocol',
  currentStep = 'START',
  stepIndex = 0,
  totalSteps = 7,
  elapsedSeconds = 0,
  mistakesCount = 0,
  estimatedScore = 100
}) => {
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round(((stepIndex + 1) / totalSteps) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-white mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-2.5 py-1 rounded-full">
            Practical Assessment
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-1">{levelTitle}</h2>
          <p className="text-xs text-slate-400">{procedureName}</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm font-bold">{formatTime(elapsedSeconds)}</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">Mistakes: <strong className="font-bold">{mistakesCount}</strong></span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5 text-emerald-400">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium">Est. Score: <strong className="font-bold">{estimatedScore}%</strong></span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs text-slate-300">
          <span>Current Step: <strong className="text-cyan-300 uppercase">{currentStep.replace(/_/g, ' ')}</strong></span>
          <span className="font-medium">Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps} ({progressPercent}%)</span>
        </div>
        <ProgressBar progress={progressPercent} />
      </div>
    </div>
  );
};

export default SimulationHUD;
