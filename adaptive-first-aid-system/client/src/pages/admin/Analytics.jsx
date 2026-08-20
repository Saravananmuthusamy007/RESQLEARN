import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, Users, BookOpen, Activity, AlertTriangle, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
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
        <p className="text-gray-600 text-sm">Aggregating system-wide learning analytics...</p>
      </div>
    );
  }

  if (!analytics) return null;

  const {
    totalLearners,
    totalLevels,
    overallCompletionRate,
    avgPracticalScore,
    avgMcqScore,
    levelStats,
    commonWeaknesses,
    recentPractical,
    recentMcq
  } = analytics;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
          Admin Portal
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-2">System Analytics & Performance Monitoring</h1>
        <p className="text-gray-600 text-sm">
          Real-time aggregated metrics across practical assessments, adaptive MCQs, and learner weaknesses.
        </p>
      </div>

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

      {/* Analytics Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Per-Level Stats (2 cols) */}
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

                {/* Practical Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-gray-600">
                    <span>Practical Simulation Avg: <strong>{lvl.avgPractical}%</strong></span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${lvl.avgPractical}%` }}
                    ></div>
                  </div>
                </div>

                {/* MCQ Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-gray-600">
                    <span>Adaptive MCQ Avg: <strong>{lvl.avgMcq}%</strong></span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all"
                      style={{ width: `${lvl.avgMcq}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Weaknesses (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center text-amber-700">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" /> Common Learner Weaknesses
          </h2>

          <div className="space-y-4">
            {commonWeaknesses.map((w, idx) => (
              <div key={idx} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950">{w.label}</span>
                <span className="px-2.5 py-1 bg-amber-600 text-white font-extrabold text-xs rounded-full">
                  {w.count} errors
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Logs */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <Clock className="w-5 h-5 text-indigo-600 mr-2" /> Recent Learner Simulation & Quiz Activity
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-bold uppercase">
                <th className="p-3">Learner</th>
                <th className="p-3">Level</th>
                <th className="p-3">Assessment Type</th>
                <th className="p-3">Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentPractical.map((att) => (
                <tr key={att._id} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">{att.user?.name || 'Learner'}</td>
                  <td className="p-3 font-medium">Level {att.level?.order}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">Practical</span></td>
                  <td className="p-3 font-bold text-gray-900">{att.compositeScore}%</td>
                  <td className="p-3">
                    {att.passed ? (
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">Passed</span>
                    ) : (
                      <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded font-bold">Failed</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-500">{new Date(att.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
              {recentMcq.map((att) => (
                <tr key={att._id} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">{att.user?.name || 'Learner'}</td>
                  <td className="p-3 font-medium">Level {att.level?.order}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold">Adaptive MCQ</span></td>
                  <td className="p-3 font-bold text-gray-900">{att.score}%</td>
                  <td className="p-3">
                    {att.passed ? (
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">Passed</span>
                    ) : (
                      <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded font-bold">Failed</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-500">{new Date(att.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
