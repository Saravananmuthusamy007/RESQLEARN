import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import QuestionCard from '../../components/mcq/QuestionCard';
import MCQResultSummary from '../../components/mcq/MCQResultSummary';
import { ArrowLeft, Brain, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const MCQAssessment = () => {
  const { levelId } = useParams();
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [reason, setReason] = useState('');
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: selectedOption }
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, [levelId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSubmissionResult(null);
      setCurrentIndex(0);
      setSelectedAnswers({});

      const [levelRes, quizRes] = await Promise.all([
        api.get(`/levels/${levelId}`),
        api.get(`/mcq/${levelId}/next-set`)
      ]);

      setLevel(levelRes.data);
      setQuestions(quizRes.data.questions);
      setReason(quizRes.data.reason);
      setAttemptNumber(quizRes.data.attemptNumber);
    } catch (err) {
      console.error('Error loading MCQ assessment:', err);
      setError(err.response?.data?.message || 'Failed to load adaptive MCQ assessment.');
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
    const answerPayload = questions.map((q) => ({
      questionId: q._id,
      selectedOption: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : 0
    }));

    try {
      setIsSubmitting(true);
      const res = await api.post(`/mcq/${levelId}/submit`, { answers: answerPayload });
      setSubmissionResult(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit MCQ assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 text-sm font-medium">Running Rule Engine & selecting adaptive question set...</p>
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
  const allAnswered = questions.every((q) => selectedAnswers[q._id] !== undefined);

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
        <h1 className="text-3xl font-extrabold mb-2">{level?.title} — Adaptive MCQ Assessment</h1>
        <p className="text-purple-200 text-sm max-w-2xl">
          Complete the adaptive question set. Pass threshold: <strong>{level?.mcqThreshold}%</strong>.
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
                  Adaptive Rule Engine Recommendation
                </span>
                <span className="inline-flex items-center text-[10px] bg-indigo-100 text-indigo-800 font-mono px-2 py-0.5 rounded-full border border-indigo-200">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-600" /> Dynamic Personalization
                </span>
              </div>
              <p className="text-sm font-semibold text-indigo-950">
                <strong>Why this question set?</strong> {reason}
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
            selectedOption={selectedAnswers[currentQuestion._id]}
            onSelectOption={(optIdx) => handleSelectOption(currentQuestion._id, optIdx)}
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
