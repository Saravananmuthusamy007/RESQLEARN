// PracticalAssessment.jsx - Main container page for Phaser 3 First-Aid practical simulations

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { submitPracticalAttempt } from '../../services/simulationApi';
import PhaserGame from '../../components/simulation/PhaserGame';
import RealisticSimulationWrapper from '../../components/simulation/realistic/RealisticSimulationWrapper';
import SimulationHUD from '../../components/simulation/SimulationHUD';
import ActionFeedback from '../../components/simulation/ActionFeedback';
import SimulationResult from '../../components/simulation/SimulationResult';
import InteractiveSolutionGuide from '../../components/practical/InteractiveSolutionGuide';
import { LEVEL_SIMULATION_CONFIGS } from '../../simulations/common/SimulationConfig';
import { ArrowLeft, Lightbulb, RefreshCw, Lock, Sparkles, Gamepad2 } from 'lucide-react';

const PracticalAssessment = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [simEngine, setSimEngine] = useState('realistic'); // 'realistic' (framer-motion) or 'phaser'

  // Simulation State
  const [currentStep, setCurrentStep] = useState('OBSERVE_VICTIM');
  const [stepIndex, setStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(7);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [mistakeTags, setMistakeTags] = useState([]);
  const [estimatedScore, setEstimatedScore] = useState(100);
  const [feedback, setFeedback] = useState(null);
  const [resultData, setResultData] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    fetchLevelData();
    startTimer();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [levelId]);

  const startTimer = () => {
    setElapsedSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const fetchLevelData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/levels/${levelId}`);
      setLevel(res.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('This level is locked. Complete the previous level first.');
      } else {
        setError(err.response?.data?.message || 'Failed to load practical assessment.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Event Bridge Callbacks passed down to Phaser Scene
  const eventBridge = {
    onStepChange: (data) => {
      if (data.currentStep) setCurrentStep(data.currentStep);
      if (data.stepIndex !== undefined) setStepIndex(data.stepIndex);
      if (data.totalSteps !== undefined) setTotalSteps(data.totalSteps);
    },

    onAction: (data) => {
      if (data.mistakesCount !== undefined) {
        setMistakesCount(data.mistakesCount);
        const est = data.estimatedScore !== undefined
          ? data.estimatedScore
          : Math.max(0, 100 - data.mistakesCount * 10);
        setEstimatedScore(est);
      }
      if (data.mistakeTags && Array.isArray(data.mistakeTags)) {
        setMistakeTags((prev) => [...new Set([...prev, ...data.mistakeTags])]);
      }
    },

    onFeedback: (data) => {
      setFeedback(data);
    },

    onMistake: (data) => {
      setMistakesCount((prev) => (data?.mistakesCount !== undefined ? data.mistakesCount : prev + 1));
      if (data?.tag) {
        setMistakeTags((prev) => [...new Set([...prev, data.tag])]);
      }
      setEstimatedScore((prev) => Math.max(0, prev - 10));
    },

    onComplete: async (completionData) => {
      if (timerRef.current) clearInterval(timerRef.current);

      try {
        const genuineMistakes = completionData.mistakes !== undefined ? completionData.mistakes : mistakesCount;
        const genuineSeqErrors = completionData.sequenceErrors !== undefined
          ? completionData.sequenceErrors
          : (completionData.outOfSeq !== undefined ? completionData.outOfSeq : 0);
        const genuineTimeSec = Number((completionData.responseTimeMs ? completionData.responseTimeMs / 1000 : elapsedSeconds).toFixed(1));
        const genuineTags = [...new Set([...(completionData.mistakeTags || []), ...(mistakeTags || [])])];

        const payload = {
          levelId: completionData.levelId || levelOrder,
          actions: completionData.actions || [
            { step: 'clinical_procedure', target: 'simulation_scene', timestamp: elapsedSeconds * 1000, correct: (completionData.finalScore || 100) >= 75 }
          ],
          metrics: {
            totalResponseTime: genuineTimeSec,
            attempts: completionData.attempts || 1,
            sequenceErrors: genuineSeqErrors,
            incorrectTargets: genuineMistakes
          },
          mistakes: genuineMistakes,
          sequenceErrors: genuineSeqErrors,
          totalResponseTime: genuineTimeSec,
          estScore: completionData.finalScore || estimatedScore,
          mistakeTags: genuineTags,
          weakAreas: completionData.weakAreas && completionData.weakAreas.length > 0 ? completionData.weakAreas : genuineTags,
          ...completionData
        };
        const response = await submitPracticalAttempt(levelId, payload);
        const finalScore = response.finalScore || completionData.finalScore;
        const practicalThreshold = Number(response.practicalThreshold || completionData.practicalThreshold || 75);
        const PASS_THRESHOLD = practicalThreshold;
        const isPassed = (response.passed !== undefined ? Boolean(response.passed) : Boolean(completionData.passed)) || (finalScore >= PASS_THRESHOLD);
        const identifiedWeakAreas = response.weakAreas && response.weakAreas.length > 0
          ? response.weakAreas
          : (genuineTags.length > 0 ? genuineTags : (completionData.weakAreas || []));

        // Stage 2: Immediately trigger Dynamic Gemini Question Generation upon completion
        if (isPassed) {
          api.post(`/levels/${levelId}/generate-dynamic-quiz`, {
            simulationScore: finalScore,
            weakTags: identifiedWeakAreas
          }).catch((quizErr) => {
            console.warn('[PracticalAssessment] Pre-generation of dynamic quiz notice:', quizErr.message);
          });
        }

        setResultData({
          ...completionData,
          finalScore,
          passed: isPassed,
          practicalThreshold,
          weakAreas: identifiedWeakAreas,
          clinicalCritique: response.clinicalCritique,
          remediation: response.remediation,
          recommendedMCQDifficulty: response.recommendedMCQDifficulty,
          difficultyMix: response.difficultyMix,
          aiEvaluated: response.aiEvaluated
        });
      } catch (err) {
        console.error('Failed to submit simulation results:', err);
        const fallbackThreshold = Number(completionData.practicalThreshold || 75);
        const fallbackScore = Number(completionData.finalScore || estimatedScore || 0);
        setResultData({
          ...completionData,
          finalScore: fallbackScore,
          practicalThreshold: fallbackThreshold,
          passed: Boolean(completionData.passed) || (fallbackScore >= fallbackThreshold)
        });
      }
    }
  };

  const handleRetry = () => {
    setResultData(null);
    setMistakesCount(0);
    setMistakeTags([]);
    setEstimatedScore(100);
    setStepIndex(0);
    startTimer();
  };

  const handleProceedMCQ = () => {
    navigate(`/mcq/${levelId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-rose-950/60 border border-rose-800 p-8 rounded-2xl text-white">
          <Lock className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-rose-300 mb-2">Practical Assessment Locked</h2>
          <p className="text-rose-200 mb-6">{error}</p>
          <Link
            to="/levels"
            className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white font-medium rounded-xl hover:bg-cyan-500 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Levels Overview
          </Link>
        </div>
      </div>
    );
  }

  const levelOrder = level?.order || (parseInt(levelId, 10) || 1);
  const levelConfig = LEVEL_SIMULATION_CONFIGS[levelOrder] || LEVEL_SIMULATION_CONFIGS[1];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 bg-slate-950 min-h-screen text-slate-100">
      {/* Navigation Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/levels/${levelId}`}
          className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Instructional Guidelines
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Simulation Engine Mode Selector Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSimEngine('realistic')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                simEngine === 'realistic'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Realistic Motion Lab
            </button>
            <button
              onClick={() => setSimEngine('phaser')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                simEngine === 'phaser'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" /> Classic Canvas
            </button>
          </div>

          {/* Kids Learn & Solution Guide Button */}
          <button
            onClick={() => setShowSolutionModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl shadow-lg transition transform hover:scale-105"
          >
            <Lightbulb className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>💡 Learn & Solution</span>
          </button>

          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restart
          </button>

          <span className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-semibold rounded-full">
            Level {level.order}
          </span>
        </div>
      </div>

      {/* Simulation HUD Overlay Header */}
      <SimulationHUD
        levelTitle={levelConfig.title}
        procedureName={levelConfig.procedureName}
        currentStep={currentStep}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        elapsedSeconds={elapsedSeconds}
        mistakesCount={mistakesCount}
        estimatedScore={estimatedScore}
      />

      {/* Interactive Simulation Engine (Framer Motion Realistic or Phaser 3 Canvas) */}
      {simEngine === 'realistic' ? (
        <RealisticSimulationWrapper levelId={levelOrder} eventBridge={eventBridge} />
      ) : (
        <PhaserGame levelId={levelOrder} eventBridge={eventBridge} />
      )}

      {/* Action Toast Feedback Overlay */}
      <ActionFeedback feedback={feedback} />

      {/* Interactive Solution & Step Walkthrough Modal */}
      <InteractiveSolutionGuide
        levelId={levelOrder}
        isOpen={showSolutionModal}
        onClose={() => setShowSolutionModal(false)}
      />

      {/* Results & Adaptive MCQ Modal */}
      {resultData && (
        <SimulationResult
          resultData={resultData}
          onRetry={handleRetry}
          onProceedMCQ={handleProceedMCQ}
        />
      )}
    </div>
  );
};

export default PracticalAssessment;

