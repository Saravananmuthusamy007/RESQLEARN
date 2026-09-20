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
  User,
  CheckCircle2,
  Database,
  Sparkles,
  Star,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, feedbackRes] = await Promise.all([
          api.get('/admin/analytics').catch(() => null),
          api.get('/feedback').catch(() => null),
        ]);

        if (analyticsRes?.success) {
          setAnalytics(analyticsRes);
        }
        if (feedbackRes?.success && feedbackRes.feedbacks) {
          setRecentFeedbacks(feedbackRes.feedbacks.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load admin analytics or feedback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-mono text-sm">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span>Aggregating Platform Intelligence & Clinical Telemetry...</span>
      </div>
    );
  }

  const summary = analytics?.summary || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner with Database Verification Badge */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-950 border border-purple-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-mono font-semibold">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>EXECUTIVE MEDICAL DIRECTOR PORTAL</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-semibold">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>DATABASE: RESQLEARN (ACTIVE)</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Simulation Administration & Analytics</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Dedicated administrative control center: real-time telemetry analytics, curriculum level editing, trainee cadet feedback, executive helper AI, and director credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/levels"
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Update Levels</span>
            </Link>
            <Link
              to="/admin/feedback"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Read Feedback</span>
            </Link>
            <Link
              to="/admin/demo"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg transition-all"
            >
              <PlaySquare className="w-4 h-4" />
              <span>Demo Sandbox</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Cadets</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{summary.totalLearners || 0}</div>
          <div className="text-[11px] text-cyan-400 mt-0.5">Enrolled trainees in resqlearn</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Verified Certificates</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{summary.totalCertificates || 0}</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">All 5 levels passed</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Simulation Runs</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{summary.totalSimAttempts || 0}</div>
          <div className="text-[11px] text-purple-400 mt-0.5">Telemetry attempt records</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">MCQ Assessments</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{summary.totalAssessments || 0}</div>
          <div className="text-[11px] text-amber-400 mt-0.5">Evaluated sessions</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Cadet Satisfaction</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{summary.avgFeedbackRating || '5.0'} / 5</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{summary.totalFeedbackCount || 0} reviews logged</div>
        </div>
      </div>

      {/* Complete Dedicated Administrative Control Modules (All 7 Sections) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Executive Control Modules</h2>
            <p className="text-xs text-slate-400">Direct operational modules for training governance and clinical oversight.</p>
          </div>
          <span className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800/80 px-2.5 py-1 rounded-lg font-semibold">
            7 Active Modules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Module 1: Interactive Analytics */}
          <Link
            to="/admin/analytics"
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group h-full"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/80 font-bold">
                  RECHARTS
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                Interactive Analytics
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Recharts telemetry graphs: practical vs theory scores, pass rates, score cohorts, and weak areas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-semibold">
              <span>View Telemetry</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 2: Update Level / Level Editor */}
          <Link
            to="/admin/levels"
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group h-full"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/80 font-bold">
                  LEVELVERSION
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                Update Level & Versioning
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Modify simulation steps, clinical overviews, scoring weights (accuracy, sequence, pacing), and publish versions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-semibold">
              <span>Edit Curriculum</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 3: Reading Feedback */}
          <Link
            to="/admin/feedback"
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between group h-full"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/80 font-bold">
                  CADET REVIEWS
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                Reading Feedback
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Review cadet ratings, realism feedback, bug reports, and UX recommendations from completed simulations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 font-semibold">
              <span>Inspect Reviews</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 4: Admin Helper AI */}
          <Link
            to="/admin/learning-partner"
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col justify-between group h-full"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800/80 font-bold flex items-center space-x-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>GEMINI 2.5</span>
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                Admin Helper AI
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Gemini-powered executive simulation intelligence. Analyze cohort trends, error patterns, and clinical guidelines.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-teal-400 font-semibold">
              <span>Consult AI</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 5: Medical Director Profile */}
          <Link
            to="/admin/profile"
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between group h-full"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/80 font-bold">
                  CREDENTIALS
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                Admin Profile
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Manage executive credentials, medical institution affiliation, instructor license ID, and professional bio.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-purple-400 font-semibold">
              <span>Update Profile</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 6: Learner Management */}
          <Link
            to="/admin/learners"
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between group h-full"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/80 font-bold">
                  AUDIT ROSTER
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                Learner Roster & Audit
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Inspect cadet progression, telemetry attempts, level mastery matrix (1–5), and verify SHA-256 certificate hashes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-semibold">
              <span>Inspect Cadets</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 7: Admin Demo Play Mode */}
          <Link
            to="/admin/demo"
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-rose-500/50 transition-all flex flex-col justify-between group h-full sm:col-span-2 lg:col-span-1"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center">
                  <PlaySquare className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/80 font-bold">
                  ISOLATED SANDBOX
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                Simulation Demo Sandbox
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Live sandbox testing across all 5 clinical levels without recording scores or affecting cadet database records.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-rose-400 font-semibold">
              <span>Launch Sandbox</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Cadet Feedback Preview Section */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Latest Trainee Cadet Feedback</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time simulation feedback submitted by cadets.</p>
          </div>
          <Link
            to="/admin/feedback"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            <span>View All Feedback</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recentFeedbacks.length > 0 ? (
            recentFeedbacks.map((f) => (
              <div key={f._id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white truncate max-w-[120px]">
                    {f.learner?.name || 'Cadet'}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {[...Array(f.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 italic">
                  "{f.message}"
                </p>
                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span>{f.category || 'General'}</span>
                  <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-6 text-xs text-slate-500 font-mono">
              No cadet feedback submitted yet. Reviews will automatically stream here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
