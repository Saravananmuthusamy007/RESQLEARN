import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import UnitySimFrame from '../../components/practical/UnitySimFrame';
import ScoreSummary from '../../components/practical/ScoreSummary';
import { ArrowLeft, Award, Lock } from 'lucide-react';

const PracticalAssessment = () => {
  const { levelId } = useParams();
  const [level, setLevel] = useState(null);
  const [attemptsHistory, setAttemptsHistory] = useState([]);
  const [latestResult, setLatestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLevelAndAttempts();
  }, [levelId]);

  const fetchLevelAndAttempts = async () => {
    try {
      setLoading(true);
      const [levelRes, attemptsRes] = await Promise.all([
        api.get(`/levels/${levelId}`),
        api.get(`/practical/${levelId}/attempts`)
      ]);
      setLevel(levelRes.data);
      setAttemptsHistory(attemptsRes.data);
      if (attemptsRes.data.length > 0) {
        const lastAtt = attemptsRes.data[attemptsRes.data.length - 1];
        setLatestResult({
          attempt: lastAtt,
          passed: lastAtt.passed,
          compositeScore: lastAtt.compositeScore,
          practicalThreshold: levelRes.data.practicalThreshold,
          feedback: []
        });
      }
      setError(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('This level is locked. Complete the previous level first to access practical assessment.');
      } else {
        setError(err.response?.data?.message || 'Failed to load practical assessment.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSimulation = async (simPayload) => {
    try {
      setIsSubmitting(true);
      const res = await api.post(`/practical/${levelId}/attempt`, simPayload);
      setLatestResult(res.data);

      // Refresh attempts history
      const attemptsRes = await api.get(`/practical/${levelId}/attempts`);
      setAttemptsHistory(attemptsRes.data);

      // Scroll to score summary
      setTimeout(() => {
        const summaryElem = document.getElementById('score-summary-anchor');
        if (summaryElem) {
          summaryElem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit simulation attempt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Assessment Locked</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            to="/levels"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Level List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Navigation Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={`/levels/${levelId}`}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Level Content
        </Link>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
          Level {level.order} Practical Assessment
        </span>
      </div>

      {/* Hero Title */}
      <div className="mb-8 bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <h1 className="text-3xl font-extrabold mb-2">{level.title} — Practical Simulation</h1>
        <p className="text-blue-100 text-base max-w-3xl">
          Perform hands-on interactive first-aid procedures. Your technique, accuracy on target anatomical zones, and sequence timing will be evaluated against the required {level.practicalThreshold}% passing threshold.
        </p>
        <div className="mt-4 flex items-center text-xs font-semibold text-yellow-300 bg-white/10 px-3 py-1.5 rounded-lg w-fit">
          <Award className="w-4 h-4 mr-1.5" /> Passing Threshold: {level.practicalThreshold}%
        </div>
      </div>

      {/* 3D Unity Simulation Frame */}
      <UnitySimFrame
        onSubmitSimulation={handleSubmitSimulation}
        isSubmitting={isSubmitting}
      />

      {/* Score Summary & History Anchor */}
      <div id="score-summary-anchor">
        <ScoreSummary
          latestResult={latestResult}
          attemptsHistory={attemptsHistory}
          level={level}
          onRetry={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      </div>
    </div>
  );
};

export default PracticalAssessment;
