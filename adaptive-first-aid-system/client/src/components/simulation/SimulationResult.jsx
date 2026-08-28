// SimulationResult.jsx - Comprehensive simulation performance report card & adaptive recommendation modal

import React from 'react';
import { Award, AlertCircle, RefreshCw, ArrowRight, CheckCircle2, XCircle, Target, Clock, Zap } from 'lucide-react';

const SimulationResult = ({ resultData, onRetry, onProceedMCQ }) => {
  if (!resultData) return null;

  const {
    finalScore = 0,
    actionCorrectness = 0,
    targetAccuracy = 0,
    sequenceAccuracy = 0,
    responseTimeMs = 0,
    mistakes = 0,
    attempts = 1,
    passed = false,
    practicalThreshold = 75,
    weakAreas = []
  } = resultData;

  const responseTimeSec = Math.round(responseTimeMs / 1000);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-white my-8">
        {/* Header Status */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-full mb-3 bg-slate-800 border border-slate-700">
            {passed ? (
              <Award className="w-12 h-12 text-emerald-400 animate-pulse" />
            ) : (
              <XCircle className="w-12 h-12 text-rose-400" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            {passed ? 'Practical Assessment Passed!' : 'Practical Assessment Failed'}
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Required Threshold: <span className="text-cyan-400 font-bold">{practicalThreshold}%</span> | Achieved Score: <span className={`font-bold ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>{finalScore}%</span>
          </p>
        </div>

        {/* Big Composite Score Badge */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center mb-6">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Composite Weighted Score</span>
          <div className={`text-4xl font-black mt-1 ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
            {finalScore}%
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full ${passed ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, finalScore)}%` }}
            />
          </div>
        </div>

        {/* Sub-Metric Score Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Action Accuracy</span>
            </div>
            <span className="text-lg font-bold text-slate-100">{actionCorrectness}%</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Accuracy</span>
            </div>
            <span className="text-lg font-bold text-slate-100">{targetAccuracy}%</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Sequence Score</span>
            </div>
            <span className="text-lg font-bold text-slate-100">{sequenceAccuracy}%</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Response Time</span>
            </div>
            <span className="text-lg font-bold text-slate-100">{responseTimeSec}s</span>
          </div>
        </div>

        {/* Weak Areas & Recommendations */}
        {weakAreas && weakAreas.length > 0 && (
          <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>Identified Areas for Improvement</span>
            </div>
            <ul className="list-disc list-inside text-xs text-amber-200 space-y-1">
              {weakAreas.map((area, idx) => (
                <li key={idx}>{area}</li>
              ))}
            </ul>
            <p className="text-xs text-slate-400 mt-2">
              Recommendation: Retry the practical simulation to refine target positioning and sequence timing before proceeding.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Simulation
          </button>

          {passed ? (
            <button
              onClick={onProceedMCQ}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition-all"
            >
              Proceed to Adaptive MCQ Assessment
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-slate-500 font-bold text-sm cursor-not-allowed border border-slate-700 opacity-60"
            >
              MCQ Locked (Requires 75% Score)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationResult;
