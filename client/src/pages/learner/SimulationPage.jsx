import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import SimulationEngine from '../../simulations/engine/SimulationEngine';
import CprAedSimulation from '../../simulations/level1/CprAedSimulation';
import HemorrhageSimulation from '../../simulations/level2/HemorrhageSimulation';
import ThermalBurnSimulation from '../../simulations/level3/ThermalBurnSimulation';
import ChokingSimulation from '../../simulations/level4/ChokingSimulation';
import SplintingSimulation from '../../simulations/level5/SplintingSimulation';
import { ShieldAlert } from 'lucide-react';

export const SimulationPage = () => {
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
        setError(err.message || 'Error initializing simulation.');
      } finally {
        setLoading(false);
      }
    };

    fetchLevel();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono text-sm">
        <div className="w-12 h-12 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span>Initializing Real-Time Simulation Engine...</span>
      </div>
    );
  }

  if (error || !level) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md p-6 rounded-2xl bg-rose-950/60 border border-rose-800 text-center text-rose-200">
          <ShieldAlert className="w-10 h-10 mx-auto text-rose-400 mb-2" />
          <h2 className="text-lg font-bold">Simulation Locked</h2>
          <p className="text-xs text-rose-300 mt-1 mb-4">{error}</p>
          <button
            onClick={() => navigate('/levels')}
            className="px-4 py-2 bg-rose-600 rounded-lg text-xs font-semibold text-white"
          >
            Return to Levels
          </button>
        </div>
      </div>
    );
  }

  // Select matching simulation component based on levelNumber
  let Component = CprAedSimulation;
  if (level.levelNumber === 2) Component = HemorrhageSimulation;
  if (level.levelNumber === 3) Component = ThermalBurnSimulation;
  if (level.levelNumber === 4) Component = ChokingSimulation;
  if (level.levelNumber === 5) Component = SplintingSimulation;

  return (
    <SimulationEngine
      level={level}
      SimulationComponent={Component}
      isDemo={false}
    />
  );
};

export default SimulationPage;
