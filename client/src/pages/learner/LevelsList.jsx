import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, CheckCircle2, Lock, ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';

export const LevelsList = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await api.get('/levels');
        if (res.success) {
          setLevels(res.levels);
        }
      } catch (err) {
        console.error('Error loading levels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-mono text-sm">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span>Loading Clinical Curriculum...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-mono font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>CURRICULUM ROADMAP</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Emergency Simulation Pathway</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Five standardized Basic Life Support modules. Each level requires passing the clinical practical simulation with at least <strong>75%</strong> to unlock the adaptive theoretical assessment (passing score <strong>70%</strong>).
        </p>
      </div>

      <div className="space-y-4">
        {levels.map((lvl) => {
          const isCompleted = lvl.status === 'completed';
          const isUnlocked = lvl.status === 'unlocked' || lvl.status === 'in_progress';
          const isLocked = lvl.status === 'locked';

          return (
            <div
              key={lvl.id || lvl.levelNumber}
              className={`rounded-2xl p-6 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
                isCompleted
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                  : isUnlocked
                  ? 'bg-slate-900/90 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                  : 'bg-slate-950/60 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-mono font-black text-lg flex-shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                    : isUnlocked
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  0{lvl.levelNumber}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{lvl.title}</h3>
                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                        COMPLETED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">{lvl.description}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-mono text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{lvl.estimatedMinutes || 15} mins</span>
                    </span>

                    {(lvl.practicalScore > 0 || lvl.assessmentScore > 0) && (
                      <span className="text-emerald-400 font-semibold">
                        Practical: {lvl.practicalScore}% | Assessment: {lvl.assessmentScore}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-full sm:w-auto">
                {isUnlocked || isCompleted ? (
                  <Link
                    to={`/levels/${lvl.levelNumber}/learn`}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>{isCompleted ? 'Review & Practice' : 'Launch Level'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 text-xs font-semibold cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Locked</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelsList;
