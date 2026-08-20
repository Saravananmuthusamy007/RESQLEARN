import React, { useState, useEffect } from 'react';
import { Sliders, Play, RotateCcw, CheckCircle2, Zap } from 'lucide-react';

const UnitySimFrame = ({ onSubmitSimulation, isSubmitting }) => {
  const [actionCorrectness, setActionCorrectness] = useState(85);
  const [targetAccuracy, setTargetAccuracy] = useState(80);
  const [sequenceCorrect, setSequenceCorrect] = useState(true);
  const [responseTimeMs, setResponseTimeMs] = useState(45000);

  // Listen to postMessage from Unity WebGL iframe if active
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'PRACTICAL_SIM_COMPLETE') {
        const { actionCorrectness, targetAccuracy, sequenceCorrect, responseTimeMs } = event.data.data;
        onSubmitSimulation({
          actionCorrectness,
          targetAccuracy,
          sequenceCorrect,
          responseTimeMs
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSubmitSimulation]);

  const handleApplyPreset = (preset) => {
    if (preset === 'perfect') {
      setActionCorrectness(100);
      setTargetAccuracy(100);
      setSequenceCorrect(true);
      setResponseTimeMs(30000);
    } else if (preset === 'passing') {
      setActionCorrectness(85);
      setTargetAccuracy(80);
      setSequenceCorrect(true);
      setResponseTimeMs(45000);
    } else if (preset === 'failing') {
      setActionCorrectness(60);
      setTargetAccuracy(50);
      setSequenceCorrect(false);
      setResponseTimeMs(75000);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    onSubmitSimulation({
      actionCorrectness: Number(actionCorrectness),
      targetAccuracy: Number(targetAccuracy),
      sequenceCorrect: Boolean(sequenceCorrect),
      responseTimeMs: Number(responseTimeMs)
    });
  };

  // Calculated live preview score
  const liveScore = Math.min(100, Math.round((actionCorrectness * 0.4) + (targetAccuracy * 0.35) + (sequenceCorrect ? 25 : 0)));

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Simulation Screen Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          <h2 className="text-xl font-bold tracking-wide">3D Practical First-Aid Simulation</h2>
        </div>
        <span className="text-xs bg-blue-600/30 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-full font-mono">
          WebGL Integration Ready
        </span>
      </div>

      {/* Simulated 3D Canvas Container */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {/* Background Decorative Grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative z-10 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-blue-600/20 border-2 border-blue-400/50 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner">
            <Zap className="w-10 h-10 text-blue-400 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Interactive Simulation Canvas</h3>
          <p className="text-sm text-slate-300 mb-6">
            WebGL Unity simulation environment listener active. Perform first-aid actions using the interactive simulation payload generator below.
          </p>
        </div>
      </div>

      {/* Interactive Mock Simulation Control Panel */}
      <div className="p-6 bg-slate-50 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-slate-800 font-bold text-lg">
            <Sliders className="w-5 h-5 mr-2 text-blue-600" />
            Interactive Simulation Payload Controller
          </div>
          <div className="text-sm font-semibold text-gray-600">
            Live Preview Score: <span className={`text-base font-extrabold ${liveScore >= 80 ? 'text-green-600' : 'text-amber-600'}`}>{liveScore}%</span>
          </div>
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-xs text-gray-500 self-center mr-2 font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset('perfect')}
            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg transition"
          >
            🎯 Perfect (100%)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('passing')}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-semibold rounded-lg transition"
          >
            ✅ Passing (85%)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('failing')}
            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded-lg transition"
          >
            ⚠️ Failing (60%)
          </button>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Action Correctness Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>Action Technique Correctness (40% weight)</span>
                <span className="text-blue-600 font-bold">{actionCorrectness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={actionCorrectness}
                onChange={(e) => setActionCorrectness(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Target Accuracy Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>Anatomical Target Accuracy (35% weight)</span>
                <span className="text-indigo-600 font-bold">{targetAccuracy}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={targetAccuracy}
                onChange={(e) => setTargetAccuracy(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Sequence Correctness Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
              <div>
                <span className="block text-xs font-semibold text-gray-800">Protocol Sequence Order</span>
                <span className="text-[11px] text-gray-500">25 points bonus for correct sequence</span>
              </div>
              <button
                type="button"
                onClick={() => setSequenceCorrect(!sequenceCorrect)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center ${
                  sequenceCorrect
                    ? 'bg-green-600 text-white'
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}
              >
                {sequenceCorrect ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <RotateCcw className="w-3.5 h-3.5 mr-1" />}
                {sequenceCorrect ? 'Correct Sequence' : 'Sequence Error'}
              </button>
            </div>

            {/* Response Time Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>Completion Response Time</span>
                <span className="text-purple-600 font-bold">{Math.round(responseTimeMs / 1000)}s</span>
              </div>
              <input
                type="range"
                min="10000"
                max="120000"
                step="1000"
                value={responseTimeMs}
                onChange={(e) => setResponseTimeMs(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" /> Complete & Submit Practical Simulation
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UnitySimFrame;
