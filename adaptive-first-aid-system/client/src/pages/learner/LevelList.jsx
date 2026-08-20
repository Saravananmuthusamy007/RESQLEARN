import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Lock, Unlock, PlayCircle, CheckCircle, Award } from 'lucide-react';

const LevelList = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/levels');
      setLevels(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load levels');
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Adaptive First-Aid Training Levels
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
          Complete practical simulations & adaptive assessments to unlock higher levels.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level) => {
          const isUnlocked = level.progress?.unlocked;
          const isCompleted = level.progress?.levelCompleted;

          return (
            <div
              key={level._id}
              onClick={() => isUnlocked && navigate(`/levels/${level._id}`)}
              className={`relative rounded-xl border p-6 flex flex-col justify-between transition-all duration-200 ${
                isUnlocked
                  ? 'bg-white border-blue-200 shadow-md hover:shadow-xl hover:border-blue-400 cursor-pointer transform hover:-translate-y-1'
                  : 'bg-gray-100 border-gray-300 opacity-85 cursor-not-allowed'
              }`}
            >
              {/* Top Badge Row */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  Level {level.order}
                </span>

                <div className="flex items-center space-x-2">
                  {isCompleted && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Passed
                    </span>
                  )}
                  {isUnlocked ? (
                    <span className="p-2 bg-green-100 text-green-600 rounded-full">
                      <Unlock className="w-5 h-5" />
                    </span>
                  ) : (
                    <span className="p-2 bg-gray-200 text-gray-500 rounded-full">
                      <Lock className="w-5 h-5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Title and Description */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {level.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {level.description}
                </p>
              </div>

              {/* Requirements & Action */}
              <div className="pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Award className="w-4 h-4 text-indigo-500 mr-1" />
                    <span>Practical: {level.practicalThreshold}%</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 text-purple-500 mr-1" />
                    <span>MCQ: {level.mcqThreshold}%</span>
                  </div>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/levels/${level._id}`);
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" /> Start Level
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-600 font-medium rounded-lg text-sm cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4 mr-2" /> Locked (Complete Level {level.order - 1})
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelList;
