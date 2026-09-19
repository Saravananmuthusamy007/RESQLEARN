import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ShieldCheck, XCircle, Award, CheckCircle2, Activity, ArrowLeft } from 'lucide-react';

export const PublicVerifyPage = () => {
  const { certificateId } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyCert = async () => {
      try {
        const res = await api.get(`/certificate/verify/${certificateId}`);
        setVerification(res);
      } catch (err) {
        setVerification({
          isValid: false,
          message: err.message || 'Certificate verification failed.',
        });
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      verifyCert();
    }
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono text-sm">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span>Executing Cryptographic SHA-256 Verification...</span>
      </div>
    );
  }

  const cert = verification?.certificate;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-xl w-full">
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 mx-auto flex items-center justify-center shadow-lg shadow-rose-900/30 mb-2">
            <Activity className="w-6 h-6 text-white animate-heartbeat" />
          </div>
          <h1 className="text-2xl font-black text-white font-mono">
            Resq<span className="text-cyan-400">Learn</span> Verification Registry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Authenticity & Cryptographic Ledger Inspection</p>
        </div>

        {/* Verification Outcome Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${
              verification?.isValid
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {verification?.isValid ? (
                <ShieldCheck className="w-9 h-9" />
              ) : (
                <XCircle className="w-9 h-9" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-white">
              {verification?.isValid ? 'Certificate Authenticity Verified' : 'Certificate Verification Failed'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Certificate ID: <strong className="text-cyan-400 font-mono">{certificateId}</strong>
            </p>
          </div>

          {verification?.isValid && cert ? (
            <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Accredited Learner:</span>
                <span className="text-white font-bold text-sm">{cert.learnerName}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Competency Title:</span>
                <span className="text-slate-200 text-right">{cert.title}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Overall Practical/Theory Score:</span>
                <span className="text-emerald-400 font-bold">{cert.overallScore}%</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Issue Timestamp:</span>
                <span className="text-slate-300">{new Date(cert.completionDate).toLocaleString()}</span>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-slate-500 text-[10px]">VERIFIED SHA-256 CHECKSUM:</span>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-emerald-400 break-all select-all">
                  {cert.sha256Hash}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {verification?.message || 'No certificate record found matching this identifier or the cryptographic signature was invalidated.'}
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:underline font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to ResqLearn Platform</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicVerifyPage;
