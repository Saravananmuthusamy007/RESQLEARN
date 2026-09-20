import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Play,
  Clock,
  ShieldCheck,
  Shield,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [levels, setLevels] = useState([]);
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [levelsRes, certRes] = await Promise.all([
          api.get('/levels'),
          api.get('/certificate').catch(() => ({ success: false })),
        ]);

        if (levelsRes.success) {
          setLevels(levelsRes.levels);
        }
        if (certRes.success) {
          setCertificateData(certRes);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const completedLevels = levels.filter(l => l.status === 'completed');
  const inProgressLevels = levels.filter(l => l.status === 'in_progress' || l.status === 'unlocked');
  const nextActiveLevel = levels.find(l => l.status === 'unlocked' || l.status === 'in_progress') || levels[0];
  const overallProgressPct = Math.round((completedLevels.length / 5) * 100);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-mono text-sm">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span>Loading Cadet Clinical Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Medical Director Banner if Admin is viewing Learner Dashboard */}
      {user?.role === 'admin' && (
        <div className="rounded-2xl p-4 bg-purple-950/70 border border-purple-800 text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900 border border-purple-700 flex items-center justify-center text-purple-300 flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Medical Simulation Director Account (Admin)</div>
              <div className="text-[11px] text-purple-300">
                You are currently previewing the cadet training dashboard. Access your dedicated portal to review telemetry, update levels, read feedback, and query Admin AI.
              </div>
            </div>
          </div>
          <Link
            to="/admin"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md flex-shrink-0 transition-all font-mono"
          >
            <span>Open Admin Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 bottom-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono font-semibold mb-3">
              <Activity className="w-3.5 h-3.5 text-rose-400 animate-heartbeat" />
              <span>ACTIVE CLINICAL CADET</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="text-cyan-400">{user?.name}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Advance through the 5 standardized emergency First-Aid and BLS simulations. Achieve &ge;75% practical scores and &ge;70% on adaptive assessments to earn certification.
            </p>
          </div>

          {/* Quick Action CTA */}
          {nextActiveLevel && (
            <Link
              to={`/levels/${nextActiveLevel.levelNumber}/learn`}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-rose-900/30 flex items-center justify-center space-x-3 transition-all flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Resume: Level {nextActiveLevel.levelNumber}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pathway Progress */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Pathway Mastery</div>
            <div className="text-2xl font-black text-white font-mono mt-1">{overallProgressPct}%</div>
            <div className="text-[11px] text-cyan-400 mt-0.5">{completedLevels.length} of 5 Levels Completed</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Levels */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Verified Modules</div>
            <div className="text-2xl font-black text-white font-mono mt-1">{completedLevels.length}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Meets clinical thresholds</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Current Active */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Current Objective</div>
            <div className="text-xl font-bold text-white truncate max-w-[150px] mt-1">
              Level {nextActiveLevel?.levelNumber || 1}
            </div>
            <div className="text-[11px] text-amber-400 mt-0.5 truncate max-w-[150px]">
              {nextActiveLevel?.title || 'CPR / AED'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Certification Status */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Certification</div>
            <div className="text-xl font-bold text-white mt-1">
              {certificateData?.isEligible ? 'VERIFIED' : 'PENDING'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {certificateData?.isEligible ? 'SHA-256 Registry Active' : `${5 - completedLevels.length} levels remaining`}
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
            certificateData?.isEligible
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}>
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Five Levels Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Emergency Simulation Modules</h2>
            <p className="text-xs text-slate-400">Complete each level sequentially to unlock the next.</p>
          </div>
          <Link
            to="/levels"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((lvl) => {
            const isCompleted = lvl.status === 'completed';
            const isUnlocked = lvl.status === 'unlocked' || lvl.status === 'in_progress';
            const isLocked = lvl.status === 'locked';

            return (
              <div
                key={lvl.id || lvl.levelNumber}
                className={`glass-card rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-500/30 hover:border-emerald-500/60'
                    : isUnlocked
                    ? 'border-cyan-500/30 hover:border-cyan-500/60 shadow-lg shadow-cyan-950/20'
                    : 'border-slate-800/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      LEVEL 0{lvl.levelNumber}
                    </span>

                    {isCompleted ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded-full">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{lvl.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{lvl.description}</p>
                </div>

                <div>
                  {/* Scores Overview */}
                  {(lvl.practicalScore > 0 || lvl.assessmentScore > 0) && (
                    <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
                      <div>
                        <div className="text-slate-500 text-[10px]">PRACTICAL</div>
                        <div className={`font-bold ${lvl.practicalScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {lvl.practicalScore}% {lvl.practicalScore >= 75 ? '✓' : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">THEORY MCQ</div>
                        <div className={`font-bold ${lvl.assessmentScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {lvl.assessmentScore}% {lvl.assessmentScore >= 70 ? '✓' : ''}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Link */}
                  {isUnlocked || isCompleted ? (
                    <Link
                      to={`/levels/${lvl.levelNumber}/learn`}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                    >
                      <span>{isCompleted ? 'Review & Practice' : 'Start Learning Module'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-600 border border-slate-800/80 text-xs font-semibold cursor-not-allowed flex items-center justify-center space-x-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Complete Level {lvl.levelNumber - 1} First</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
