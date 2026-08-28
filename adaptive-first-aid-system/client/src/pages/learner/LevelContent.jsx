// LevelContent.jsx - Interactive Level Instructional Content & Rebuilt Animated Video Guide Player

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Play, Pause, RotateCcw, Lock, CheckCircle2, Award, ListChecks, Tv, HeartPulse, ExternalLink, Sparkles } from 'lucide-react';

const LevelContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Video Mode State
  const [videoMode, setVideoMode] = useState('animated'); // 'animated' or 'youtube'
  const [animStep, setAnimStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const animTimerRef = useRef(null);

  useEffect(() => {
    fetchLevelDetail();
    return () => {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    };
  }, [id]);

  useEffect(() => {
    if (isPlaying && level && level.instructions && level.instructions.length > 0) {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
      animTimerRef.current = setInterval(() => {
        setAnimStep((prev) => (prev + 1) % level.instructions.length);
      }, 4000);
    } else {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    }
  }, [isPlaying, level]);

  const fetchLevelDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/levels/${id}`);
      setLevel(res.data);
      setAnimStep(0);
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('This level is locked. Complete the previous level to access content.');
      } else {
        setError(err.response?.data?.message || 'Failed to load level detail');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-rose-950 border border-rose-800 p-8 rounded-2xl text-white">
          <Lock className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-rose-300 mb-2">Access Denied</h2>
          <p className="text-rose-200 mb-6">{error}</p>
          <Link
            to="/levels"
            className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white font-medium rounded-xl hover:bg-cyan-500 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Level List
          </Link>
        </div>
      </div>
    );
  }

  const instructions = level.instructions || [];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-slate-950 min-h-screen text-slate-100">
      {/* Navigation & Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/levels"
          className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to All Levels
        </Link>
        <span className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-semibold rounded-full">
          Level {level.order} Instructions
        </span>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden mb-8">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border-b border-slate-800">
          <h1 className="text-3xl font-black text-slate-100 mb-3">{level.title}</h1>
          <p className="text-slate-300 text-base leading-relaxed">{level.description}</p>

          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-800 text-xs font-semibold">
            <div className="flex items-center bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 text-emerald-400">
              <Award className="w-4 h-4 mr-2" />
              <span>Practical Pass Threshold: <strong className="text-emerald-300">{level.practicalThreshold}%</strong></span>
            </div>
            <div className="flex items-center bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 text-purple-400">
              <Award className="w-4 h-4 mr-2" />
              <span>MCQ Pass Threshold: <strong className="text-purple-300">{level.mcqThreshold}%</strong></span>
            </div>
          </div>
        </div>

        {/* Dual-Mode Video Guide Player Header */}
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-950">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Tv className="w-5 h-5 text-cyan-400" />
                Instructional Procedure Video Guide
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Switch between Interactive Anatomical Video Animation & Official Video Guide</p>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setVideoMode('animated')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  videoMode === 'animated'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Interactive Animation
              </button>

              <button
                onClick={() => setVideoMode('youtube')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  videoMode === 'youtube'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                YouTube Guide
              </button>
            </div>
          </div>

          {/* Player Container */}
          {videoMode === 'animated' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-inner relative overflow-hidden">
              {/* Step Animation Display Box */}
              <div className="aspect-[16/9] w-full max-h-[380px] bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between p-6 relative overflow-hidden">
                {/* Anatomical Background Vector Illustration */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <HeartPulse className="w-64 h-64 text-cyan-500 animate-pulse" />
                </div>

                {/* Animated Step Header */}
                <div className="flex justify-between items-center z-10">
                  <span className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold rounded-full">
                    Step {animStep + 1} of {instructions.length}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    AUTOPLAY: {isPlaying ? 'ON (4s)' : 'PAUSED'}
                  </span>
                </div>

                {/* Main Animated Instruction Card */}
                <div className="z-10 text-center my-auto px-4">
                  <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-950/50 animate-bounce">
                    <span className="text-2xl font-black text-cyan-400">{animStep + 1}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug max-w-2xl mx-auto">
                    {instructions[animStep] || 'Follow standard medical first-aid protocol.'}
                  </h3>
                </div>

                {/* Interactive Player Controls */}
                <div className="z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition shadow"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setAnimStep(0)}
                      className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Replay from Step 1"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Step Scrubbing Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {instructions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setAnimStep(idx);
                          setIsPlaying(false);
                        }}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          animStep === idx
                            ? 'bg-cyan-500 text-slate-950 scale-110 shadow'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-xl overflow-hidden shadow-inner bg-black border border-slate-800">
                <iframe
                  src={level.videoUrl}
                  title={level.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="flex justify-end">
                <a
                  href={level.videoUrl ? level.videoUrl.replace('/embed/', '/watch?v=') : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Watch directly on YouTube
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Step-by-Step Action Protocol */}
        <div className="p-6 sm:p-8 bg-slate-900">
          <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center">
            <ListChecks className="w-5 h-5 text-cyan-400 mr-2" />
            Step-by-Step Action Protocol
          </h2>
          <div className="space-y-3">
            {instructions.map((step, idx) => (
              <div
                key={idx}
                className={`flex items-start p-4 rounded-xl border transition-all ${
                  animStep === idx && videoMode === 'animated'
                    ? 'bg-cyan-950/60 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-sm mr-4">
                  {idx + 1}
                </span>
                <p className="text-slate-200 text-sm leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Trigger Footer */}
        <div className="p-6 sm:p-8 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-100 text-base">Ready for the Practical Simulation?</h3>
            <p className="text-xs text-slate-400 mt-0.5">Test your technique, positioning, and sequence timing in the interactive 2D simulation engine.</p>
          </div>
          <button
            onClick={() => navigate(`/practical/${level._id}`)}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" /> Start Interactive Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelContent;
