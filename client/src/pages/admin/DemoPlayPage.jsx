import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import SimulationEngine from '../../simulations/engine/SimulationEngine';
import CprAedSimulation from '../../simulations/level1/CprAedSimulation';
import HemorrhageSimulation from '../../simulations/level2/HemorrhageSimulation';
import ThermalBurnSimulation from '../../simulations/level3/ThermalBurnSimulation';
import ChokingSimulation from '../../simulations/level4/ChokingSimulation';
import SplintingSimulation from '../../simulations/level5/SplintingSimulation';
import { PlaySquare, ShieldAlert, ArrowLeft } from 'lucide-react';

export const DemoPlayPage = () => {
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await api.get('/levels');
        if (res.success) {
          setLevels(res.levels);
        }
      } catch (err) {
        console.error('Error fetching levels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  const handleSelectLevel = async (levelNumber) => {
    try {
      const res = await api.get(`/levels/${levelNumber}`);
      if (res.success) {
        setSelectedLevel(res.level);
      }
    } catch (err) {
      alert('Error launching simulation demo: ' + err.message);
    }
  };

  if (selectedLevel) {
    let Component = CprAedSimulation;
    if (selectedLevel.levelNumber === 2) Component = HemorrhageSimulation;
    if (selectedLevel.levelNumber === 3) Component = ThermalBurnSimulation;
    if (selectedLevel.levelNumber === 4) Component = ChokingSimulation;
    if (selectedLevel.levelNumber === 5) Component = SplintingSimulation;

    return (
      <div>
        <div className="bg-purple-950/90 border-b border-purple-800 px-4 py-2 flex items-center justify-between text-xs font-mono text-purple-200">
          <span className="flex items-center space-x-2">
            <PlaySquare className="w-4 h-4 text-purple-400" />
            <span>SANDBOX DEMO MODE: Level {selectedLevel.levelNumber} ({selectedLevel.title})</span>
          </span>
          <button
            onClick={() => setSelectedLevel(null)}
            className="px-3 py-1 bg-purple-900 hover:bg-purple-800 rounded-lg text-white font-semibold flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Demo Mode</span>
          </button>
        </div>

        <SimulationEngine
          level={selectedLevel}
          SimulationComponent={Component}
          isDemo={true}
          onFinishDemo={() => setSelectedLevel(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800 text-purple-300 text-xs font-mono font-semibold mb-2">
          <PlaySquare className="w-3.5 h-3.5" />
          <span>SIMULATION PLAYGROUND SANDBOX</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Demo Play Mode</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Launch and evaluate any of the 5 emergency simulations in a sandbox mode. Test real-time telemetry, touch/drag widgets, and scoring algorithms <strong>without altering learner records or database mastery tables</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((lvl) => (
          <div
            key={lvl.id || lvl.levelNumber}
            className="glass-card rounded-2xl p-5 border border-purple-500/30 hover:border-purple-500/60 shadow-lg shadow-purple-950/20 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  DEMO LEVEL 0{lvl.levelNumber}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Sandbox Ready</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">{lvl.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-3 mb-4">{lvl.description}</p>
            </div>

            <button
              onClick={() => handleSelectLevel(lvl.levelNumber)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/30 transition-all"
            >
              <PlaySquare className="w-4 h-4" />
              <span>Launch Demo Simulation</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemoPlayPage;
