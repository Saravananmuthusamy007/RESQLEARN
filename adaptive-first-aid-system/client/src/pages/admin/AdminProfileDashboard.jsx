import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';
import {
  ShieldCheck,
  Users,
  Award,
  Activity,
  TrendingUp,
  Search,
  CheckCircle2,
  Lock,
  Mail,
  ShieldAlert,
  BarChart3,
  HelpCircle,
  Eye,
  X,
  RotateCcw,
  BadgeCheck,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  BookOpen,
  MessageSquare,
  PlayCircle
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
  const { addToast } = useToast();

  const [usersList, setUsersList] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Action States
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [learnerAnalytics, setLearnerAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'reset'|'certificate', learner, action: 'issue'|'revoke' }
  const [actionProcessing, setActionProcessing] = useState(false);

  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, learnersRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/learners?limit=100')
      ]);

      setMetrics(metricsRes.data);
      setUsersList(learnersRes.data.learners || []);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      addToast('Failed to load dashboard metrics and learners.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open Detailed Analytics Modal for specific learner
  const handleOpenAnalytics = async (learner) => {
    setSelectedLearner(learner);
    setLearnerAnalytics(null);
    setLoadingAnalytics(true);
    try {
      const res = await api.get(`/admin/learners/${learner.id}/analytics`);
      setLearnerAnalytics(res.data);
    } catch (err) {
      console.error('Error loading learner analytics:', err);
      addToast('Could not load detailed learner analytics.', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Execute Certificate Toggle (Issue or Revoke)
  const handleToggleCertificate = async (learner, action) => {
    try {
      setActionProcessing(true);
      const res = await api.put(`/admin/learners/${learner.id}/certificate`, { action });
      addToast(res.data.message, 'success');

      // Update local state immediately
      setUsersList((prev) =>
        prev.map((u) => {
          if (u.id === learner.id) {
            const isNowEligible = action === 'issue';
            return {
              ...u,
              isMasterEligible: isNowEligible,
              masterCertificateStatus: isNowEligible ? 'Issued' : 'In Progress',
              completedLevelsCount: isNowEligible ? (u.totalLevelsCount || 5) : Math.max(0, u.completedLevelsCount - 1)
            };
          }
          return u;
        })
      );

      // Refresh aggregate metrics
      const metricsRes = await api.get('/admin/metrics');
      setMetrics(metricsRes.data);
      setConfirmAction(null);
    } catch (err) {
      console.error('Error toggling certificate:', err);
      addToast(err.response?.data?.message || 'Failed to update certificate status.', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  // Execute Progress Reset
  const handleResetProgress = async (learner) => {
    try {
      setActionProcessing(true);
      const res = await api.post(`/admin/learners/${learner.id}/reset-progress`);
      addToast(res.data.message, 'warning');

      // Update local user in list
      setUsersList((prev) =>
        prev.map((u) => {
          if (u.id === learner.id) {
            return {
              ...u,
              completedLevelsCount: 0,
              practicalPassedCount: 0,
              mcqPassedCount: 0,
              isMasterEligible: false,
              masterCertificateStatus: 'In Progress'
            };
          }
          return u;
        })
      );

      // Refresh metrics
      const metricsRes = await api.get('/admin/metrics');
      setMetrics(metricsRes.data);
      setConfirmAction(null);
      if (selectedLearner?.id === learner.id) {
        setSelectedLearner(null);
      }
    } catch (err) {
      console.error('Error resetting learner progress:', err);
      addToast(err.response?.data?.message || 'Failed to reset learner progress.', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600 text-sm font-medium">Aggregating Admin Profile Dashboard & System Metrics...</p>
      </div>
    );
  }

  const filteredUsers = usersList.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Admin Profile Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

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

          {/* Quick Links */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/admin/sandbox"
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center transform hover:scale-105"
            >
              <PlayCircle className="w-4 h-4 mr-1.5 text-slate-950" /> Test Sandbox
            </Link>
            <Link
              to="/admin/feedback"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" /> Feedback Inbox
            </Link>
            <Link
              to="/admin/analytics"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-1.5" /> Analytics
            </Link>
            <Link
              to="/admin/questions"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center"
            >
              <HelpCircle className="w-4 h-4 mr-1.5" /> Questions
            </Link>
          </div>
        </div>
      </div>

      {/* Top Metric Cards (Real-time aggregated stats via MongoDB pipeline) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center space-x-4">
          <div className="p-4 bg-blue-100 text-blue-700 rounded-2xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Total Learners</span>
            <span className="text-3xl font-extrabold text-gray-900">{metrics?.totalLearners ?? usersList.length}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center space-x-4">
          <div className="p-4 bg-amber-100 text-amber-700 rounded-2xl">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Master Certificates</span>
            <span className="text-3xl font-extrabold text-amber-600">{metrics?.masterCertificatesIssued ?? 0} Issued</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center space-x-4">
          <div className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Avg Practical Score</span>
            <span className="text-3xl font-extrabold text-emerald-600">{metrics?.avgPracticalScore ?? 0}%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center space-x-4">
          <div className="p-4 bg-purple-100 text-purple-700 rounded-2xl">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Avg MCQ Quiz Score</span>
            <span className="text-3xl font-extrabold text-purple-600">{metrics?.avgMcqScore ?? 0}%</span>
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
            <p className="text-xs text-gray-500 mt-1">
              Real-time directory of enrolled learners. Monitor progress across 5 progressive levels, review assessment counts, manage Master Certificates, and reset progress.
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    No learners found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => {
                  const avatarIcon = AVATAR_MAP[usr.avatar] || '👨‍⚕️';
                  const totalLvls = usr.totalLevelsCount || 5;
                  const progressPct = Math.min(100, Math.round((usr.completedLevelsCount / totalLvls) * 100));

                  return (
                    <tr key={usr.id} className="hover:bg-gray-50/80 transition">
                      {/* Column 1: Learner Profile */}
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl border border-gray-200 shadow-sm">
                            {avatarIcon}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block text-sm">{usr.name}</span>
                            <span className="text-gray-500 font-mono text-[11px]">{usr.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Role */}
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                          usr.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {usr.role}
                        </span>
                      </td>

                      {/* Column 3: Level Progress with Visual Progress Indicator */}
                      <td className="p-3">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-gray-700">
                            <span>{usr.completedLevelsCount} / {totalLvls} Levels</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Passed Assessments Count */}
                      <td className="p-3">
                        <div className="space-y-0.5 text-[11px]">
                          <span className="block font-semibold text-emerald-700">Practical: {usr.practicalPassedCount} Passed</span>
                          <span className="block font-semibold text-purple-700">MCQ: {usr.mcqPassedCount} Passed</span>
                        </div>
                      </td>

                      {/* Column 5: Master Certificate Status */}
                      <td className="p-3">
                        {usr.isMasterEligible ? (
                          <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-[11px] rounded-full border border-amber-300 shadow-sm">
                            <Award className="w-3.5 h-3.5 mr-1 text-amber-700" /> Issued
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-500 font-semibold text-[11px] rounded-full">
                            <Lock className="w-3 h-3 mr-1" /> In Progress
                          </span>
                        )}
                      </td>

                      {/* Column 6: Actions (View Analytics / Revoke or Issue Certificate / Reset Progress) */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Action 1: View Analytics */}
                          <button
                            onClick={() => handleOpenAnalytics(usr)}
                            title="View Individual Learner Analytics"
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition inline-flex items-center text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Analytics
                          </button>

                          {/* Action 2: Revoke or Issue Certificate */}
                          {usr.isMasterEligible ? (
                            <button
                              onClick={() => setConfirmAction({ type: 'certificate', learner: usr, action: 'revoke' })}
                              title="Revoke Master Certificate"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition inline-flex items-center text-xs"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Revoke Cert
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirmAction({ type: 'certificate', learner: usr, action: 'issue' })}
                              title="Manually Issue Master Certificate"
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg transition inline-flex items-center text-xs"
                            >
                              <BadgeCheck className="w-3.5 h-3.5 mr-1" /> Issue Cert
                            </button>
                          )}

                          {/* Action 3: Reset Progress */}
                          <button
                            onClick={() => setConfirmAction({ type: 'reset', learner: usr })}
                            title="Reset Learner Progress to Level 1"
                            className="p-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-600 font-semibold rounded-lg transition inline-flex items-center text-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Action Dialog (Reset Progress or Issue/Revoke Certificate) */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-scaleUp">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-gray-900">
                {confirmAction.type === 'reset'
                  ? 'Confirm Progress Reset'
                  : confirmAction.action === 'issue'
                  ? 'Issue Master Certificate'
                  : 'Revoke Master Certificate'}
              </h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {confirmAction.type === 'reset' ? (
                <>
                  Are you sure you want to reset all test attempts and level progress for{' '}
                  <strong className="text-gray-900">{confirmAction.learner.name}</strong>? They will be reset back to Level 1.
                </>
              ) : confirmAction.action === 'issue' ? (
                <>
                  Grant official Master Certificate of Completion to{' '}
                  <strong className="text-gray-900">{confirmAction.learner.name}</strong>? This marks all 5 levels completed.
                </>
              ) : (
                <>
                  Revoke Master Certificate status from{' '}
                  <strong className="text-gray-900">{confirmAction.learner.name}</strong>? Their status will return to In Progress.
                </>
              )}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <button
                disabled={actionProcessing}
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>

              <button
                disabled={actionProcessing}
                onClick={() => {
                  if (confirmAction.type === 'reset') {
                    handleResetProgress(confirmAction.learner);
                  } else {
                    handleToggleCertificate(confirmAction.learner, confirmAction.action);
                  }
                }}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow transition flex items-center ${
                  confirmAction.type === 'reset'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : confirmAction.action === 'issue'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Learner Analytics Modal */}
      {selectedLearner && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLearner(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Learner Info Header */}
            <div className="flex items-center space-x-4 border-b border-gray-100 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-4xl border border-indigo-200 shadow-sm">
                {AVATAR_MAP[selectedLearner.avatar] || '👨‍⚕️'}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">{selectedLearner.name}</h3>
                <p className="text-xs text-gray-500 font-mono">{selectedLearner.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    Enrolled: {new Date(selectedLearner.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    selectedLearner.isMasterEligible ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    Master Cert: {selectedLearner.isMasterEligible ? 'Issued' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>

            {loadingAnalytics ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-xs text-gray-500 font-medium">Fetching simulation performance logs...</p>
              </div>
            ) : learnerAnalytics ? (
              <div className="space-y-6 text-xs">
                {/* Identified Weaknesses Summary */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-gray-900 uppercase flex items-center">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mr-1.5" /> Performance Parameters & Weak Areas
                  </h4>
                  {learnerAnalytics.weaknesses && learnerAnalytics.weaknesses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {learnerAnalytics.weaknesses.map((w, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-full font-semibold text-[11px]"
                        >
                          {w.area} ({w.count} flags)
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No recurring protocol or technique errors logged.</p>
                  )}
                </div>

                {/* Practical Attempts History Table */}
                <div>
                  <h4 className="font-bold text-gray-900 uppercase mb-2 flex items-center">
                    <Activity className="w-4 h-4 text-emerald-600 mr-1.5" /> Practical Simulation Attempts ({learnerAnalytics.practicalAttempts?.length || 0})
                  </h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                        <tr>
                          <th className="p-2.5">Level</th>
                          <th className="p-2.5">Composite Score</th>
                          <th className="p-2.5">Action Accuracy</th>
                          <th className="p-2.5">Target Accuracy</th>
                          <th className="p-2.5">Sequence</th>
                          <th className="p-2.5">Response Time</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {learnerAnalytics.practicalAttempts?.length === 0 ? (
                          <tr><td colSpan="7" className="p-4 text-center text-gray-400">No practical simulation attempts recorded yet.</td></tr>
                        ) : (
                          learnerAnalytics.practicalAttempts.map((pa, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/60">
                              <td className="p-2.5 font-bold">L{pa.level?.order || '?'}: {pa.level?.title?.split(':')[0] || 'Level'}</td>
                              <td className="p-2.5 font-bold text-gray-900">{pa.compositeScore}%</td>
                              <td className="p-2.5 text-gray-600">{pa.actionCorrectness}%</td>
                              <td className="p-2.5 text-gray-600">{pa.targetAccuracy}%</td>
                              <td className="p-2.5">{pa.sequenceCorrect ? '✓ Correct' : '✗ Sequence Error'}</td>
                              <td className="p-2.5 text-gray-600">{Math.round((pa.responseTimeMs || 0) / 1000)}s</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                                  pa.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {pa.passed ? 'Passed' : 'Failed'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MCQ Attempts History Table */}
                <div>
                  <h4 className="font-bold text-gray-900 uppercase mb-2 flex items-center">
                    <BookOpen className="w-4 h-4 text-purple-600 mr-1.5" /> Adaptive MCQ Assessments ({learnerAnalytics.mcqAttempts?.length || 0})
                  </h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                        <tr>
                          <th className="p-2.5">Level</th>
                          <th className="p-2.5">Score</th>
                          <th className="p-2.5">Attempt #</th>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {learnerAnalytics.mcqAttempts?.length === 0 ? (
                          <tr><td colSpan="5" className="p-4 text-center text-gray-400">No MCQ attempts recorded yet.</td></tr>
                        ) : (
                          learnerAnalytics.mcqAttempts.map((ma, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/60">
                              <td className="p-2.5 font-bold">L{ma.level?.order || '?'}: {ma.level?.title?.split(':')[0] || 'Level'}</td>
                              <td className="p-2.5 font-bold text-gray-900">{ma.score}%</td>
                              <td className="p-2.5 text-gray-600">Attempt #{ma.attemptNumber}</td>
                              <td className="p-2.5 text-gray-500">{new Date(ma.createdAt).toLocaleDateString()}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                                  ma.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {ma.passed ? 'Passed' : 'Failed'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-gray-100 flex justify-end">
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
