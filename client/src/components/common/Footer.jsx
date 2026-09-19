import React from 'react';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-rose-500" />
          <span className="font-semibold text-slate-400 font-mono">ResqLearn Simulation & Certification Platform</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SHA-256 Tamper-Evident Verification</span>
          </span>
          <span>•</span>
          <span>Educational Simulation Protocol</span>
        </div>

        <div className="text-[11px] text-slate-600">
          Emergency Training Standard v1.0
        </div>
      </div>
    </footer>
  );
};

export default Footer;
