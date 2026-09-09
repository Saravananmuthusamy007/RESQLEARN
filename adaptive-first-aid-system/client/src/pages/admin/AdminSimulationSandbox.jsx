import React, { useState } from 'react';
import RealisticSimulationWrapper from '../../components/simulation/realistic/RealisticSimulationWrapper';
import PhaserGame from '../../components/simulation/PhaserGame';
import { ShieldCheck, Sparkles, Gamepad2, Play, CheckCircle2, RotateCcw, AlertTriangle, Layers } from 'lucide-react';

const LEVELS = [
  { id: 1, title: 'Level 1: CPR & Response Check', desc: 'Metronome pulse, chest compression depth (5cm), hand alignment' },
  { id: 2, title: 'Level 2: Wound Care & Bleeding', desc: 'Direct firm pressure timer, sterile gauze & pressure bandage' },
  { id: 3, title: 'Level 3: Burns Management', desc: 'Cool water irrigation slider, non-adherent sterile dressing wrap' },
  { id: 4, title: 'Level 4: Choking Response', desc: 'Heimlich thrust hotspot, upward & inward force/angle prompt' },
  { id: 5, title: 'Level 5: Fracture & Sprain Support', desc: 'Padded splint alignment, sequential joint immobilization ties' }
];

const AdminSimulationSandbox = () => {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [simEngine, setSimEngine] = useState('realistic'); // 'realistic' | 'phaser'
  const [sandboxResult, setSandboxResult] = useState(null);
  const [keyReset, setKeyReset] = useState(0);

  const handleSandboxComplete = (data) => {
    setSandboxResult(data);
  };

  const handleLevelChange = (lvlId) => {
    setSelectedLevel(lvlId);
    setSandboxResult(null);
    setKeyReset(prev => prev + 1);
  };

  const handleRestart = () => {
    setSandboxResult(null);
    setKeyReset(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Isolation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/40 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Isolated Quality Control Environment
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Simulation Preview Sandbox
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Conduct quality assurance tests on any clinical simulation without polluting platform metrics, leaderboard data, or learner progress histories.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-700 text-center min-w-[200px] space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Analytics Guard</span>
            <span className="text-emerald-400 font-extrabold text-sm flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> 100% Data Isolated
            </span>
            <span className="text-[10px] text-slate-500 block">Bypasses Student Attempt DB</span>
          </div>
        </div>
      </div>

      {/* Level Selection & Engine Selector Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Level Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => handleLevelChange(lvl.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedLevel === lvl.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>L{lvl.id}: {lvl.title.split(':')[1]?.trim() || lvl.title}</span>
            </button>
          ))}
        </div>

        {/* Engine Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs shrink-0 self-start md:self-center">
          <button
            onClick={() => setSimEngine('realistic')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              simEngine === 'realistic'
                ? 'bg-white text-indigo-700 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Motion Lab
          </button>
          <button
            onClick={() => setSimEngine('phaser')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              simEngine === 'phaser'
                ? 'bg-white text-indigo-700 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" /> Phaser Canvas
          </button>
        </div>
      </div>

      {/* Active Level Inspector Banner */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-900">
        <div>
          <strong className="font-extrabold text-sm">{LEVELS.find(l => l.id === selectedLevel)?.title}</strong>
          <p className="text-indigo-700 text-[11px] mt-0.5">{LEVELS.find(l => l.id === selectedLevel)?.desc}</p>
        </div>
        <button
          onClick={handleRestart}
          className="px-4 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl shadow-sm transition flex items-center gap-1 self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart Sandbox
        </button>
      </div>

      {/* Embedded Simulation Preview Workspace */}
      <div className="bg-slate-950 p-2 sm:p-4 rounded-3xl border border-slate-800 shadow-2xl">
        {simEngine === 'realistic' ? (
          <RealisticSimulationWrapper
            key={`sandbox-realistic-${selectedLevel}-${keyReset}`}
            levelId={selectedLevel}
            isSandbox={true}
            onSandboxComplete={handleSandboxComplete}
          />
        ) : (
          <PhaserGame
            key={`sandbox-phaser-${selectedLevel}-${keyReset}`}
            levelId={selectedLevel}
            eventBridge={{
              onComplete: handleSandboxComplete
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminSimulationSandbox;
