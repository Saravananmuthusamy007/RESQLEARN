import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Award, CheckCircle2, Lock, Printer, Calendar, Hash, ArrowRight, X, ShieldCheck, Sparkles, Download } from 'lucide-react';

const AVATAR_MAP = {
  'avatar-1': '👨‍⚕️',
  'avatar-2': '👩‍⚕️',
  'avatar-3': '🚑',
  'avatar-4': '🦸‍♂️',
  'avatar-5': '🦸‍♀️',
  'avatar-6': '🩺'
};

const CertificateGallery = () => {
  const { user } = useContext(AuthContext);
  const [levels, setLevels] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    fetchCertificatesAndLevels();
  }, []);

  const fetchCertificatesAndLevels = async () => {
    try {
      setLoading(true);
      setError(null);

      const [levelsRes, certsRes] = await Promise.all([
        api.get('/levels'),
        api.get(`/certificates/user/${user?.id || 'me'}`)
      ]);

      setLevels(levelsRes.data);
      setCertificates(certsRes.data?.certificates || []);
    } catch (err) {
      console.error('Error fetching certificate gallery:', err);
      setError(err.response?.data?.message || 'Unable to load certificates at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[45vh] space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
        <p className="text-gray-500 text-sm font-medium">Retrieving verified credential records...</p>
      </div>
    );
  }

  const masterCert = certificates.find(c => c.levelId === 'master');
  const levelCertsMap = {};
  certificates.forEach(c => {
    if (c.levelId !== 'master') {
      levelCertsMap[c.levelId] = c;
      if (c.order) levelCertsMap[String(c.order)] = c;
    }
  });

  const earnedLevelCount = Object.keys(levelCertsMap).length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full border border-amber-400/30 inline-flex items-center">
              <Award className="w-3.5 h-3.5 mr-1 text-yellow-400" /> Verifiable First-Aid Credentials
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Learner Certificate Gallery
            </h2>
            <p className="text-amber-100/90 text-sm max-w-xl">
              Each individual level completed earns an official, cryptographically verifiable certificate of competence, culminating in the comprehensive Master Credential.
            </p>
          </div>

          <div className="bg-amber-950/70 p-4 rounded-2xl border border-amber-700/50 text-center min-w-[170px]">
            <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold block">
              Level Credentials Earned
            </span>
            <span className="text-3xl font-black text-amber-400">
              {earnedLevelCount} / {levels.length || 5}
            </span>
            <span className="text-[11px] text-amber-200/80 block mt-0.5">
              {masterCert ? '🌟 Master Certified' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Individual Level Certificates (1 to 5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" /> Individual Level Certificates (Levels 1–5)
          </h3>
          <span className="text-xs text-gray-500 font-medium">Click any earned certificate to view & print</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => {
            const cert = levelCertsMap[String(level.order)] || levelCertsMap[level._id];
            const isEarned = Boolean(cert);

            return (
              <div
                key={level._id}
                className={`bg-white rounded-2xl border transition duration-200 p-6 flex flex-col justify-between shadow-md relative overflow-hidden ${
                  isEarned
                    ? 'border-amber-300 ring-2 ring-amber-500/10 hover:shadow-xl hover:border-amber-400'
                    : 'border-gray-200 opacity-80'
                }`}
              >
                {/* Top Corner Ribbon / Badge */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Level {level.order}
                  </span>
                  {isEarned ? (
                    <span className="inline-flex items-center text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Earned & Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                      <Lock className="w-3.5 h-3.5 mr-1" /> Not Earned Yet
                    </span>
                  )}
                </div>

                {/* Level Title & Description */}
                <div className="space-y-2 mb-4">
                  <h4 className="font-extrabold text-gray-900 text-base leading-snug">
                    {level.title}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {level.description || 'Master clinical first-aid response and procedure protocols.'}
                  </p>
                </div>

                {/* Credential Details (if earned) */}
                {isEarned ? (
                  <div className="pt-3 border-t border-amber-100 space-y-2 mb-4 text-xs">
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /> Issued On:</span>
                      <span className="font-bold text-gray-800">
                        {new Date(cert.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5 text-gray-400" /> Verification ID:</span>
                      <span className="font-mono font-bold text-amber-700 text-[10px] truncate max-w-[130px]" title={cert.verificationCode}>
                        {cert.verificationCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Practical / MCQ Scores:</span>
                      <span className="font-bold text-gray-800">
                        {cert.practicalScore}% / {cert.mcqScore}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-gray-100 space-y-2 mb-4 text-xs text-gray-500 italic">
                    Complete practical simulation (≥80%) and adaptive MCQ (≥70%) to issue this credential.
                  </div>
                )}

                {/* Action Buttons */}
                <div>
                  {isEarned ? (
                    <button
                      onClick={() => setSelectedCertificate({ ...cert, levelTitle: level.title, order: level.order })}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-4 h-4" /> View & Print Certificate
                    </button>
                  ) : (
                    <Link
                      to={`/levels/${level._id}`}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      Start Training <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Printable Modal for Individual Level Certificate */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-500/40 relative my-8 print:border-none print:shadow-none print:p-0">
            {/* Modal Header & Close (hidden on print) */}
            <div className="print:hidden flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <span className="text-xs font-bold uppercase text-amber-700 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Official Certified Credential
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print / PDF
                </button>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Certificate Frame */}
            <div className="bg-amber-50/50 p-6 sm:p-10 rounded-2xl border-4 border-amber-600/30 text-center space-y-6 relative overflow-hidden print:p-8 print:border-2">
              <div className="inline-flex flex-col items-center justify-center">
                <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full border-2 border-amber-500 text-amber-800 shadow-md">
                  <Award className="w-12 h-12 text-amber-700" />
                </div>
                <span className="mt-1 text-[9px] font-black uppercase tracking-widest bg-amber-600 text-white px-3 py-0.5 rounded-full shadow-sm">
                  Level {selectedCertificate.order} Certification
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-800 block">
                  Certificate of Competence & Emergency Response
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-wide">
                  {selectedCertificate.levelTitle}
                </h2>
                <p className="text-[10px] font-mono text-gray-500">
                  ADAPTIVE FIRST-AID LEARNING & PROFICIENCY COUNCIL
                </p>
              </div>

              <div className="py-4 border-t border-b border-amber-200 space-y-2">
                <p className="text-xs font-medium text-gray-600">This certifies that</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">{AVATAR_MAP[user?.avatar] || '👨‍⚕️'}</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-serif underline decoration-amber-500 decoration-2 underline-offset-4">
                    {selectedCertificate.userName || user?.name}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 max-w-lg mx-auto pt-1">
                  has demonstrated verified competency in clinical practical simulation (Score: <strong>{selectedCertificate.practicalScore}%</strong>) and adaptive theoretical evaluation (Score: <strong>{selectedCertificate.mcqScore}%</strong>).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div className="text-left bg-white/80 p-3 rounded-xl border border-amber-200/80">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Verification ID</span>
                  <span className="font-mono font-bold text-gray-800 text-[11px] break-all">
                    {selectedCertificate.verificationCode}
                  </span>
                </div>
                <div className="text-right bg-white/80 p-3 rounded-xl border border-amber-200/80">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Completion Date</span>
                  <span className="font-bold text-gray-800">
                    {new Date(selectedCertificate.completedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Signature footer */}
              <div className="pt-4 flex justify-between items-end text-[11px] text-gray-500 border-t border-amber-200/60">
                <div className="text-center">
                  <div className="font-serif italic font-bold text-blue-950 text-sm">Adaptive Med Council</div>
                  <div className="border-t border-gray-400 mt-1 pt-0.5">Director of Emergency Clinical Training</div>
                </div>
                <div className="text-center">
                  <div className="font-serif italic font-bold text-blue-950 text-sm">ResqLearn Board</div>
                  <div className="border-t border-gray-400 mt-1 pt-0.5">Authorized Certification Registrar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateGallery;
