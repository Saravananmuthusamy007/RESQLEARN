import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import MasterCertificateModule from '../../components/certificate/MasterCertificateModule';
import {
  User,
  Mail,
  Phone,
  ShieldAlert,
  Award,
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  Edit3,
  X,
  Save,
  Activity,
  HeartHandshake,
  Sparkles,
  FileText,
  Clock,
  MessageSquare
} from 'lucide-react';
import FeedbackModal from '../../components/feedback/FeedbackModal';

const AVATAR_OPTIONS = [
  { id: 'avatar-1', label: 'Doctor', icon: '👨‍⚕️' },
  { id: 'avatar-2', label: 'Nurse', icon: '👩‍⚕️' },
  { id: 'avatar-3', label: 'Paramedic', icon: '🚑' },
  { id: 'avatar-4', label: 'First-Aid Hero', icon: '🦸‍♂️' },
  { id: 'avatar-5', label: 'First-Aid Heroine', icon: '🦸‍♀️' },
  { id: 'avatar-6', label: 'Medic Specialist', icon: '🩺' }
];

const UserProfileDashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    avatar: 'avatar-1',
    phone: '',
    bio: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalNotes: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [feedbackLevel, setFeedbackLevel] = useState(null);

  useEffect(() => {
    fetchProfileAndDashboard();
  }, []);

  const fetchProfileAndDashboard = async () => {
    try {
      setLoading(true);
      const [meRes, levelsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/levels')
      ]);

      const fetchedUser = meRes.data;
      setProfileData(fetchedUser);
      setLevels(levelsRes.data);

      setEditForm({
        name: fetchedUser.name || '',
        avatar: fetchedUser.avatar || 'avatar-1',
        phone: fetchedUser.phone || '',
        bio: fetchedUser.bio || '',
        emergencyContactName: fetchedUser.emergencyContactName || '',
        emergencyContactPhone: fetchedUser.emergencyContactPhone || '',
        medicalNotes: fetchedUser.medicalNotes || ''
      });
    } catch (err) {
      console.error('Error fetching user profile dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const res = await api.put('/auth/profile', editForm);
      setProfileData(res.data.user);
      
      // Update global auth context
      if (setUser) {
        setUser(prev => ({
          ...prev,
          ...res.data.user
        }));
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setShowEditModal(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const completedCount = levels.filter(l => l.progress?.levelCompleted).length;
  const isMasterEligible = completedCount >= (levels.length || 5) && levels.length > 0;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 text-sm font-medium">Loading Learner Profile Dashboard...</p>
      </div>
    );
  }

  const currentAvatarIcon = AVATAR_OPTIONS.find(a => a.id === (profileData?.avatar || 'avatar-1'))?.icon || '👨‍⚕️';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Toast Notification */}
      {message && (
        <div className={`p-4 rounded-2xl border font-semibold text-sm flex items-center justify-between shadow-md ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs underline font-bold">Dismiss</button>
        </div>
      )}

      {/* User Header Profile Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            {/* Avatar Badge */}
            <div className="relative group cursor-pointer" onClick={() => setShowEditModal(true)}>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-5xl sm:text-6xl border-4 border-white/20 shadow-xl group-hover:scale-105 transition transform">
                {currentAvatarIcon}
              </div>
              <button
                className="absolute bottom-0 right-0 p-2 bg-amber-500 text-slate-950 rounded-xl shadow-lg border border-amber-300 hover:bg-amber-400 transition"
                title="Change Avatar & Edit Profile"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-extrabold tracking-wider text-blue-300 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-700/60 inline-flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-yellow-400" /> First-Aid Learner
                </span>
                {isMasterEligible && (
                  <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-600/60 inline-flex items-center">
                    <Award className="w-3.5 h-3.5 mr-1" /> Master Certified
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {profileData?.name || user?.name}
              </h1>
              
              <div className="flex items-center gap-4 text-xs text-blue-200 flex-wrap">
                <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1 text-blue-400" /> {profileData?.email}</span>
                {profileData?.phone && <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1 text-blue-400" /> {profileData?.phone}</span>}
              </div>

              <p className="text-blue-100 text-xs italic max-w-xl mt-2 line-clamp-2">
                "{profileData?.bio || 'Passionate first-aid learner dedicated to saving lives.'}"
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center justify-center"
            >
              <Edit3 className="w-4 h-4 mr-2" /> Edit Profile & Avatar
            </button>

            <Link
              to="/certificate"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center"
            >
              <Award className="w-4 h-4 mr-1.5" /> Single Master Certificate
            </Link>
          </div>
        </div>
      </div>

      {/* Emergency & Medical Contact Info Summary */}
      {(profileData?.emergencyContactName || profileData?.medicalNotes) && (
        <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl mt-0.5">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-sm">Emergency & Learner Safety Profile</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                <strong>Emergency Contact:</strong> {profileData.emergencyContactName} ({profileData.emergencyContactPhone || 'N/A'})
              </p>
              {profileData.medicalNotes && (
                <p className="text-xs text-amber-800 mt-0.5">
                  <strong>Notes:</strong> {profileData.medicalNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center space-x-4">
          <div className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Levels Mastered</span>
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
          <div className="p-4 bg-purple-100 text-purple-700 rounded-2xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">MCQ Quizzes Passed</span>
            <span className="text-3xl font-extrabold text-gray-900">
              {levels.filter(l => l.progress?.mcqPassed).length} Passed
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center space-x-4">
          <div className="p-4 bg-amber-100 text-amber-700 rounded-2xl">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block">Master Certificate</span>
            <span className={`text-lg font-black ${isMasterEligible ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isMasterEligible ? 'Unlocked' : `${completedCount}/5 Complete`}
            </span>
          </div>
        </div>
      </div>

      {/* Master Certificate Quick Access Banner Module */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-lg space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              Single Certificate Module
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Master First-Aid Qualification Credential
            </h2>
            <p className="text-gray-600 text-xs max-w-2xl">
              Our system issues a single official Master Certificate of First-Aid Proficiency once you successfully pass both practical simulations and adaptive MCQ assessments across all 5 training levels.
            </p>
          </div>

          <div>
            <Link
              to="/certificate"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition transform hover:scale-105"
            >
              <Award className="w-5 h-5 mr-2" />
              {isMasterEligible ? 'View Official Master Certificate' : 'Check Certification Progress'}
            </Link>
          </div>
        </div>
      </div>

      {/* Level Breakdown Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
          <BookOpen className="w-6 h-6 text-blue-600 mr-2" /> Your Training Levels & Progress
        </h2>

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

                {/* Navigation Actions */}
                <div className="space-y-2">
                  {isUnlocked ? (
                    <Link
                      to={`/levels/${level._id}`}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center"
                    >
                      {isCompleted ? 'Review Training Level' : 'Continue Training'} <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 bg-gray-100 text-gray-400 font-semibold text-xs rounded-xl cursor-not-allowed flex items-center justify-center"
                    >
                      <Lock className="w-3.5 h-3.5 mr-1" /> Unlock Previous Level First
                    </button>
                  )}

                  {isCompleted && (
                    <button
                      onClick={() => setFeedbackLevel({ order: level.order, title: level.title })}
                      className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Rate & Feedback on Level {level.order}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative my-8">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center mb-6">
              <User className="w-6 h-6 text-blue-600 mr-2" /> Edit Profile & Choose Avatar
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              {/* Avatar Selector */}
              <div>
                <label className="block font-bold text-gray-700 mb-2">Choose Avatar Picture</label>
                <div className="grid grid-cols-3 gap-3">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, avatar: opt.id })}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition ${
                        editForm.avatar === opt.id
                          ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/30'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <span className="text-[10px] font-bold text-gray-700">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Learner Bio / Goal</label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-gray-200">
                <label className="block font-bold text-gray-800 mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  value={editForm.emergencyContactName}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                  placeholder="Guardian / Emergency Contact Name"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={editForm.emergencyContactPhone}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                  placeholder="Emergency Contact Phone"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {saving ? 'Saving Profile...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End of Level Feedback Modal */}
      <FeedbackModal
        isOpen={!!feedbackLevel}
        onClose={() => setFeedbackLevel(null)}
        levelId={feedbackLevel?.order || 1}
        levelTitle={feedbackLevel?.title}
      />
    </div>
  );
};

export default UserProfileDashboard;
