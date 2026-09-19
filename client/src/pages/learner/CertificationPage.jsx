import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Copy,
  ExternalLink,
  Lock,
  Activity,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const CertificationPage = () => {
  const [certData, setCertData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await api.get('/certificate');
        setCertData(res);
      } catch (err) {
        console.error('Failed to load certificate:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, []);

  const handleCopyHash = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400 font-mono text-sm">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span>Verifying Cryptographic Registry...</span>
      </div>
    );
  }

  // If learner has not completed all 5 levels yet
  if (!certData?.isEligible || !certData?.certificate) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white">Certification Pending</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              {certData?.message || 'You must complete all 5 emergency training levels to qualify for the BLS competency certificate.'}
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-sm mx-auto font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span>Completed Modules:</span>
              <span className="text-cyan-400 font-bold">{certData?.completedCount || 0} / 5</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-amber-500"
                style={{ width: `${((certData?.completedCount || 0) / 5) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <Link
              to="/levels"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              <span>Continue Emergency Training</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cert = certData.certificate;
  const formattedDate = new Date(cert.completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Emergency Competency Certificate</h1>
          <p className="text-xs text-slate-400 mt-0.5">Tamper-evident credential backed by SHA-256 cryptographic hashing.</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Certificate</span>
          </button>

          <Link
            to={`/verify/${cert.certificateId}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-cyan-900/30 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Verify URL</span>
          </Link>
        </div>
      </div>

      {/* Printable Certificate Frame */}
      <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-4 border-amber-500/30 shadow-2xl text-center overflow-hidden">
        {/* Decorative corner borders */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500/60" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500/60" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-500/60" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-500/60" />

        {/* Certificate Emblem */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20 mb-6">
          <Award className="w-10 h-10 text-slate-950" />
        </div>

        {/* Certificate Header */}
        <div className="space-y-1 mb-6">
          <div className="text-xs uppercase font-mono font-extrabold tracking-widest text-amber-400">
            ResqLearn Emergency Medical Training Authority
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-wide">
            Certificate of Clinical Competency
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            First-Aid & Basic Life Support (BLS) Simulation Protocol
          </p>
        </div>

        {/* Learner Name */}
        <div className="my-6">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">This certifies that</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-200 my-2">
            {cert.learnerName}
          </div>
          <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
            has demonstrated clinical proficiency across all 5 emergency emergency simulations, achieving verified practical telemetry scores and adaptive theoretical assessment mastery.
          </p>
        </div>

        {/* 5 Completed Modules Badges */}
        <div className="my-6 py-4 border-y border-slate-800/80 max-w-2xl mx-auto">
          <div className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-3">
            VERIFIED EMERGENCY COMPETENCY MODULES
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
              ✓ 1. CPR / AED
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
              ✓ 2. Hemorrhage
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
              ✓ 3. Burn Cool
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
              ✓ 4. Choking
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
              ✓ 5. Splinting
            </div>
          </div>
        </div>

        {/* Footer Data (Date, Score, ID) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-xs font-mono mb-8">
          <div>
            <div className="text-slate-500 text-[10px]">ISSUED DATE</div>
            <div className="text-slate-200 font-bold mt-0.5">{formattedDate}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">OVERALL SCORE</div>
            <div className="text-amber-400 font-bold mt-0.5 text-base">{cert.overallScore}%</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">CERTIFICATE ID</div>
            <div className="text-cyan-400 font-bold mt-0.5">{cert.certificateId}</div>
          </div>
        </div>

        {/* Tamper-Evident SHA-256 Box */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 max-w-2xl mx-auto text-left space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>SHA-256 CRYPTOGRAPHIC TAMPER-EVIDENT HASH</span>
            </span>
            <button
              onClick={() => handleCopyHash(cert.sha256Hash)}
              className="text-[10px] text-cyan-400 hover:underline flex items-center space-x-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied!' : 'Copy Hash'}</span>
            </button>
          </div>
          <div className="font-mono text-[10px] text-slate-400 break-all bg-slate-900/60 p-2 rounded border border-slate-800/80 select-all">
            {cert.sha256Hash}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationPage;
