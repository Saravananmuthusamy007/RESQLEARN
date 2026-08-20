import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Award, BookOpen, CheckCircle2, Lock, ArrowRight, Activity, Brain, ShieldAlert } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/levels');
      setLevels(res.data);
    } catch (error) {
      console.error('Error fetching dashboard levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = levels.filter(l => l.progress?.levelCompleted).length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Learner Welcome Hero */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-blue-300 bg-blue-900/60 px-3 py-1 rounded-full border border-blue-700/50">
              Learner Control Center
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-blue-200 text-sm max-w-xl">
              Track your level progression, simulation performance, adaptive MCQ scores, and official completion certificates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/levels"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center"
            >
              Browse All Levels <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center space-x-4">
          <div className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Levels Completed</span>
            <span className="text-3xl font-extrabold text-gray-900">{completedCount} / {levels.length}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center space-x-4">
          <div className="p-4 bg-blue-100 text-blue-700 rounded-2xl">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Practical Pass Rate</span>
            <span className="text-3xl font-extrabold text-gray-900">
              {levels.filter(l => l.progress?.practicalPassed).length} Levels
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center space-x-4">
          <div className="p-4 bg-amber-100 text-amber-700 rounded-2xl">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Certificates Earned</span>
            <span className="text-3xl font-extrabold text-gray-900">{completedCount} Issued</span>
          </div>
        </div>
      </div>

      {/* Levels & Certificates Breakdown Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
          <BookOpen className="w-6 h-6 text-blue-600 mr-2" /> Your Training Levels & Certificates
        </h2>

        {loading ? (
          <div className="py-12 text-center text-gray-500 font-medium">Loading training progress...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => {
              const isUnlocked = level.progress?.unlocked;
              const isCompleted = level.progress?.levelCompleted;
              const practicalPassed = level.progress?.practicalPassed;
              const mcqPassed = level.progress?.mcqPassed;

              return (
                <div
                  key={level._id}
                  className={`bg-white rounded-2xl border p-6 flex flex-col justify-between space-y-4 shadow-md transition ${
                    isCompleted
                      ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                      : isUnlocked
                      ? 'border-blue-200'
                      : 'border-gray-200 opacity-70'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Level {level.order}
                      </span>
                      {isCompleted ? (
                        <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
                        </span>
                      ) : isUnlocked ? (
                        <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                          In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                          <Lock className="w-3.5 h-3.5 mr-1" /> Locked
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 leading-snug">
                      {level.title}
                    </h3>
                  </div>

                  {/* Assessment Status Checklist */}
                  <div className="py-2 border-t border-b border-gray-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Practical Assessment:</span>
                      <span className={`font-bold ${practicalPassed ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {practicalPassed ? 'Passed (≥80%)' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Adaptive MCQ Assessment:</span>
                      <span className={`font-bold ${mcqPassed ? 'text-purple-600' : 'text-gray-400'}`}>
                        {mcqPassed ? 'Passed (≥70%)' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {isCompleted ? (
                      <Link
                        to={`/certificate/${level._id}`}
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center"
                      >
                        <Award className="w-4 h-4 mr-1.5" /> View Verifiable Certificate
                      </Link>
                    ) : isUnlocked ? (
                      <Link
                        to={`/levels/${level._id}`}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center"
                      >
                        Continue Training <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 bg-gray-100 text-gray-400 font-semibold text-xs rounded-xl cursor-not-allowed flex items-center justify-center"
                      >
                        <Lock className="w-3.5 h-3.5 mr-1" /> Unlock Previous Level First
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
