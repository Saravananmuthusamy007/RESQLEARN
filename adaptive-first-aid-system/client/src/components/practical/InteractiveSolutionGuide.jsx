import React, { useState } from 'react';
import { BookOpen, CheckCircle, HelpCircle, ArrowRight, Lightbulb, Star } from 'lucide-react';

export const LEVEL_SOLUTIONS = {
  1: {
    title: 'Level 1: CPR Procedure Solution Guide 🫀',
    subtitle: 'Learn step-by-step CPR for unresponsive victims',
    badgeColor: 'bg-red-500',
    steps: [
      { step: 1, action: 'OBSERVE_VICTIM', title: 'Check Victim Responsiveness', icon: '👀', text: 'Tap victim on shoulders and shout "Are you okay?". Look for breathing movements.' },
      { step: 2, action: 'CALL_EMERGENCY', title: 'Call 911 / Emergency Service', icon: '📞', text: 'Call 911 immediately or ask a bystander to call for help and get an AED.' },
      { step: 3, action: 'OPEN_AIRWAY', title: 'Open the Airway', icon: '🗣️', text: 'Gently tilt the victim head back with one hand while lifting chin with the other.' },
      { step: 4, action: 'CHECK_BREATHING', title: 'Check for Normal Breathing', icon: '🫁', text: 'Listen and feel for air movement for no more than 10 seconds.' },
      { step: 5, action: 'POSITION_HANDS', title: 'Position Hands on Chest', icon: '🤲', text: 'Place heel of one hand in center of chest, interlock second hand on top.' },
      { step: 6, action: 'PERFORM_COMPRESSIONS', title: 'Deliver 30 Chest Compressions', icon: '⚡', text: 'Push hard and fast (100-120 bpm) at least 2 inches deep.' },
      { step: 7, action: 'GIVE_RESCUE_BREATHS', title: 'Give 2 Rescue Breaths', icon: '💨', text: 'Pinch nose, seal mouth, and blow until chest rises twice.' }
    ]
  },
  2: {
    title: 'Level 2: Severe Bleeding Control Solution Guide 🩸',
    subtitle: 'Step-by-step first aid for controlling heavy bleeding',
    badgeColor: 'bg-rose-600',
    steps: [
      { step: 1, action: 'INSPECT_WOUND', title: 'Inspect Wound Location', icon: '🔍', text: 'Locate source of bleeding and clear clothing around the injury.' },
      { step: 2, action: 'APPLY_DIRECT_PRESSURE', title: 'Apply Direct Pressure', icon: '🩹', text: 'Place sterile gauze pads firmly over the wound with both hands.' },
      { step: 3, action: 'ELEVATE_LIMB', title: 'Elevate Wounded Limb', icon: '📐', text: 'Raise the injured arm or leg above heart level if no fracture.' },
      { step: 4, action: 'WRAP_BANDAGE', title: 'Wrap Pressure Bandage', icon: '🎗️', text: 'Wrap elastic roller bandage firmly around gauze to hold pressure.' },
      { step: 5, action: 'CHECK_CIRCULATION', title: 'Check Distal Circulation', icon: '🩺', text: 'Ensure fingers/toes are warm and pink (bandage not too tight).' }
    ]
  },
  3: {
    title: 'Level 3: Thermal Burn Treatment Solution Guide 🔥',
    subtitle: 'Cooling and dressing first & second-degree burns',
    badgeColor: 'bg-amber-600',
    steps: [
      { step: 1, action: 'ASSESS_BURN_DEPTH', title: 'Assess Burn Area & Severity', icon: '🧐', text: 'Check size and color of burn area. Ensure scene is safe from heat.' },
      { step: 2, action: 'COOL_WITH_WATER', title: 'Cool with Cool Water (10-20 min)', icon: '💧', text: 'Run gentle cool tap water over burn. Never use ice or butter!' },
      { step: 3, action: 'REMOVE_CONSTRICTING_ITEMS', title: 'Remove Rings & Watches', icon: '💍', text: 'Carefully take off rings, watches, or clothing before swelling starts.' },
      { step: 4, action: 'APPLY_STERILE_DRESSING', title: 'Cover with Non-Stick Dressing', icon: '🛡️', text: 'Cover loosely with clean sterile non-stick bandage or plastic wrap.' },
      { step: 5, action: 'MONITOR_SHOCK', title: 'Monitor Victim & Seek Help', icon: '🚑', text: 'Keep victim warm and comfortable. Seek medical attention if severe.' }
    ]
  },
  4: {
    title: 'Level 4: Choking First Aid (Heimlich) Solution Guide 😮',
    subtitle: 'Relieving severe airway choking in adults & kids',
    badgeColor: 'bg-teal-600',
    steps: [
      { step: 1, action: 'ASSESS_CHOKING', title: 'Ask "Are You Choking?"', icon: '❓', text: 'Look for clutching neck. Confirm victim cannot speak or cough.' },
      { step: 2, action: 'POSITION_BEHIND_VICTIM', title: 'Stand Behind Victim', icon: '🧍', text: 'Position yourself behind victim with one foot forward for balance.' },
      { step: 3, action: 'MAKE_FIST', title: 'Place Fist Above Navel', icon: '✊', text: 'Make a fist with thumb side against abdomen, slightly above belly button.' },
      { step: 4, action: 'DELIVER_ABDOMINAL_THRUSTS', title: 'Inward & Upward Thrusts', icon: '⬆️', text: 'Grasp fist with other hand and give quick upward thrusts until clear.' },
      { step: 5, action: 'REASSESS_VICTIM', title: 'Check Airway & Breathing', icon: '🌟', text: 'Confirm object is expelled and victim is breathing normally.' }
    ]
  },
  5: {
    title: 'Level 5: Limb Fracture & Sprain Support Solution Guide 🦴',
    subtitle: 'Splinting broken bones & joint support safely',
    badgeColor: 'bg-indigo-600',
    steps: [
      { step: 1, action: 'INSPECT_INJURY_SITE', title: 'Support & Inspect Fracture', icon: '🦾', text: 'Support injured limb in position found. Do NOT try to straighten bone.' },
      { step: 2, action: 'CHECK_CIRCULATION_PMS', title: 'Check Pulse & Sensation (PMS)', icon: '👉', text: 'Check pulse, finger movement, and feeling below the injury.' },
      { step: 3, action: 'APPLY_PADDED_SPLINT', title: 'Place Rigid Padded Splint', icon: '🪵', text: 'Position splint extending past joints above and below the break.' },
      { step: 4, action: 'SECURE_SPLINT_BANDAGES', title: 'Tie Splint Securely', icon: '🪢', text: 'Tie bandages above and below fracture site to immobilize bone.' },
      { step: 5, action: 'RECHECK_PMS', title: 'Recheck Circulation & Elevate', icon: '✨', text: 'Verify pulse is intact and rest limb comfortably.' }
    ]
  }
};

const InteractiveSolutionGuide = ({ levelId = 1, isOpen, onClose }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  if (!isOpen) return null;

  const solution = LEVEL_SOLUTIONS[Number(levelId)] || LEVEL_SOLUTIONS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 text-slate-100 w-full max-w-2xl rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-400">
              <Lightbulb className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                {solution.title}
              </h2>
              <p className="text-xs text-slate-400">{solution.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-xl px-2 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="bg-cyan-950/40 border border-cyan-800/50 p-4 rounded-xl flex items-center space-x-3 text-cyan-200 text-xs">
            <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <p>
              <strong>Kids Learning Hint:</strong> Follow this exact step sequence during your practical simulation! Click each step below to inspect details.
            </p>
          </div>

          {/* Interactive Step Timeline Bar */}
          <div className="flex items-center justify-between space-x-1 overflow-x-auto pb-2">
            {solution.steps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setActiveStepIndex(idx)}
                className={`flex-1 min-w-[60px] py-2 px-1 rounded-lg text-center font-bold text-xs transition border ${
                  activeStepIndex === idx
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg scale-105'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Step {s.step}
              </button>
            ))}
          </div>

          {/* Active Step Solution Card */}
          {solution.steps[activeStepIndex] && (
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 relative shadow-inner">
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-4xl p-3 bg-slate-900 rounded-xl border border-slate-700">
                  {solution.steps[activeStepIndex].icon}
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2.5 py-1 rounded-full">
                    Action Code: {solution.steps[activeStepIndex].action}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Step {solution.steps[activeStepIndex].step}: {solution.steps[activeStepIndex].title}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800 leading-relaxed">
                {solution.steps[activeStepIndex].text}
              </p>

              {/* Next/Prev Navigation */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-700/60">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-xl text-xs font-bold text-white transition"
                >
                  ◀ Previous Step
                </button>

                <span className="text-xs text-slate-400 font-medium">
                  {activeStepIndex + 1} of {solution.steps.length} Steps
                </span>

                <button
                  disabled={activeStepIndex === solution.steps.length - 1}
                  onClick={() => setActiveStepIndex((prev) => Math.min(solution.steps.length - 1, prev + 1))}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 rounded-xl text-xs font-bold text-white transition flex items-center"
                >
                  Next Step ▶
                </button>
              </div>
            </div>
          )}

          {/* Complete Sequence Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Full Answer Sequence Checklist
            </h4>
            <div className="space-y-2">
              {solution.steps.map((s) => (
                <div
                  key={s.step}
                  onClick={() => setActiveStepIndex(s.step - 1)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer text-xs ${
                    activeStepIndex === s.step - 1
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-cyan-400 w-6">#{s.step}</span>
                    <span className="text-base">{s.icon}</span>
                    <span className="font-medium">{s.title}</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition transform hover:scale-105"
          >
            Got it! Return to Simulation 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveSolutionGuide;
