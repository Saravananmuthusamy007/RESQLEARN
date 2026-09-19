import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  BookOpen,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const LearningModule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const res = await api.get(`/levels/${id}`);
        if (res.success) {
          setLevel(res.level);
        }
      } catch (err) {
        setError(err.message || 'Error loading learning module.');
      } finally {
        setLoading(false);
      }
    };

    fetchLevel();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400 font-mono text-sm">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span>Loading Clinical Learning Module...</span>
      </div>
    );
  }

  if (error || !level) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="p-6 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-rose-400" />
          <h2 className="text-lg font-bold">Access Restricted</h2>
          <p className="text-xs text-rose-300 mt-1 mb-4">{error}</p>
          <Link to="/levels" className="px-4 py-2 bg-rose-600 rounded-lg text-xs font-semibold text-white">
            Return to Curriculum
          </Link>
        </div>
      </div>
    );
  }

  const content = level.learningContent || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 mb-2">
            <span>LEVEL 0{level.levelNumber}</span>
            <span>•</span>
            <span>{level.subtitle || 'Clinical BLS Protocol'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{level.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">{level.description}</p>
        </div>

        <button
          onClick={() => navigate(`/levels/${level.levelNumber}/simulation`)}
          className="px-6 py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-rose-900/30 flex items-center justify-center space-x-2 transition-all flex-shrink-0"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Launch Interactive Simulation</span>
        </button>
      </div>

      {/* Clinical Overview */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>Clinical Overview & Pathophysiology</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          {content.overview}
        </p>
      </div>

      {/* Core Principles Cards */}
      {content.corePrinciples?.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase font-mono tracking-wider mb-3">
            Core BLS Principles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.corePrinciples.map((principle, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-bold text-cyan-400 font-mono mb-1">{principle.title}</div>
                <div className="text-xs text-slate-300">{principle.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Procedure Steps Preview */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase font-mono tracking-wider mb-3">
          Interactive Procedure Sequence ({level.procedureSteps?.length || 6} Steps)
        </h2>
        <div className="space-y-2.5">
          {level.procedureSteps?.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3.5"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {step.stepIndex}
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white">{step.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{step.instruction}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Warnings (Red Alert) */}
      {content.criticalWarnings?.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-950/60 border border-rose-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-300 font-mono uppercase">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Critical Clinical Contraindications & Hazards</span>
          </div>
          <ul className="space-y-1.5 text-xs text-rose-200 list-disc list-inside">
            {content.criticalWarnings.map((warn, idx) => (
              <li key={idx} className="leading-normal">{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Start Simulation CTA */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={() => navigate(`/levels/${level.levelNumber}/simulation`)}
          className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-rose-900/40 flex items-center justify-center space-x-3 transition-all"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>I Understand — Enter Simulation</span>
        </button>
      </div>
    </div>
  );
};

export default LearningModule;
