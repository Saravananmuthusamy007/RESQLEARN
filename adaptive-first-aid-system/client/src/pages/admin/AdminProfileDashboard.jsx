import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  ShieldCheck,
  Users,
  Award,
  BookOpen,
  Activity,
  TrendingUp,
  Search,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  User,
  ShieldAlert,
  BarChart3,
  HelpCircle,
  Eye,
  X,
  FileText,
  Clock
} from 'lucide-react';

const AVATAR_MAP = {
  'avatar-1': '👨‍⚕️',
  'avatar-2': '👩‍⚕️',
  'avatar-3': '🚑',
  'avatar-4': '🦸‍♂️',
  'avatar-5': '🦸‍♀️',
  'avatar-6': '🩺'
};

const AdminProfileDashboard = () => {
  const { user } = useContext(AuthContext);
  const [usersList, setUsersList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'analytics'

  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, analyticsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/analytics')
      ]);

      setUsersList(usersRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Error fetching admin profile dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600 text-sm font-medium">Loading Admin Profile Dashboard...</p>
      </div>
    );
  }

  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const masterCertifiedCount = usersList.filter(u => u.isMasterEligible).length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Admin Profile Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl sm:text-5xl border-4 border-white/20 shadow-xl">
              👨‍⚕️
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-300 bg-indigo-900/80 px-3 py-1 rounded-full border border-indigo-700/60 inline-flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" /> System Administrator
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {user?.name || 'System Admin'}
              </h1>

              <div className="flex items-center gap-4 text-xs text-indigo-200">
                <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1" /> {user?.email}</span>
                <span className="flex items-center"><ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-400" /> Executive First-Aid Auditor</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/questions"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center"
            >
              <HelpCircle className="w-4 h-4 mr-1.5" /> Manage MCQ Questions
            </Link>
            <Link
              to="/admin/analytics"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-1.5" /> Advanced Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center space-x-4">
          <div className="p-4 bg-blue-100 text-blue-700 rounded-2xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Total Learners</span>
            <span className="text-3xl font-extrabold text-gray-900">{usersList.length}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center space-x-4">
          <div className="p-4 bg-amber-100 text-amber-700 rounded-2xl">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Master Certificates</span>
            <span className="text-3xl font-extrabold text-amber-600">{masterCertifiedCount} Issued</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center space-x-4">
          <div className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Avg Practical Score</span>
            <span className="text-3xl font-extrabold text-emerald-600">{analytics?.avgPracticalScore || 0}%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center space-x-4">
          <div className="p-4 bg-purple-100 text-purple-700 rounded-2xl">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Avg MCQ Quiz Score</span>
            <span className="text-3xl font-extrabold text-purple-600">{analytics?.avgMcqScore || 0}%</span>
          </div>
        </div>
      </div>

      {/* Main Roster & Profile Management Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
              <Users className="w-6 h-6 text-indigo-600 mr-2" /> Learner Profiles & Master Certificate Roster
            </h2>
            <p className="text-xs text-gray-500">
              Monitor individual learner progress, avatars, level completions, and Master Certificate eligibility.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search learner name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* User Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-bold uppercase">
                <th className="p-3">Learner Profile</th>
                <th className="p-3">Role</th>
                <th className="p-3">Level Progress</th>
                <th className="p-3">Passed Assessments</th>
                <th className="p-3">Master Certificate</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((usr) => {
                const avatarIcon = AVATAR_MAP[usr.avatar] || '👨‍⚕️';
                const progressPct = Math.round((usr.completedLevelsCount / (usr.totalLevelsCount || 5)) * 100);

                return (
                  <tr key={usr.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl border border-gray-200">
                          {avatarIcon}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block text-sm">{usr.name}</span>
                          <span className="text-gray-500 font-mono text-[11px]">{usr.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                        usr.role === 'admin' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {usr.role}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="w-36 space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-gray-700">
                          <span>{usr.completedLevelsCount} / {usr.totalLevelsCount || 5} Levels</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="space-y-0.5 text-[11px]">
                        <span className="block font-semibold text-emerald-700">Practical: {usr.practicalPassedCount} Passed</span>
                        <span className="block font-semibold text-purple-700">MCQ: {usr.mcqPassedCount} Passed</span>
                      </div>
                    </td>

                    <td className="p-3">
                      {usr.isMasterEligible ? (
                        <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-[11px] rounded-full border border-amber-300">
                          <Award className="w-3.5 h-3.5 mr-1 text-amber-700" /> Master Certified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-500 font-semibold text-[11px] rounded-full">
                          <Lock className="w-3 h-3 mr-1" /> In Progress
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedLearner(usr)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition inline-flex items-center text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Learner Details Modal */}
      {selectedLearner && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative my-8 space-y-6">
            <button
              onClick={() => setSelectedLearner(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Learner Info Header */}
            <div className="flex items-center space-x-4 border-b border-gray-100 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-4xl border border-indigo-200">
                {AVATAR_MAP[selectedLearner.avatar] || '👨‍⚕️'}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">{selectedLearner.name}</h3>
                <p className="text-xs text-gray-500 font-mono">{selectedLearner.email}</p>
                <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                  Enrolled: {new Date(selectedLearner.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Learner Metrics */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-bold block">Levels Completed</span>
                <span className="text-xl font-black text-gray-900">{selectedLearner.completedLevelsCount} / {selectedLearner.totalLevelsCount || 5}</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <span className="text-amber-800 font-bold block">Master Certificate</span>
                <span className="text-lg font-black text-amber-700">
                  {selectedLearner.isMasterEligible ? 'Master Certified' : 'In Progress'}
                </span>
              </div>
            </div>

            {/* Safety & Contact Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-gray-900 uppercase">Emergency & Learner Info</h4>
              <p><strong>Phone:</strong> {selectedLearner.phone || 'Not provided'}</p>
              <p><strong>Bio:</strong> {selectedLearner.bio || 'Not provided'}</p>
              <p><strong>Emergency Contact:</strong> {selectedLearner.emergencyContactName || 'None'} ({selectedLearner.emergencyContactPhone || 'N/A'})</p>
              {selectedLearner.medicalNotes && <p><strong>Medical Notes:</strong> {selectedLearner.medicalNotes}</p>}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLearner(null)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfileDashboard;
