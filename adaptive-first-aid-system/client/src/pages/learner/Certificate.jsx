import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Award, Printer, ArrowLeft, CheckCircle2, ShieldCheck, Calendar, Hash } from 'lucide-react';

const Certificate = () => {
  const { levelId } = useParams();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificate();
  }, [levelId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/certificate/${levelId}`);
      setCertData(res.data);
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setError(err.response?.data?.message || 'Certificate not available.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        <p className="text-gray-600 text-sm">Generating official verifiable certificate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
          <Award className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Certificate Unavailable</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            to="/levels"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Return to Training Levels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Action Bar (hidden during print) */}
      <div className="print:hidden mb-6 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition transform hover:-translate-y-0.5"
        >
          <Printer className="w-4 h-4 mr-2" /> Print / Download PDF Certificate
        </button>
      </div>

      {/* Printable Certificate Box */}
      <div className="bg-amber-50/40 p-6 sm:p-10 rounded-3xl border-8 border-amber-600/30 shadow-2xl relative overflow-hidden print:p-8 print:border-4 print:shadow-none">
        {/* Corner Ornaments */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-amber-600"></div>
        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-amber-600"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-amber-600"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-amber-600"></div>

        {/* Inner Content Container */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-amber-200 text-center space-y-6 relative z-10">
          {/* Official Emblem */}
          <div className="inline-flex p-4 bg-amber-100/70 rounded-full border-2 border-amber-400 text-amber-800 mb-2 shadow-inner">
            <Award className="w-16 h-16 text-amber-700" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-800">
              Official Verifiable Credential
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 tracking-wide">
              Certificate of Completion
            </h1>
            <p className="text-xs text-gray-500 font-mono">
              ADAPTIVE FIRST-AID LEARNING & ASSESSMENT SYSTEM
            </p>
          </div>

          <div className="py-4 border-t border-b border-amber-200/80 space-y-3">
            <p className="text-sm font-medium text-gray-600">This is to certify that</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 font-serif underline decoration-amber-400 decoration-2 underline-offset-4">
              {certData.learnerName}
            </h2>
            <p className="text-sm font-medium text-gray-600">
              has successfully demonstrated proficiency and passed both practical simulation & adaptive MCQ assessments for
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-900 bg-emerald-50/80 py-2 px-4 rounded-xl inline-block border border-emerald-200">
              Level {certData.order}: {certData.levelTitle}
            </h3>
          </div>

          {/* Scores & Completion Metrics */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto py-2">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
              <span className="text-[11px] font-bold text-gray-500 uppercase block">Practical Simulation</span>
              <span className="text-xl font-black text-emerald-700">{certData.practicalScore}%</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
              <span className="text-[11px] font-bold text-gray-500 uppercase block">Adaptive MCQ Score</span>
              <span className="text-xl font-black text-purple-700">{certData.mcqScore}%</span>
            </div>
          </div>

          {/* Footer Metadata & Signature Seals */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end border-t border-gray-200 text-left">
            <div className="space-y-1">
              <div className="flex items-center text-xs text-gray-600">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                <span>Issued On: <strong>{new Date(certData.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
              </div>
              <div className="flex items-center text-xs text-gray-600 font-mono">
                <Hash className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                <span>Verification ID: <strong className="text-gray-900">{certData.verificationCode}</strong></span>
              </div>
              <div className="flex items-center text-xs text-emerald-700 font-semibold mt-2">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> Digitally Verified & Authenticated
              </div>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="font-serif italic font-extrabold text-gray-800 text-lg border-b border-gray-400 pb-1 inline-block px-4">
                Adaptive First-Aid Board
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase block">
                {certData.issuer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
