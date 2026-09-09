import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BarChart3,
  Users,
  BookOpen,
  Activity,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowDown,
  Layers,
  Award,
  Zap,
  Target,
  RefreshCw
} from 'lucide-react';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('progression'); // 'progression' | 'overview'
  const [analytics, setAnalytics] = useState(null);
  const [progression, setProgression] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, progRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/analytics/progression')
      ]);

      setAnalytics(analyticsRes.data);
      setProgression(progRes.data);
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600 text-sm font-medium">Aggregating game progression & clinical analytics...</p>
      </div>
    );
  }

  const {
    totalLearners = 0,
    overallCompletionRate = 0,
    avgPracticalScore = 0,
    avgMcqScore = 0,
    levelStats = [],
    commonWeaknesses = [],
    recentPractical = [],
    recentMcq = []
  } = analytics || {};

  const {
    overview = {},
    aggregateMetrics = {},
    funnel = []
  } = progression || {};

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
            Analytics-First Hierarchy
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
            Game & Progression Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-sm">
            Level-by-level drop-off funnel, student distribution, average attempts, and practical execution precision.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllAnalytics}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl shadow-sm transition"
            title="Refresh Analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="bg-white border border-gray-200 p-1 rounded-2xl shadow-sm flex space-x-1 text-xs font-extrabold">
            <button
              onClick={() => setActiveTab('progression')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'progression'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <Layers className="w-4 h-4" /> Progression Funnel
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> System Overview
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'progression' ? (
        /* Progression Funnel & Drop-Off Analytics View */
        <div className="space-y-8">
          {/* Top Funnel KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md">
              <span className="text-[11px] font-bold text-gray-500 uppercase block">Total Players Started</span>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-extrabold text-gray-900">{overview.totalLearnersStarted || totalLearners}</span>
                <span className="ml-1.5 text-xs text-gray-500">enrolled</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md">
              <span className="text-[11px] font-bold text-gray-500 uppercase block">Active Players</span>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-extrabold text-blue-600">{overview.totalActivePlayers || 0}</span>
                <span className="ml-1.5 text-xs text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                  {overview.activePercentage || 0}% active
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md">
              <span className="text-[11px] font-bold text-gray-500 uppercase block">Master Completions</span>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-extrabold text-amber-600">{overview.masterCertificatesCount || 0}</span>
                <span className="ml-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                  {overview.masterCompletionRate || 0}% rate
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md">
              <span className="text-[11px] font-bold text-gray-500 uppercase block">Avg Response Speed</span>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-extrabold text-purple-600">
                  {aggregateMetrics.avgResponseSpeedSec || 0}s
                </span>
                <span className="ml-1.5 text-xs text-gray-500 font-medium">per scenario</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md">
              <span className="text-[11px] font-bold text-gray-500 uppercase block">Practical Accuracy</span>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-extrabold text-emerald-600">
                  {aggregateMetrics.avgPracticalAccuracy || avgPracticalScore}%
                </span>
                <span className="ml-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Precision
                </span>
              </div>
            </div>
          </div>

          {/* Aggregated Funnel & Level-by-Level Drop-Off Visualization */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <Layers className="w-6 h-6 text-indigo-600" />
                  Level-by-Level Progression Funnel (L1 through L5)
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Track drop-offs, user conversion retention, completion rates, and average attempts per level.
                </p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
                Funnel Drop-Off Pipeline
              </span>
            </div>

            <div className="space-y-6">
              {funnel.map((step, idx) => {
                const colors = [
                  'from-cyan-500 to-blue-600',
                  'from-blue-600 to-indigo-600',
                  'from-indigo-600 to-purple-600',
                  'from-purple-600 to-amber-600',
                  'from-amber-600 to-emerald-600'
                ];
                const gradient = colors[idx % colors.length];

                return (
                  <div key={step.levelId || idx} className="space-y-3 bg-gray-50/70 p-5 rounded-2xl border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow">
                          L{step.order}
                        </span>
                        <div>
                          <h3 className="font-extrabold text-gray-900 text-sm">{step.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            <span>Unlocked: <strong>{step.unlockedCount}</strong></span>
                            <span>•</span>
                            <span>Completed: <strong className="text-emerald-700">{step.completedCount}</strong></span>
                            <span>•</span>
                            <span>Drop-off: <strong className={step.dropOffCount > 0 ? 'text-rose-600' : 'text-gray-600'}>{step.dropOffCount} learners ({step.dropOffRate}%)</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Pills */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 font-semibold shadow-sm">
                          Avg Attempts: <strong>{step.avgPracticalAttempts} practical</strong> / <strong>{step.avgMcqAttempts} MCQ</strong>
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold">
                          {step.avgPracticalAccuracy}% Accuracy
                        </span>
                        <span className="px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-lg text-purple-800 font-bold">
                          {step.avgResponseSpeedSec}s Speed
                        </span>
                      </div>
                    </div>

                    {/* Progress Funnel Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-600">
                        <span>Conversion / Retention Rate</span>
                        <span>{step.completionPercentage}% of Enrolled Players</span>
                      </div>
                      <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden p-0.5 border border-gray-300/60">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                          style={{ width: `${Math.max(4, step.completionPercentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* System Overview & Weaknesses View (Existing) */
        <div className="space-y-8">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Total Learners</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-gray-900">{totalLearners}</span>
                <span className="ml-2 text-xs font-medium text-gray-500">enrolled</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Avg Practical Score</span>
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-emerald-600">{avgPracticalScore}%</span>
                <span className="ml-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Target: 80%
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Avg MCQ Score</span>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-purple-600">{avgMcqScore}%</span>
                <span className="ml-2 text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Target: 70%
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Completion Rate</span>
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-gray-900">{overallCompletionRate}%</span>
                <span className="ml-2 text-xs text-gray-500">overall</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Per-Level Stats */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 text-blue-600 mr-2" /> Per-Level Performance Breakdown
              </h2>

              <div className="space-y-6">
                {levelStats.map((lvl) => (
                  <div key={lvl.levelId} className="space-y-2 border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">
                        Level {lvl.order}: {lvl.title}
                      </span>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                        {lvl.learnersCompleted} Learners Completed
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-gray-600">
                        <span>Practical Simulation Avg: <strong>{lvl.avgPractical}%</strong></span>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${lvl.avgPractical}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-gray-600">
                        <span>Adaptive MCQ Avg: <strong>{lvl.avgMcq}%</strong></span>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all"
                          style={{ width: `${lvl.avgMcq}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Weaknesses Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" /> Frequent Clinical Weaknesses
              </h2>

              <div className="space-y-4">
                {commonWeaknesses.map((w, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs font-semibold text-gray-700">{w.label}</span>
                    <span className="text-xs font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                      {w.count} errors
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
