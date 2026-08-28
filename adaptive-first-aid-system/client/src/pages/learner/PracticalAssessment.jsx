// PracticalAssessment.jsx - Main container page for Phaser 3 First-Aid practical simulations

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { submitPracticalAttempt } from '../../services/simulationApi';
import PhaserGame from '../../components/simulation/PhaserGame';
import SimulationHUD from '../../components/simulation/SimulationHUD';
import ActionFeedback from '../../components/simulation/ActionFeedback';
import SimulationResult from '../../components/simulation/SimulationResult';
import InteractiveSolutionGuide from '../../components/practical/InteractiveSolutionGuide';
import { LEVEL_SIMULATION_CONFIGS } from '../../simulations/common/SimulationConfig';
import { ArrowLeft, Lightbulb, RefreshCw, Lock } from 'lucide-react';

const PracticalAssessment = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  // Simulation State
  const [currentStep, setCurrentStep] = useState('OBSERVE_VICTIM');
  const [stepIndex, setStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(7);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
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
        const est = Math.max(20, 100 - data.mistakesCount * 10);
        setEstimatedScore(est);
      }
    },

    onFeedback: (data) => {
      setFeedback(data);
    },

    onMistake: (data) => {
      setMistakesCount((prev) => prev + 1);
    },

    onComplete: async (completionData) => {
      if (timerRef.current) clearInterval(timerRef.current);

      try {
        const response = await submitPracticalAttempt(levelId, completionData);
        setResultData({
          ...completionData,
          finalScore: response.finalScore || completionData.finalScore,
          passed: response.passed !== undefined ? response.passed : completionData.passed,
          weakAreas: response.weakAreas || completionData.weakAreas
        });
      } catch (err) {
        console.error('Failed to submit simulation results:', err);
        setResultData(completionData);
      }
    }
  };

  const handleRetry = () => {
    setResultData(null);
    setMistakesCount(0);
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

  const levelConfig = LEVEL_SIMULATION_CONFIGS[Number(levelId)] || LEVEL_SIMULATION_CONFIGS[1];

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
          {/* Kids Learn & Solution Guide Button */}
          <button
            onClick={() => setShowSolutionModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl shadow-lg transition transform hover:scale-105"
          >
            <Lightbulb className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>💡 Learn & Show Solution</span>
          </button>

          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restart
          </button>

          <span className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-semibold rounded-full">
            Level {level.order} Interactive Assessment
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

      {/* Embedded Phaser 3 Interactive Canvas */}
      <PhaserGame levelId={levelId} eventBridge={eventBridge} />

      {/* Action Toast Feedback Overlay */}
      <ActionFeedback feedback={feedback} />

      {/* Interactive Solution & Step Walkthrough Modal */}
      <InteractiveSolutionGuide
        levelId={levelId}
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

