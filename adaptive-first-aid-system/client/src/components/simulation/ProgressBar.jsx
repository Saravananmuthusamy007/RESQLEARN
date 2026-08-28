// ProgressBar.jsx - Animated visual progress bar component

import React from 'react';

const ProgressBar = ({ progress = 0, color = 'bg-cyan-500' }) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
      <div
        className={`h-full ${color} rounded-full transition-all duration-300 ease-out shadow-sm`}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
