import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LEVEL_SIMULATION_CONFIGS, SCORING_WEIGHTS, PRACTICAL_THRESHOLD } from '../../../simulations/common/SimulationConfig';
import Level1CPRMotion from './Level1CPRMotion';
import Level2WoundCareMotion from './Level2WoundCareMotion';
import Level3BurnsMotion from './Level3BurnsMotion';
import Level4ChokingMotion from './Level4ChokingMotion';
import Level5FractureMotion from './Level5FractureMotion';
import { CheckCircle2, AlertTriangle, Clock, Target, Activity, Award, ShieldCheck, RefreshCw } from 'lucide-react';

const SIMULATION_MAP = {
  1: Level1CPRMotion,
  2: Level2WoundCareMotion,
  3: Level3BurnsMotion,
  4: Level4ChokingMotion,
  5: Level5FractureMotion
};

const RealisticSimulationWrapper = ({
  levelId = 1,
  eventBridge = {},
  isSandbox = false,
  onSandboxComplete
}) => {
  const levelNum = typeof levelId === 'number' ? levelId : (parseInt(levelId, 10) || 1);
  const config = LEVEL_SIMULATION_CONFIGS[levelNum] || LEVEL_SIMULATION_CONFIGS[1];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [actionsHistory, setActionsHistory] = useState([]);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(1);
  const [targetAccuracyScores, setTargetAccuracyScores] = useState([]);
  const [outOfSequenceCount, setOutOfSequenceCount] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    resetSimulation();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [levelId]);

  const resetSimulation = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = Date.now();
    setCurrentStepIndex(0);
    setActionsHistory([]);
    setMistakesCount(0);
    setTargetAccuracyScores([]);
    setOutOfSequenceCount(0);
    setElapsedMs(0);
    setIsFinished(false);
    setLastFeedback(null);
    setSummaryData(null);

    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 200);

    const initialStep = config.expectedSequence[0] || 'START';
    if (eventBridge.onStepChange) {
      eventBridge.onStepChange({
        currentStep: initialStep,
        stepIndex: 0,
        totalSteps: config.expectedSequence.length - 1
      });
    }
  };

  const handleStepAction = ({
    action,
    targetAccuracy = 100,
    isCorrect = true,
    feedback = '',
    autoAdvance = true
  }) => {
    if (isFinished) return;

    const expectedStep = config.expectedSequence[currentStepIndex];
    const isSequenceMatch = action === expectedStep;

    let newOutOfSeq = outOfSequenceCount;
    if (!isSequenceMatch && action !== 'RETRY') {
      newOutOfSeq++;
      setOutOfSequenceCount(newOutOfSeq);
    }

    let newMistakes = mistakesCount;
    if (!isCorrect || targetAccuracy < 60) {
      newMistakes++;
      setMistakesCount(newMistakes);
      if (eventBridge.onMistake) {
        eventBridge.onMistake({ action, mistakesCount: newMistakes });
      }
    }

    const updatedAccuracies = [...targetAccuracyScores, targetAccuracy];
    setTargetAccuracyScores(updatedAccuracies);

    const actionRecord = {
      action,
      expectedStep,
      timestamp: Date.now(),
      correct: isCorrect && isSequenceMatch,
      targetAccuracy,
      feedback
    };

    const newHistory = [...actionsHistory, actionRecord];
    setActionsHistory(newHistory);

    setLastFeedback({ message: feedback, isCorrect: isCorrect && isSequenceMatch });
    if (eventBridge.onFeedback) {
      eventBridge.onFeedback({ message: feedback, isCorrect: isCorrect && isSequenceMatch });
    }

    let nextIndex = currentStepIndex;
    if (isCorrect && isSequenceMatch && autoAdvance) {
      nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
    }

    const nextStepName = config.expectedSequence[nextIndex] || 'COMPLETE';

    if (eventBridge.onAction) {
      eventBridge.onAction({
        actionRecord,
        currentStep: nextStepName,
        stepIndex: nextIndex,
        totalSteps: config.expectedSequence.length - 1,
        mistakesCount: newMistakes,
        elapsedMs: Date.now() - startTimeRef.current
      });
    }

    if (eventBridge.onStepChange) {
      eventBridge.onStepChange({
        currentStep: nextStepName,
        stepIndex: nextIndex,
        totalSteps: config.expectedSequence.length - 1
      });
    }

    // Check if simulation sequence complete
    if (nextIndex >= config.expectedSequence.length - 1 || action === 'COMPLETE') {
      finishSimulation({
        history: newHistory,
        accuracies: updatedAccuracies,
        mistakes: newMistakes,
        outOfSeq: newOutOfSeq
      });
    }
  };

  const finishSimulation = ({ history, accuracies, mistakes, outOfSeq }) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsFinished(true);

    const totalTimeMs = Date.now() - startTimeRef.current;
    const totalActions = history.length || 1;
    const correctCount = history.filter(a => a.correct).length;
    const actionCorrectness = Math.round((correctCount / totalActions) * 100);

    const targetAccuracy = accuracies.length > 0
      ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
      : 100;

    const penalty = (outOfSeq / totalActions) * 100;
    const sequenceAccuracy = Math.max(0, Math.round(100 - penalty));

    const elapsedSec = totalTimeMs / 1000;
    let timeScore = 100;
    if (elapsedSec > 30) {
      timeScore = Math.max(0, Math.round(100 - (elapsedSec - 30) * (100 / 90)));
    }

    const attemptScore = Math.max(20, 100 - (attemptsCount - 1) * 20);

    const calculatedScore = Math.round(
      (actionCorrectness * SCORING_WEIGHTS.actionCorrectness) +
      (targetAccuracy * SCORING_WEIGHTS.targetAccuracy) +
      (sequenceAccuracy * SCORING_WEIGHTS.sequenceAccuracy) +
      (timeScore * SCORING_WEIGHTS.responseTime) +
      (attemptScore * SCORING_WEIGHTS.attemptEfficiency)
    );

    const passed = calculatedScore >= PRACTICAL_THRESHOLD;

    const weakAreas = [];
    if (targetAccuracy < 65) weakAreas.push('Target positioning accuracy');
    if (sequenceAccuracy < 70) weakAreas.push('Procedure step order');
    if (actionCorrectness < 75) weakAreas.push('Action precision & clinical technique');
    if (timeScore < 60) weakAreas.push('Emergency response time');

    const completionPayload = {
      levelId: levelNum,
      actions: history,
      actionCorrectness,
      targetAccuracy,
      sequenceAccuracy,
      responseTimeMs: totalTimeMs,
      mistakes,
      attempts: attemptsCount,
      finalScore: calculatedScore,
      passed,
      weakAreas,
      practicalThreshold: PRACTICAL_THRESHOLD,
      isSandbox
    };

    setSummaryData(completionPayload);

    if (isSandbox && onSandboxComplete) {
      onSandboxComplete(completionPayload);
    } else if (eventBridge.onComplete) {
      eventBridge.onComplete(completionPayload);
    }
  };

  const handleRetry = () => {
    setAttemptsCount(prev => prev + 1);
    resetSimulation();
  };

  const Component = SIMULATION_MAP[levelNum] || Level1CPRMotion;

  return (
    <div className="w-full relative bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-4 sm:p-6 overflow-hidden select-none">
      {/* Sandbox Isolation Header Badge */}
      {isSandbox && (
        <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 flex items-center justify-between text-amber-300 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <strong>Isolated Sandbox Quality Control Mode</strong> — No database writes, zero analytics pollution.
          </span>
          <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] uppercase">
            Dry Run
          </span>
        </div>
      )}

      {/* Top Telemetry HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5 text-xs">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Step</span>
            <span className="font-bold text-slate-200 truncate max-w-[120px] block">
              {config.expectedSequence[currentStepIndex]?.replace(/_/g, ' ') || 'Completed'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Response Time</span>
            <span className="font-bold text-slate-200 font-mono">
              {(elapsedMs / 1000).toFixed(1)}s
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Mistakes</span>
            <span className={`font-bold ${mistakesCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {mistakesCount}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Progress</span>
            <span className="font-bold text-slate-200 font-mono">
              {Math.min(currentStepIndex + 1, config.expectedSequence.length)} / {config.expectedSequence.length}
            </span>
          </div>
        </div>
      </div>

      {/* Realistic Framer Motion Simulation Canvas Area */}
      <div className="min-h-[440px] flex flex-col justify-center items-center bg-slate-900/50 rounded-2xl border border-slate-800/80 p-4 sm:p-6 relative overflow-hidden">
        <Component
          currentStep={config.expectedSequence[currentStepIndex]}
          stepIndex={currentStepIndex}
          onAction={handleStepAction}
          isFinished={isFinished}
        />

        {/* Live Feedback Toast Notification */}
        <AnimatePresence>
          {lastFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-xs font-bold border shadow-xl flex items-center gap-2 ${
                lastFeedback.isCorrect
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60'
                  : 'bg-rose-950/90 text-rose-300 border-rose-700/60'
              }`}
            >
              {lastFeedback.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{lastFeedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sandbox Local Quality Control Completion Modal */}
      {isSandbox && summaryData && (
        <div className="mt-4 bg-slate-900 border border-slate-700 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h4 className="font-bold text-white text-base">Simulation Test Run Complete</h4>
                <p className="text-xs text-slate-400">All 5 clinical parameters evaluated in isolated sandbox.</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-600 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-Test Level
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Action Correctness</span>
              <span className="text-xl font-black text-cyan-400">{summaryData.actionCorrectness}%</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Target Accuracy</span>
              <span className="text-xl font-black text-blue-400">{summaryData.targetAccuracy}%</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Sequence Accuracy</span>
              <span className="text-xl font-black text-purple-400">{summaryData.sequenceAccuracy}%</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Response Speed</span>
              <span className="text-xl font-black text-amber-400">{(summaryData.responseTimeMs / 1000).toFixed(1)}s</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Final Score</span>
              <span className={`text-xl font-black ${summaryData.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {summaryData.finalScore}% ({summaryData.passed ? 'PASSED' : 'FAILED'})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealisticSimulationWrapper;
