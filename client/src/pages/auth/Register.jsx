import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Shield, Lock, Mail, User, Building, ArrowRight, Key, Sparkles } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('learner'); // 'learner' | 'admin'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
    adminKey: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'admin' && !formData.adminKey) {
      setFormData(prev => ({
        ...prev,
        adminKey: 'RESQ-ADMIN-2026',
        organization: prev.organization || 'ResqLearn Emergency Medical Authority',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        role,
      };
      const user = await register(payload);
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (targetRole) => {
    if (targetRole === 'admin') {
      setRole('admin');
      setFormData({
        name: 'Dr. Sarah Lin (Clinical Director)',
        email: `admin.${Date.now().toString().slice(-4)}@resqlearn.io`,
        password: 'AdminRescue2026!',
        organization: 'ResqLearn Emergency Medical Authority',
        adminKey: 'RESQ-ADMIN-2026',
      });
    } else {
      setRole('learner');
      setFormData({
        name: 'Cadet James Miller',
        email: `cadet.${Date.now().toString().slice(-4)}@resqlearn.io`,
        password: 'CadetRescue2026!',
        organization: 'Metro First Responder Unit',
        adminKey: '',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 mx-auto flex items-center justify-center shadow-xl shadow-rose-900/40 mb-2">
            <Activity className="w-7 h-7 text-white animate-heartbeat" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-mono">
            Join Resq<span className="text-cyan-400">Learn</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered directly into the <strong className="text-emerald-400">resqlearn</strong> clinical database
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
          {/* Account Role Selector */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => handleRoleChange('learner')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'learner'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              First-Aid Cadet
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'admin'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Medical Director (Admin)
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <Shield className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {role === 'admin' ? 'Director Full Name' : 'Full Legal Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={role === 'admin' ? 'Dr. Sarah Lin, MD' : 'Cadet Jane Doe'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={role === 'admin' ? 'director@resqlearn.io' : 'jane.doe@hospital.org'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password (min 6 characters)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Affiliated Organization / Hospital</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder={role === 'admin' ? 'ResqLearn Emergency Medical Authority' : 'Metro Emergency Services'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Admin Authorization Passkey (Only shown if Admin is selected) */}
            {role === 'admin' && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/80 space-y-1.5">
                <label className="block text-xs font-semibold text-purple-300">
                  Medical Director Passkey
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="adminKey"
                    required
                    value={formData.adminKey}
                    onChange={handleChange}
                    placeholder="RESQ-ADMIN-2026"
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-purple-700 rounded-xl text-xs text-white placeholder-purple-400/50 font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div className="text-[10px] text-purple-300/80 font-mono">
                  Default developer passkey: <span className="font-bold text-white">RESQ-ADMIN-2026</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-2 py-3 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all ${
                role === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/40'
                  : 'bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/30'
              }`}
            >
              <span>
                {isSubmitting
                  ? 'Enrolling...'
                  : role === 'admin'
                  ? 'Register as Medical Director (Admin)'
                  : 'Enroll in Emergency Training (Cadet)'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick-fill Demo Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 mb-2 flex items-center justify-between">
              <span>ONE-CLICK REGISTRATION FILL:</span>
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('learner')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 text-left font-medium transition-colors"
              >
                <div className="font-bold text-cyan-400 text-[11px]">Quick Cadet</div>
                <div className="text-[9px] text-slate-500">Auto-fill learner</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-300 text-left font-medium transition-colors"
              >
                <div className="font-bold text-purple-400 text-[11px]">Quick Admin</div>
                <div className="text-[9px] text-slate-500">Auto-fill director</div>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
