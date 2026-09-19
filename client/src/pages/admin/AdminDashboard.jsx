import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Activity,
  Users,
  Award,
  BarChart3,
  BookOpen,
  PlaySquare,
  Bot,
  MessageSquare,
  Shield,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboard = () => {
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
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-mono text-sm">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span>Aggregating Platform Intelligence...</span>
      </div>
    );
  }

  const summary = analytics?.summary || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-950 border border-purple-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-mono font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>EXECUTIVE MEDICAL DIRECTOR PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Simulation Administration & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Real-time cohort monitoring, telemetry aggregation, curriculum versioning, and isolated simulation demo play.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/demo"
            className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-purple-900/30 transition-all"
          >
            <PlaySquare className="w-4 h-4" />
            <span>Launch Demo Play Sandbox</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Cadets</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{summary.totalLearners || 0}</div>
          <div className="text-[11px] text-cyan-400 mt-0.5">Enrolled trainees</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Verified Certificates</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{summary.totalCertificates || 0}</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">All 5 levels passed</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Simulation Runs</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{summary.totalSimAttempts || 0}</div>
          <div className="text-[11px] text-purple-400 mt-0.5">Telemetry attempts</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">MCQ Assessments</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{summary.totalAssessments || 0}</div>
          <div className="text-[11px] text-amber-400 mt-0.5">Evaluated sessions</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Avg Cadet Rating</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{summary.avgFeedbackRating || '5.0'} / 5</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{summary.totalFeedbackCount || 0} reviews</div>
        </div>
      </div>

      {/* Quick Navigation Admin Modules */}
      <div>
        <h2 className="text-base font-bold text-white mb-3">Administrative Control Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/analytics"
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Interactive Analytics
                </div>
                <div className="text-xs text-slate-400">Recharts pass rates & cohorts</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </Link>

          <Link
            to="/admin/learners"
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                  Learner Management
                </div>
                <div className="text-xs text-slate-400">Search, filter & telemetry logs</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </Link>

          <Link
            to="/admin/levels"
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  Level Editor & Versioning
                </div>
                <div className="text-xs text-slate-400">Modify steps, scoring & questions</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </Link>

          <Link
            to="/admin/demo"
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center">
                <PlaySquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                  Admin Demo Play Mode
                </div>
                <div className="text-xs text-slate-400">Test simulations without DB impact</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
          </Link>

          <Link
            to="/admin/learning-partner"
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                  Admin Intelligence AI
                </div>
                <div className="text-xs text-slate-400">Query platform trends & Gemini</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </Link>

          <Link
            to="/admin/feedback"
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  Feedback Review
                </div>
                <div className="text-xs text-slate-400">Read reviews and cadet bugs</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
