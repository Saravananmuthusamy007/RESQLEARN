import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Flame, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import AnatomyHandBurn from '../../simulations/AnatomyHandBurn';

const Level3BurnsMotion = ({ currentStep, onAction, isFinished }) => {
  const [hazardRemoved, setHazardRemoved] = useState(false);
  const [coolingWaterSlider, setCoolingWaterSlider] = useState(0); // 0 to 20 minutes
  const [isWaterRunning, setIsWaterRunning] = useState(false);
  const [dressingApplied, setDressingApplied] = useState(false);
  const [forbiddenMistake, setForbiddenMistake] = useState(null);

  const targetMinutes = 15;

  useEffect(() => {
    let interval = null;
    if (isWaterRunning && coolingWaterSlider < 20) {
      interval = setInterval(() => {
        setCoolingWaterSlider(prev => {
          const next = prev + 1;
          if (next >= targetMinutes && currentStep === 'COOL_BURN_AREA') {
            onAction({
              step: 'cool_running_water',
              target: 'running_water',
              action: 'COOL_BURN_AREA',
              targetAccuracy: 95,
              isCorrect: true,
              durationMinutes: next,
              timerAdherence: true,
              feedback: `Thermal cooling optimal: ${next} minutes under gentle running cool water.`
            });
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isWaterRunning, coolingWaterSlider, currentStep]);

  const handleHazardRemove = () => {
    setHazardRemoved(true);
    onAction({
      step: 'remove_hazard',
      target: 'heat_source',
      action: 'REMOVE_HAZARD',
      targetAccuracy: 100,
      isCorrect: true,
      feedback: 'Heat source removed safely: Thermal injury progression halted.'
    });
  };

  const handleSelectWaterCooling = () => {
    if (!hazardRemoved) {
      onAction({
        step: 'cool_running_water',
        target: 'running_water',
        action: 'SELECT_COOLING_METHOD',
        targetAccuracy: 50,
        isCorrect: false,
        feedback: 'Remove the heat source/hazard first before initiating cooling!'
      });
      return;
    }
    setIsWaterRunning(true);
    onAction({
      step: 'cool_running_water',
      target: 'running_water',
      action: 'SELECT_COOLING_METHOD',
      targetAccuracy: 95,
      isCorrect: true,
      feedback: 'Selected cool running water: Gold standard clinical first-aid for thermal burns.'
    });
  };

  const handleApplyIceOrButter = (item) => {
    setForbiddenMistake(`Critical Mistake: Applying ${item} damages tissue and causes hypothermia/infection!`);
    onAction({
      step: 'contraindicated_remedy',
      target: item,
      action: 'SELECT_COOLING_METHOD',
      targetAccuracy: 20,
      isCorrect: false,
      flag: 'contraindicated_home_remedy',
      feedback: `Contraindicated! Never apply ${item} to a burn. Use cool running water only.`
    });
    setTimeout(() => setForbiddenMistake(null), 4000);
  };

  const handleApplyDressing = () => {
    if (coolingWaterSlider < 10) {
      onAction({
        step: 'apply_sterile_dressing',
        target: 'burn_surface',
        action: 'APPLY_STERILE_DRESSING',
        targetAccuracy: 55,
        isCorrect: false,
        feedback: 'Cool burn area under running water for at least 10–20 minutes before dressing!'
      });
      return;
    }
    setIsWaterRunning(false);
    setDressingApplied(true);
    onAction({
      step: 'apply_sterile_dressing',
      target: 'burn_surface',
      action: 'APPLY_STERILE_DRESSING',
      targetAccuracy: 95,
      isCorrect: true,
      nonAdherent: true,
      feedback: 'Non-adherent sterile dressing wrapped loosely over burn site without popping blisters.'
    });
    onAction({
      step: 'burn_care_complete',
      target: 'burn_surface',
      action: 'COMPLETE',
      targetAccuracy: 100,
      isCorrect: true,
      feedback: 'Burns management protocol completed successfully! Victim protected from shock.'
    });
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
      {/* Clinical 2D Anatomical Hand/Wrist Burn & Running Water Simulation */}
      <AnatomyHandBurn
        isWaterRunning={isWaterRunning}
        coolingMinutes={coolingWaterSlider}
        targetCoolingMinutes={20}
        dressingApplied={dressingApplied}
        onToggleWater={() => {
          if (isWaterRunning) {
            setIsWaterRunning(false);
          } else {
            handleSelectWaterCooling();
          }
        }}
        onApplyDressing={handleApplyDressing}
        onApplyIce={() => handleApplyIceOrButter('ice')}
        disabled={isFinished}
      />

      {/* Water Cooling Timer Slider (Target: 10 - 20 minutes) */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-cyan-400 animate-bounce" />
            Cooling Duration: <strong>{coolingWaterSlider} / 20 Mins (Target: 10–20m)</strong>
          </span>
          <span className={`font-mono text-[11px] font-bold ${coolingWaterSlider >= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {coolingWaterSlider >= 10 ? 'Cooled Adequately ✓' : 'Cooling in Progress'}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="20"
          value={coolingWaterSlider}
          onChange={(e) => {
            const val = Number(e.target.value);
            setCoolingWaterSlider(val);
            if (val >= 10) {
              setIsWaterRunning(true);
            }
          }}
          className="w-full accent-cyan-500 cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0 min</span>
          <span className="text-cyan-400 font-bold">10 min minimum</span>
          <span>20 min optimal</span>
        </div>
      </div>

      {/* Forbidden Action Alert Warning */}
      <AnimatePresence>
        {forbiddenMistake && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md p-3 bg-rose-950/80 border border-rose-700 rounded-xl text-rose-300 text-xs flex items-center gap-2 shadow-lg"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{forbiddenMistake}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Equipment Actions & Contraindicated Distractors */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <button
          onClick={handleHazardRemove}
          disabled={hazardRemoved}
          className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
            hazardRemoved
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 cursor-default'
              : 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span>{hazardRemoved ? '✓ 1. Heat Removed' : '1. Remove Hazard/Heat'}</span>
        </button>

        <button
          onClick={handleSelectWaterCooling}
          className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
            isWaterRunning
              ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-500'
          }`}
        >
          <Droplets className="w-5 h-5 text-cyan-400" />
          <span>2. Cool Running Water</span>
        </button>

        <button
          onClick={handleApplyDressing}
          disabled={dressingApplied}
          className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center gap-1.5 transition ${
            dressingApplied
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 cursor-default'
              : coolingWaterSlider >= 10
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>{dressingApplied ? '✓ 3. Wrapped' : '3. Non-Stick Sterile Dressing'}</span>
        </button>

        <button
          onClick={() => handleApplyIceOrButter('Ice / Ointment')}
          className="p-3 rounded-2xl border border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 font-semibold flex flex-col items-center justify-center gap-1.5 transition opacity-80"
        >
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <span className="text-[11px]">Apply Ice / Butter (Test Danger)</span>
        </button>
      </div>
    </div>
  );
};

export default Level3BurnsMotion;
