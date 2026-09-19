import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const AssessmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [assessmentData, setAssessmentData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await api.post('/assessments/generate', {
          levelNumber: parseInt(id, 10),
        });

        if (res.success) {
          setAssessmentData(res);
        }
      } catch (err) {
        setError(err.message || 'Error generating adaptive assessment.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  const handleSelectOption = (questionId, optionIndex) => {
    if (evaluationResult) return; // Prevent changing answers after submission
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    const questions = assessmentData?.questions || [];
    const formattedAnswers = questions.map(q => ({
      questionId: q.id,
      selectedAnswer: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
    }));

    setIsSubmitting(true);
    try {
      const res = await api.post('/assessments/submit', {
        assessmentId: assessmentData.assessmentId,
        answers: formattedAnswers,
      });

      if (res.success) {
        setEvaluationResult(res);
      }
    } catch (err) {
      console.error('Submit assessment error:', err);
      alert(err.message || 'Error evaluating assessment answers.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-slate-400 font-mono text-sm">
        <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="font-bold text-white text-base">Configuring Gemini 2.5 Flash Adaptive Assessment...</div>
        <div className="text-xs text-slate-500 mt-1">
          Analyzing practical performance metrics and calibrating clinical question difficulty.
        </div>
      </div>
    );
  }

  if (error || !assessmentData) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="p-6 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200">
          <AlertCircle className="w-10 h-10 mx-auto text-rose-400 mb-2" />
          <h2 className="text-lg font-bold">Assessment Unavailable</h2>
          <p className="text-xs text-rose-300 mt-1 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/levels/${id}/simulation`)}
            className="px-4 py-2 bg-rose-600 rounded-lg text-xs font-semibold text-white"
          >
            Retry Practical Simulation (&ge;75% required)
          </button>
        </div>
      </div>
    );
  }

  const questions = assessmentData.questions || [];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === questions.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Assessment Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold mb-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 uppercase">
              Difficulty: {assessmentData.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>{assessmentData.source === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash Adaptive' : 'Curated Clinical Bank'}</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Level {id}: Theoretical Assessment</h1>
          <p className="text-xs text-slate-400 mt-1">
            Passing Threshold: <strong>70.0%</strong> | Answer all 5 emergency questions.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <div className="text-slate-500 text-[10px]">PRACTICAL SCORE</div>
            <div className="text-emerald-400 font-bold">{assessmentData.practicalScore}%</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <div className="text-slate-500 text-[10px]">ANSWERED</div>
            <div className="text-cyan-400 font-bold">{answeredCount} / {questions.length}</div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const detailed = evaluationResult?.detailedFeedback?.find(f => f.id === q.id);

          return (
            <div
              key={q.id}
              className={`rounded-2xl p-6 border transition-all ${
                detailed
                  ? detailed.isCorrect
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  QUESTION {qIndex + 1} OF {questions.length} • <span className="text-slate-400">{q.skill}</span>
                </span>

                {detailed && (
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                    detailed.isCorrect ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {detailed.isCorrect ? 'CORRECT +20%' : 'INCORRECT'}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white mb-4 leading-snug">{q.question}</h3>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedAnswers[q.id] === optIndex;
                  const isCorrectOption = detailed && detailed.correctAnswer === optIndex;
                  const isWrongSelected = detailed && isSelected && !detailed.isCorrect;

                  let buttonStyle = 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-300';
                  if (isSelected && !detailed) {
                    buttonStyle = 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-sm shadow-cyan-950';
                  } else if (isCorrectOption) {
                    buttonStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-semibold';
                  } else if (isWrongSelected) {
                    buttonStyle = 'bg-rose-950/90 border-rose-500 text-rose-200 font-semibold';
                  }

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleSelectOption(q.id, optIndex)}
                      disabled={!!evaluationResult}
                      className={`p-3.5 rounded-xl border text-xs text-left transition-all flex items-start space-x-2.5 ${buttonStyle}`}
                    >
                      <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 text-slate-300">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Immediate Clinical Rationale Explanation */}
              {detailed && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl">
                  <div className="font-bold text-cyan-400 font-mono text-[11px] mb-1">CLINICAL RATIONALE:</div>
                  {detailed.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit or Results Action Bar */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {!evaluationResult ? (
          <>
            <div className="text-xs text-slate-400">
              {isAllAnswered ? (
                <span className="text-emerald-400 font-semibold">✓ All 5 questions answered. Ready to submit!</span>
              ) : (
                <span>Please select an answer for all questions before submitting ({answeredCount}/5).</span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isAllAnswered || isSubmitting}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${
                isAllAnswered && !isSubmitting
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Evaluating Clinical Answers...' : 'Submit Answers for Verification'}</span>
            </button>
          </>
        ) : (
          <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs text-slate-400 font-mono">ASSESSMENT RESULT:</div>
                <div className="text-xl font-black text-white mt-0.5">{evaluationResult.message}</div>
              </div>
              <div className="text-right font-mono">
                <div className="text-slate-400 text-xs">Score:</div>
                <div className={`text-3xl font-extrabold ${evaluationResult.isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {evaluationResult.assessmentScore}%
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Another Assessment</span>
              </button>

              {evaluationResult.isPassed ? (
                parseInt(id, 10) === 5 ? (
                  <Link
                    to="/certification"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold shadow-lg flex items-center space-x-2 transition-all"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Emergency Competency Certificate</span>
                  </Link>
                ) : (
                  <Link
                    to={`/levels/${parseInt(id, 10) + 1}/learn`}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg flex items-center space-x-2 transition-all"
                  >
                    <span>Advance to Level {parseInt(id, 10) + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )
              ) : (
                <Link
                  to={`/levels/${id}/simulation`}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg flex items-center space-x-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Simulation & Assessment</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;
