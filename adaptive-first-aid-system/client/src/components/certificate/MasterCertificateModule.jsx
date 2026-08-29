import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Award, Printer, ArrowLeft, CheckCircle2, ShieldCheck, Calendar, Hash, Lock, ArrowRight, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

const AVATAR_MAP = {
  'avatar-1': '👨‍⚕️',
  'avatar-2': '👩‍⚕️',
  'avatar-3': '🚑',
  'avatar-4': '🦸‍♂️',
  'avatar-5': '🦸‍♀️',
  'avatar-6': '🩺'
};

const MasterCertificateModule = ({ embedded = false }) => {
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMasterCertificate();
  }, []);

  const fetchMasterCertificate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/certificate/master');
      setCertData(res.data);
    } catch (err) {
      console.error('Error fetching master certificate:', err);
      setError(err.response?.data?.message || 'Master Certificate data unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        <p className="text-gray-600 text-sm font-medium">Generating official Master First-Aid Credential...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-2xl shadow-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Certificate Status Unavailable</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            to="/levels"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Return to Training Levels
          </Link>
        </div>
      </div>
    );
  }

  // Handle Locked State (Incomplete levels)
  if (!certData?.isEligible) {
    const { completedLevelsCount = 0, totalLevelsCount = 5, levelStatuses = [] } = certData || {};
    const completionPercentage = Math.round((completedLevelsCount / (totalLevelsCount || 5)) * 100);

    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-widest bg-amber-500/30 text-amber-200 px-3 py-1 rounded-full border border-amber-400/40 inline-flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1" /> Master Credential In Progress
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Single Master Certificate Module
              </h1>
              <p className="text-amber-100 text-sm max-w-xl">
                Complete all 5 First-Aid training levels to earn your official, digitally verifiable Master Certificate of Emergency Medical Proficiency.
              </p>
            </div>
            
            <div className="bg-amber-950/80 p-5 rounded-2xl border border-amber-600/40 text-center min-w-[160px]">
              <span className="text-xs uppercase text-amber-300 font-bold block">Overall Completion</span>
              <span className="text-3xl font-black text-amber-400">{completedLevelsCount} / {totalLevelsCount}</span>
              <span className="text-[11px] text-amber-200 block mt-1">Levels Mastered</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-bold text-amber-200">
              <span>Master Certification Progress</span>
              <span>{completionPercentage}% Complete</span>
            </div>
            <div className="w-full bg-amber-950/60 h-3.5 rounded-full overflow-hidden border border-amber-700/50 p-0.5">
              <div
                className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Level Completion Checklist */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 text-amber-600 mr-2" />
              Required Training Levels (Complete All 5)
            </h2>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {totalLevelsCount - completedLevelsCount} Levels Remaining
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {levelStatuses.map((lvl) => (
              <div
                key={lvl.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                  lvl.isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-gray-50 border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                      lvl.isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {lvl.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : lvl.order}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      Level {lvl.order}: {lvl.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-0.5">
                      <span>Practical: <strong className={lvl.practicalPassed ? 'text-emerald-700' : 'text-amber-700'}>{lvl.practicalPassed ? 'Passed' : 'Pending'}</strong></span>
                      <span>•</span>
                      <span>MCQ: <strong className={lvl.mcqPassed ? 'text-emerald-700' : 'text-purple-700'}>{lvl.mcqPassed ? 'Passed' : 'Pending'}</strong></span>
                    </div>
                  </div>
                </div>

                <div>
                  {lvl.isCompleted ? (
                    <span className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-xl border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Level Complete
                    </span>
                  ) : (
                    <Link
                      to={`/levels/${lvl.id}`}
                      className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow transition"
                    >
                      Complete Level {lvl.order} <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Master Certificate View
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Print / Action Bar */}
      {!embedded && (
        <div className="print:hidden mb-6 flex items-center justify-between">
          <Link
            to="/profile"
            className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-amber-600 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Learner Profile
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
          >
            <Printer className="w-4 h-4 mr-2" /> Print / Download Master Certificate
          </button>
        </div>
      )}

      {/* Printable Master Certificate Box */}
      <div className="bg-amber-50/60 p-6 sm:p-10 rounded-3xl border-8 border-amber-600/40 shadow-2xl relative overflow-hidden print:p-8 print:border-4 print:shadow-none">
        {/* Corner Ornaments */}
        <div className="absolute top-4 left-4 w-14 h-14 border-t-4 border-l-4 border-amber-600"></div>
        <div className="absolute top-4 right-4 w-14 h-14 border-t-4 border-r-4 border-amber-600"></div>
        <div className="absolute bottom-4 left-4 w-14 h-14 border-b-4 border-l-4 border-amber-600"></div>
        <div className="absolute bottom-4 right-4 w-14 h-14 border-b-4 border-r-4 border-amber-600"></div>

        {/* Inner Certificate Content Container */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-amber-300/80 text-center space-y-6 relative z-10 shadow-sm">
          {/* Top Badge & Ribbon */}
          <div className="inline-flex flex-col items-center justify-center">
            <div className="p-4 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full border-4 border-amber-500 text-amber-800 shadow-md">
              <Award className="w-16 h-16 text-amber-700" />
            </div>
            <span className="mt-2 text-[10px] font-black uppercase tracking-widest bg-amber-600 text-white px-3 py-0.5 rounded-full shadow-sm">
              Master Credential
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-800 block">
              Official Verifiable First-Aid Credential
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-black text-gray-900 tracking-wide">
              Master Certificate of Completion
            </h1>
            <p className="text-xs font-mono text-gray-500">
              ADAPTIVE FIRST-AID LEARNING & EMERGENCY RESPONSE SYSTEM
            </p>
          </div>

          <div className="py-4 border-t-2 border-b-2 border-amber-200 space-y-3">
            <p className="text-sm font-medium text-gray-600">This is to certify that</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{AVATAR_MAP[certData.avatar] || '👨‍⚕️'}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 font-serif underline decoration-amber-500 decoration-2 underline-offset-4">
                {certData.learnerName}
              </h2>
            </div>
            <p className="text-sm font-medium text-gray-600 max-w-2xl mx-auto">
              has successfully completed all 5 comprehensive First-Aid training levels (CPR, Bleeding Control, Burn Treatment, Fracture Management, and Choking Emergency), demonstrating exceptional proficiency in practical simulations & adaptive assessments.
            </p>
          </div>

          {/* Master Scores & Completion Metrics */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto py-2">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Levels Passed</span>
              <span className="text-xl font-black text-blue-800">{certData.completedLevelsCount} / {certData.totalLevelsCount}</span>
            </div>
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Avg Practical</span>
              <span className="text-xl font-black text-emerald-700">{certData.practicalScore}%</span>
            </div>
            <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200 text-center">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">Avg MCQ Score</span>
              <span className="text-xl font-black text-purple-700">{certData.mcqScore}%</span>
            </div>
          </div>

          {/* Footer Metadata & Official Seal */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end border-t border-gray-200 text-left">
            <div className="space-y-1">
              <div className="flex items-center text-xs text-gray-600">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                <span>Issued On: <strong>{new Date(certData.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
              </div>
              <div className="flex items-center text-xs text-gray-600 font-mono">
                <Hash className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                <span>Master ID: <strong className="text-gray-900 font-bold">{certData.verificationCode}</strong></span>
              </div>
              <div className="flex items-center text-xs text-emerald-700 font-semibold mt-2">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> Digitally Authenticated & Verifiable
              </div>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="font-serif italic font-extrabold text-gray-900 text-lg border-b border-gray-400 pb-1 inline-block px-4">
                Adaptive First-Aid Board
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase block">
                {certData.issuer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterCertificateModule;
