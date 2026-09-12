import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import QuestionCard from '../../components/mcq/QuestionCard';
import MCQResultSummary from '../../components/mcq/MCQResultSummary';
import { ArrowLeft, Brain, Sparkles, AlertCircle, ArrowRight, CheckCircle2, Lock, ShieldAlert, BookOpen, RefreshCw } from 'lucide-react';

const MCQAssessment = () => {
  const { levelId } = useParams();
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [reason, setReason] = useState('');
  const [adaptiveCategory, setAdaptiveCategory] = useState('balanced');
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: selectedOption }
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [thresholdError, setThresholdError] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, [levelId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError(null);
      setThresholdError(null);
      setSubmissionResult(null);
      setCurrentIndex(0);
      setSelectedAnswers({});

      const levelRes = await api.get(`/levels/${levelId}`);
      setLevel(levelRes.data);

      // Attempt dynamic Gemini question generation endpoint first, with fallback to next-set
      let quizRes;
      try {
        quizRes = await api.post(`/levels/${levelId}/generate-dynamic-quiz`);
      } catch (postErr) {
        if (postErr.response?.status === 403 && postErr.response?.data?.practicalPassed === false) {
          throw postErr;
        }
        quizRes = await api.get(`/mcq/${levelId}/next-set`);
      }

      setQuestions(quizRes.data.questions || []);
      setReason(quizRes.data.reason || '');
      setAdaptiveCategory(quizRes.data.difficultyTier || quizRes.data.adaptiveCategory || 'intermediate');
      setAttemptNumber(quizRes.data.attemptNumber || 1);
    } catch (err) {
      console.error('Error loading dynamic MCQ assessment:', err);
      if (err.response?.status === 403 && err.response?.data?.practicalPassed === false) {
        setThresholdError(err.response.data);
      } else {
        setError(err.response?.data?.message || 'Failed to load adaptive MCQ assessment.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    const answerPayload = questions.map((q) => {
      const qKey = q.id !== undefined ? q.id : q._id;
      return {
        questionId: qKey,
        id: qKey,
        selectedOption: selectedAnswers[qKey] !== undefined ? selectedAnswers[qKey] : 0
      };
    });

    try {
      setIsSubmitting(true);
      let res;
      try {
        res = await api.post(`/levels/${levelId}/submit-dynamic-quiz`, { answers: answerPayload });
      } catch (submitErr) {
        res = await api.post(`/mcq/${levelId}/submit`, { answers: answerPayload });
      }
      setSubmissionResult(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit MCQ assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="text-gray-700 text-sm font-semibold">Grading dynamic assessment & generating clinical rationale...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 text-sm font-medium">Running Google Gemini Adaptive Engine & selecting question set...</p>
      </div>
    );
  }

  // Threshold Enforcement Gate UI
  if (thresholdError) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-slate-900 border-2 border-rose-600/70 rounded-3xl p-6 sm:p-8 text-white shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400 block mb-1">
              Threshold Gate Enforcement
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
              Practical Simulation Score Required
            </h2>
          </div>

          <p className="text-slate-300 text-sm max-w-lg mx-auto">
            {thresholdError.message}
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto py-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Score</span>
              <span className="text-2xl font-black text-rose-400">{thresholdError.currentScore || 0}%</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Required to Unlock</span>
              <span className="text-2xl font-black text-cyan-400">{thresholdError.requiredThreshold || 75}%</span>
            </div>
          </div>

          {thresholdError.remediation && (
            <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-2xl text-left max-w-lg mx-auto">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-1">
                <BookOpen className="w-4 h-4 text-rose-400" />
                Targeted AI Remediation Plan:
              </span>
              <p className="text-xs text-slate-200 pl-5">
                {thresholdError.remediation}
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/practical/${levelId}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg transition"
            >
              <RefreshCw className="w-4 h-4" /> Go to Practical Simulation
            </Link>
            <Link
              to={`/levels/${levelId}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Review Clinical Guide
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Quiz Loading Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            to={`/practical/${levelId}`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Go to Practical Assessment
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentKey = currentQuestion ? (currentQuestion.id !== undefined ? currentQuestion.id : currentQuestion._id) : null;
  const allAnswered = questions.length > 0 && questions.every((q) => {
    const key = q.id !== undefined ? q.id : q._id;
    return selectedAnswers[key] !== undefined;
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Navigation Link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={`/levels/${levelId}`}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Level Content
        </Link>
        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
          Level {level?.order} MCQ Attempt #{attemptNumber}
        </span>
      </div>

      {/* Header Banner */}
      <div className="mb-6 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold">{level?.title} — 100% Dynamic Gemini MCQ Assessment</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            adaptiveCategory === 'advanced'
              ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40'
              : adaptiveCategory === 'intermediate'
                ? 'bg-blue-500/20 text-cyan-200 border border-cyan-400/40'
                : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
          }`}>
            {adaptiveCategory === 'advanced'
              ? 'Advanced Mastery Challenge'
              : adaptiveCategory === 'intermediate'
                ? 'Balanced Clinical SOP'
                : 'Foundational Procedural Safety'}
          </span>
        </div>
        <p className="text-purple-200 text-sm max-w-2xl">
          Complete the dynamically generated question set. Pass threshold: <strong>{level?.mcqThreshold}%</strong>.
        </p>
      </div>

      {/* Rationale Tooltip Banner: "Why this question set?" */}
      {reason && (
        <div className="mb-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-2 border-indigo-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm mt-0.5">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">
                  Google Gemini Dynamic AI Pipeline
                </span>
                <span className="inline-flex items-center text-[10px] bg-indigo-100 text-indigo-800 font-mono px-2 py-0.5 rounded-full border border-indigo-200">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-600" /> On-the-Fly Generation
                </span>
              </div>
              <p className="text-sm font-semibold text-indigo-950">
                <strong>Adaptive Generation Rationale:</strong> {reason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* If Submission Result Active -> Render Summary */}
      {submissionResult ? (
        <MCQResultSummary
          result={submissionResult}
          level={level}
          onRetry={fetchQuizData}
        />
      ) : (
        /* Quiz Question Container */
        <div className="space-y-6">
          <QuestionCard
            question={currentQuestion}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            selectedOption={selectedAnswers[currentKey]}
            onSelectOption={(optIdx) => handleSelectOption(currentKey, optIdx)}
          />

          {/* Question Stepper Controls */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition disabled:opacity-40"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center"
              >
                Next Question <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting || !allAnswered}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg transition transform hover:-translate-y-0.5 flex items-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Submit Assessment
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQAssessment;
