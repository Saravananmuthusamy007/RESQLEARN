import React, { useState } from 'react';
import MasterCertificateModule from '../../components/certificate/MasterCertificateModule';
import CertificateGallery from '../../components/certificate/CertificateGallery';
import { Award, Layers } from 'lucide-react';

const Certificate = () => {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'master'

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Tab Navigation Pill Bar */}
      <div className="print:hidden flex items-center justify-center">
        <div className="bg-white border border-gray-200 p-1.5 rounded-2xl shadow-sm inline-flex space-x-2">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
              activeTab === 'gallery'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md'
                : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50/50'
            }`}
          >
            <Layers className="w-4 h-4" /> Level Certificates Gallery (1–5)
          </button>
          <button
            onClick={() => setActiveTab('master')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
              activeTab === 'master'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md'
                : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50/50'
            }`}
          >
            <Award className="w-4 h-4" /> Single Master Certificate
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'gallery' ? (
        <CertificateGallery />
      ) : (
        <MasterCertificateModule />
      )}
    </div>
  );
};

export default Certificate;
