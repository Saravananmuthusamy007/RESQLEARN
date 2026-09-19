import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, Star, CheckCircle2 } from 'lucide-react';

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        if (res.success) {
          setAnalytics(res);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 font-mono text-sm">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span>Synthesizing Cohort Recharts Telemetry...</span>
      </div>
    );
  }

  const levelStats = analytics?.levelStats || [];
  const scoreDistribution = analytics?.scoreDistribution || [];
  const commonWeakAreas = analytics?.commonWeakAreas || [];
  const ratingBreakdown = analytics?.ratingBreakdown || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-mono font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>RECHARTS PERFORMANCE TELEMETRY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Curriculum & Telemetry Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Aggregated simulation performance metrics, pass rates, score cohorts, and weak areas.
        </p>
      </div>

      {/* Chart 1: Average Practical Score vs Average Theory Score */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Average Practical vs. Assessment Scores by Level</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Thresholds: Practical &ge; 75%, Theory &ge; 70%</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={levelStats} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="avgPracticalScore" name="Avg Practical Score (%)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              <Bar dataKey="avgAssessmentScore" name="Avg Assessment Score (%)" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-Column Grid: Score Distribution & Pass Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Score Cohort Distribution */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>Practical Score Cohort Distribution</span>
          </h2>
          <p className="text-xs text-slate-400">Total attempts partitioned by score bracket.</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Attempt Count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Level Pass Rate */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Practical Simulation Pass Rate (%)</span>
          </h2>
          <p className="text-xs text-slate-400">Percentage of runs achieving &ge;75% score on first or subsequent attempts.</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={levelStats} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="passRate"
                  name="Pass Rate (%)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Common Weak Areas & Rating Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Common Weak Areas List */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Frequent Clinical Remediation Areas</span>
          </h2>
          <p className="text-xs text-slate-400">Top procedural weaknesses detected across all simulation telemetry.</p>

          <div className="space-y-2.5">
            {commonWeakAreas.length > 0 ? (
              commonWeakAreas.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-300 font-medium">{item.area}</span>
                  <span className="font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">
                    {item.count} detections
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center">
                No recurring clinical weak areas recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Feedback Breakdown */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Cadet Satisfaction Rating Breakdown</span>
          </h2>
          <p className="text-xs text-slate-400">Distribution of feedback ratings across all modules.</p>

          <div className="space-y-2">
            {ratingBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-xs font-mono">
                <span className="w-16 text-slate-400">{item.rating}</span>
                <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{
                      width: `${analytics?.summary?.totalFeedbackCount > 0 ? (item.count / analytics.summary.totalFeedbackCount) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="w-12 text-right text-slate-300 font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
