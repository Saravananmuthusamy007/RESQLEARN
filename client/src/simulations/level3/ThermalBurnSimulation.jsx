import React, { useState, useEffect } from 'react';
import { Flame, Droplets, Watch, ShieldAlert, Sparkles, Shield } from 'lucide-react';

export const ThermalBurnSimulation = ({ step, onAction, onStepComplete }) => {
  // Step 1: Stop Burning
  const [sourceRemoved, setSourceRemoved] = useState(false);

  // Step 2: Cooling Water (Target 15-20°C, Duration 10-20 min)
  const [waterTemp, setWaterTemp] = useState(18);
  const [isIrrigating, setIsIrrigating] = useState(false);
  const [simulatedMinutes, setSimulatedMinutes] = useState(0);

  // Step 3: Remove Constrictive Items
  const [removedItems, setRemovedItems] = useState([]);

  // Step 4: Remedy Selection (Ice, Butter, Non-Adherent Dressing)
  const [selectedRemedy, setSelectedRemedy] = useState(null);

  // Step 5: Dressing
  const [dressingApplied, setDressingApplied] = useState(false);

  // Step 6: Normothermia
  const [blanketCovered, setBlanketCovered] = useState(false);

  // Water cooling loop (simulates minutes elapsed)
  useEffect(() => {
    let interval;
    if (isIrrigating) {
      interval = setInterval(() => {
        setSimulatedMinutes(prev => {
          const next = prev + 3;
          if (next >= 15) {
            const isTempGood = waterTemp >= 15 && waterTemp <= 20;
            onAction({
              eventType: 'burn_water_cooling',
              target: 'burn_wound',
              action: 'continuous_irrigation',
              accuracy: isTempGood ? 100 : 70,
              techniqueData: { tempCelsius: waterTemp, durationMinutes: next },
              feedback: isTempGood
                ? { type: 'success', message: `Cooled at ${waterTemp}°C for 15 minutes. Heat dissipation complete.` }
                : { type: 'warning', message: `Water temperature (${waterTemp}°C) out of optimal 15–20°C range.` }
            });
            setTimeout(() => onStepComplete(), 600);
          }
          return next;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isIrrigating, waterTemp]);

  // STEP 1 HANDLER
  const handleStopBurning = () => {
    setSourceRemoved(true);
    onAction({
      eventType: 'stop_burning_process',
      target: 'thermal_source',
      action: 'extinguish_and_remove',
      accuracy: 100,
      feedback: { type: 'success', message: 'Heat source removed. Burning process halted.' }
    });
    setTimeout(() => onStepComplete(), 600);
  };

  // STEP 2: Water temp change
  const handleTempChange = (e) => {
    const val = Number(e.target.value);
    setWaterTemp(val);
    if (val < 10) {
      onAction({
        eventType: 'water_temperature_selection',
        target: 'water_stream',
        action: 'ice_cold',
        accuracy: 30,
        isCriticalError: true,
        errorMessage: 'Water too cold (<10°C). Risk of tissue ischemia and frostbite.',
        feedback: { type: 'error', message: 'CRITICAL WARNING: Water is too cold! Avoid ice cold temperatures.' }
      });
    }
  };

  // STEP 3: Remove constrictions
  const handleRemoveItem = (itemKey, label) => {
    if (removedItems.includes(itemKey)) return;
    const next = [...removedItems, itemKey];
    setRemovedItems(next);

    onAction({
      eventType: 'constrictive_item_removal',
      target: itemKey,
      action: 'remove_before_edema',
      accuracy: 100,
      feedback: { type: 'success', message: `Removed ${label} before tissue swelling begins.` }
    });

    if (next.length >= 3) {
      setTimeout(() => onStepComplete(), 600);
    }
  };

  // STEP 4: Home remedy contraindication traps
  const handleSelectRemedy = (remedyKey) => {
    setSelectedRemedy(remedyKey);
    if (remedyKey === 'ice') {
      onAction({
        eventType: 'remedy_selection',
        target: 'ice_application',
        action: 'contraindicated_ice',
        accuracy: 10,
        isCriticalError: true,
        errorMessage: 'CRITICAL: Applied ice to burn wound. Causes profound vasoconstriction and tissue necrosis.',
        feedback: { type: 'error', message: 'CRITICAL ERROR: NEVER apply ice to burns! Deepens burn injury.' }
      });
    } else if (remedyKey === 'butter') {
      onAction({
        eventType: 'remedy_selection',
        target: 'butter_oil',
        action: 'contraindicated_ointment',
        accuracy: 10,
        isCriticalError: true,
        errorMessage: 'CRITICAL: Applied butter / oil to burn. Traps heat and causes severe wound infection.',
        feedback: { type: 'error', message: 'CRITICAL ERROR: NEVER apply butter, oils, or grease!' }
      });
    } else if (remedyKey === 'sterile_wrap') {
      onAction({
        eventType: 'remedy_selection',
        target: 'sterile_non_adherent',
        action: 'evidence_based_care',
        accuracy: 100,
        feedback: { type: 'success', message: 'Correct choice: Sterile, non-adherent coverage only.' }
      });
      setTimeout(() => onStepComplete(), 600);
    }
  };

  // STEP 5: Apply loose non-adherent dressing
  const handleApplyDressing = () => {
    setDressingApplied(true);
    onAction({
      eventType: 'burn_dressing',
      target: 'burn_wound',
      action: 'loose_non_adherent_wrap',
      accuracy: 100,
      feedback: { type: 'success', message: 'Clean plastic wrap loosely draped over burn. Nerve endings protected.' }
    });
    setTimeout(() => onStepComplete(), 600);
  };

  // STEP 6: Maintain Normothermia
  const handleCoverBlanket = () => {
    setBlanketCovered(true);
    onAction({
      eventType: 'normothermia_protection',
      target: 'unburned_torso',
      action: 'warm_blanket',
      accuracy: 100,
      feedback: { type: 'success', message: 'Patient kept warm with blanket to prevent lethal hypothermia.' }
    });
    setTimeout(() => onStepComplete(), 600);
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
      {/* STEP 1: Stop Burning */}
      {step === 1 && (
        <div className="w-full text-center space-y-6">
          <div className="text-sm text-cyan-400 font-mono">SCENE SAFETY & HALTING THERMAL PROCESS</div>
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex flex-col items-center space-y-4">
            <Flame className="w-12 h-12 text-amber-500 animate-pulse" />
            <div className="text-xs text-slate-300">
              Hot liquid spilled on forearm. Scalding fluid and clothing continue to transfer thermal energy to the skin.
            </div>
            <button
              onClick={handleStopBurning}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              {sourceRemoved ? 'Burning Halted ✓' : 'Remove Smoldering Fabric & Extinguish Heat'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Water Cooling (15-20°C, 10-20 min) */}
      {step === 2 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">COOL WATER IRRIGATION (TARGET: 15–20°C)</div>
          <p className="text-xs text-slate-300">
            Adjust water to cool tap temperature (<strong>15–20°C</strong>). Do NOT use freezing ice water. Then irrigate.
          </p>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-400">Water Temp:</span>
                <span className={`font-bold ${waterTemp >= 15 && waterTemp <= 20 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {waterTemp}°C {waterTemp >= 15 && waterTemp <= 20 ? '(Optimal Cool)' : waterTemp < 10 ? '(TOO COLD!)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                value={waterTemp}
                onChange={handleTempChange}
                className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span className="text-rose-400">5°C (Ice Trap)</span>
                <span className="text-emerald-400 font-bold">15–20°C Ideal</span>
                <span>35°C (Warm)</span>
              </div>
            </div>

            <button
              onClick={() => setIsIrrigating(prev => !prev)}
              className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                isIrrigating
                  ? 'bg-cyan-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg'
              }`}
            >
              <Droplets className="w-5 h-5" />
              <span>
                {isIrrigating
                  ? `IRRIGATING (${simulatedMinutes} / 15 MIN)...`
                  : 'START 10–20 MINUTE WATER COOLING STREAM'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Remove Constrictions */}
      {step === 3 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">REMOVE JEWELRY & WATCHES BEFORE EDEMA</div>
          <p className="text-xs text-slate-300">
            Post-burn tissue swelling will cause metal items to act as tight tourniquets. Click each item to slide it off:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
            <button
              onClick={() => handleRemoveItem('gold_ring', 'Wedding Ring')}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${
                removedItems.includes('gold_ring')
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              {removedItems.includes('gold_ring') ? '✓ Ring Removed' : 'Remove Ring'}
            </button>

            <button
              onClick={() => handleRemoveItem('wrist_watch', 'Wristwatch')}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${
                removedItems.includes('wrist_watch')
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              {removedItems.includes('wrist_watch') ? '✓ Watch Removed' : 'Remove Watch'}
            </button>

            <button
              onClick={() => handleRemoveItem('tight_bracelet', 'Bracelet')}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${
                removedItems.includes('tight_bracelet')
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              {removedItems.includes('tight_bracelet') ? '✓ Bracelet Removed' : 'Remove Bracelet'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Remedy Selection (Error Traps) */}
      {step === 4 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">AVOID HARMFUL REMEDIES (EVIDENCE-BASED CARE)</div>
          <p className="text-xs text-slate-300">
            Select the single medically recognized procedure for post-cooling wound coverage:
          </p>

          <div className="max-w-md mx-auto space-y-3">
            <button
              onClick={() => handleSelectRemedy('sterile_wrap')}
              className={`w-full p-4 rounded-xl border text-sm font-bold transition-all ${
                selectedRemedy === 'sterile_wrap'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              Clean Plastic Wrap or Dry Sterile Non-Adherent Sheet
            </button>

            <button
              onClick={() => handleSelectRemedy('ice')}
              className={`w-full p-4 rounded-xl border text-sm font-medium transition-all ${
                selectedRemedy === 'ice'
                  ? 'bg-rose-950 border-rose-500 text-rose-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
              }`}
            >
              Direct Ice Pack Application (Dangerous Trap)
            </button>

            <button
              onClick={() => handleSelectRemedy('butter')}
              className={`w-full p-4 rounded-xl border text-sm font-medium transition-all ${
                selectedRemedy === 'butter'
                  ? 'bg-rose-950 border-rose-500 text-rose-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
              }`}
            >
              Butter, Oil, or Toothpaste (Dangerous Trap)
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Loose Non-adherent Dressing */}
      {step === 5 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">APPLY LOOSE STERILE DRESSING</div>
          <p className="text-xs text-slate-300">
            Drape the clean non-adherent dressing loosely over the burn without tension to allow edema and shield nerve endings.
          </p>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex flex-col items-center space-y-4">
            <Sparkles className="w-12 h-12 text-cyan-400" />
            <button
              onClick={handleApplyDressing}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              {dressingApplied ? 'Dressing Draped Loosely ✓' : 'Drape Loose Non-Adherent Sheet'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Normothermia & Blanket */}
      {step === 6 && (
        <div className="w-full text-center space-y-5">
          <div className="text-sm text-cyan-400 font-mono">PREVENT SYSTEMIC HYPOTHERMIA</div>
          <p className="text-xs text-slate-300">
            Burn victims rapidly lose core thermal regulation. Cover uninjured body parts with a warm blanket during EMS transport.
          </p>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex flex-col items-center space-y-4">
            <div className="text-xs text-slate-400 font-mono">Body Heat Status:</div>
            <button
              onClick={handleCoverBlanket}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              {blanketCovered ? 'Warm Blanket Placed ✓' : 'Cover Patient with Warm Blanket'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThermalBurnSimulation;
