import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Play, Lock, CheckCircle2, Award, ListChecks } from 'lucide-react';

const LevelContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLevelDetail();
  }, [id]);

  const fetchLevelDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/levels/${id}`);
      setLevel(res.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('This level is locked. Complete the previous level to access content.');
      } else {
        setError(err.response?.data?.message || 'Failed to load level detail');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-xl">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            to="/levels"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Level List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Navigation & Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/levels"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Levels
        </Link>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
          Level {level.order}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <h1 className="text-3xl font-extrabold mb-3">{level.title}</h1>
          <p className="text-blue-100 text-lg">{level.description}</p>

          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-blue-500/40 text-sm">
            <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <Award className="w-4 h-4 mr-2 text-yellow-300" />
              <span>Practical Passing Score: <strong>{level.practicalThreshold}%</strong></span>
            </div>
            <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <Award className="w-4 h-4 mr-2 text-purple-300" />
              <span>MCQ Passing Score: <strong>{level.mcqThreshold}%</strong></span>
            </div>
          </div>
        </div>

        {/* Video Tutorial Section */}
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Play className="w-5 h-5 text-blue-600 mr-2" /> Instructional Video Guide
          </h2>
          {level.videoUrl ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-inner bg-black">
              <iframe
                src={level.videoUrl}
                title={level.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="aspect-video w-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
              No video guide available for this level.
            </div>
          )}
        </div>

        {/* Step-by-Step Instructions */}
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <ListChecks className="w-5 h-5 text-blue-600 mr-2" /> Step-by-Step Action Protocol
          </h2>
          <div className="space-y-4">
            {level.instructions && level.instructions.length > 0 ? (
              level.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm mr-4">
                    {idx + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No instructions specified.</p>
            )}
          </div>
        </div>

        {/* Action Trigger */}
        <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900">Ready to test your skills?</h3>
            <p className="text-sm text-gray-600">Proceed to the interactive simulation assessment for Level {level.order}.</p>
          </div>
          <button
            onClick={() => navigate(`/practical/${level._id}`)}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" /> Start Practical Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelContent;
