// SimulationResult.jsx - Comprehensive simulation performance report card & Gemini AI clinical evaluator modal

import React from 'react';
import { Award, AlertCircle, RefreshCw, ArrowRight, CheckCircle2, XCircle, Target, Clock, Zap, Sparkles, BookOpen, Lock, ShieldAlert } from 'lucide-react';

const SimulationResult = ({ resultData, onRetry, onProceedMCQ }) => {
  if (!resultData) return null;

  const {
    finalScore = 0,
    actionCorrectness = 0,
    targetAccuracy = 0,
    sequenceAccuracy = 0,
    responseTimeMs = 0,
    passed: rawPassed,
    practicalThreshold: rawThreshold,
    weakAreas = [],
    clinicalCritique = '',
    remediation = '',
    recommendedMCQDifficulty = '',
    aiEvaluated = false
  } = resultData;

  const PASS_THRESHOLD = Number(rawThreshold) || 75;
  const passed = rawPassed !== undefined
    ? (Boolean(rawPassed) || finalScore >= PASS_THRESHOLD)
    : (finalScore >= PASS_THRESHOLD);
  const practicalThreshold = PASS_THRESHOLD;

  const responseTimeSec = Math.round(responseTimeMs / 1000);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-white my-8">
        {/* Header Status */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl mb-3 bg-slate-800 border border-slate-700 shadow-inner">
            {passed ? (
              <Award className="w-12 h-12 text-emerald-400 animate-pulse" />
            ) : (
              <XCircle className="w-12 h-12 text-rose-500" />
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/40 rounded-full text-xs font-bold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {aiEvaluated ? 'Google Gemini AI Evaluator' : 'Clinical Telemetry Evaluator'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
            {passed ? 'Practical Assessment Passed!' : 'Practical Assessment Threshold Not Met'}
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Pass Criteria: <span className="text-cyan-400 font-bold">{practicalThreshold}%</span> | Evaluated Score: <span className={`font-bold ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>{finalScore}%</span>
          </p>
        </div>

        {/* Big Composite Score Badge */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-center mb-5">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Clinical Composite Skill Score
          </span>
          <div className={`text-4xl sm:text-5xl font-black mt-1 ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
            {finalScore}%
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden border border-slate-700/50">
            <div
              className={`h-full transition-all duration-700 ${passed ? 'bg-gradient-to-r from-teal-500 to-emerald-400' : 'bg-gradient-to-r from-rose-600 to-amber-500'}`}
              style={{ width: `${Math.min(100, finalScore)}%` }}
            />
          </div>
        </div>

        {/* Gemini AI Clinical Critique Commentary */}
        {clinicalCritique && (
          <div className="mb-5 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border border-cyan-800/50 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider mb-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Clinical Evaluation & Observation</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {clinicalCritique}
            </p>
          </div>
        )}

        {/* Sub-Metric Score Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Action Accuracy</span>
            </div>
            <span className="text-lg font-bold text-slate-100">{actionCorrectness}%</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Accuracy</span>
            </div>
            <span className="text-lg font-bold text-slate-100">{targetAccuracy}%</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Sequence Score</span>
            </div>
            <span className="text-lg font-bold text-slate-100">{sequenceAccuracy}%</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Response Time</span>
            </div>
            <span className="text-lg font-bold text-slate-100">{responseTimeSec}s</span>
          </div>
        </div>

        {/* Remediation Plan & Weak Areas */}
        {(!passed || (weakAreas && weakAreas.length > 0)) && (
          <div className={`p-4 rounded-2xl mb-5 text-left border ${
            passed ? 'bg-amber-950/30 border-amber-800/40' : 'bg-rose-950/40 border-rose-800/60'
          }`}>
            <div className="flex items-center gap-2 text-sm font-bold mb-2 text-amber-300">
              {passed ? <AlertCircle className="w-4 h-4 text-amber-400" /> : <ShieldAlert className="w-4 h-4 text-rose-400" />}
              <span>{passed ? 'Targeted Clinical Refinement Areas' : 'Remediation Required to Pass'}</span>
            </div>

            {weakAreas && weakAreas.length > 0 && (
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 mb-2">
                {weakAreas.map((area, idx) => (
                  <li key={idx} className="text-slate-200">{area}</li>
                ))}
              </ul>
            )}

            {remediation && (
              <div className="mt-2 pt-2 border-t border-slate-800 text-xs text-cyan-300">
                <span className="font-bold flex items-center gap-1 text-slate-200 mb-0.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Remediation Action Plan:
                </span>
                <p className="text-slate-300 pl-4">{remediation}</p>
              </div>
            )}
          </div>
        )}

        {/* Adaptive MCQ Difficulty Preview Banner (If Passed) */}
        {passed && recommendedMCQDifficulty && (
          <div className="mb-5 bg-purple-950/30 border border-purple-800/40 rounded-xl p-3 flex items-center justify-between text-xs text-purple-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Adaptive Question Recommendation:
            </span>
            <span className="font-bold text-purple-200 px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-700/60 uppercase text-[11px]">
              {recommendedMCQDifficulty === 'advanced' ? 'In-Depth Clinical Mastery' : 'Foundational Diagnostic'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
          <button
            onClick={onRetry}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              !passed
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 ring-2 ring-rose-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Retry Simulation
          </button>

          {passed ? (
            <button
              onClick={onProceedMCQ}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition-all transform hover:-translate-y-0.5"
            >
              Proceed to Adaptive MCQ Assessment
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-bold text-xs select-none">
              <Lock className="w-4 h-4 text-rose-400/80" />
              <span>MCQ Locked (Requires ≥ {practicalThreshold}% Practical Score)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationResult;
