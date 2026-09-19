import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Shield, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@resqlearn.io');
      setPassword('AdminRescue2026!');
    } else {
      setEmail('learner@resqlearn.io');
      setPassword('LearnerRescue2026!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 mx-auto flex items-center justify-center shadow-xl shadow-rose-900/40 mb-3">
            <Activity className="w-8 h-8 text-white animate-heartbeat" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white font-mono">
            Resq<span className="text-cyan-400">Learn</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Intelligent Adaptive First-Aid / BLS Training Platform
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1">Access Simulation Portal</h2>
          <p className="text-xs text-slate-400 mb-6">Enter your clinical credentials to continue training.</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <Shield className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cadet@resqlearn.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-900/30 flex items-center justify-center space-x-2 transition-all"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Simulation Engine'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Pair Programming / Testing */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
              <span>QUICK-FILL TEST ACCOUNTS:</span>
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('learner')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/60 text-slate-300 text-left font-medium hover:text-white transition-colors"
              >
                <div className="font-bold text-cyan-400 text-[11px]">Trainee Cadet</div>
                <div className="text-[10px] text-slate-500 truncate">learner@resqlearn.io</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-500/60 text-slate-300 text-left font-medium hover:text-white transition-colors"
              >
                <div className="font-bold text-purple-400 text-[11px]">Medical Director</div>
                <div className="text-[10px] text-slate-500 truncate">admin@resqlearn.io</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
              Register as Cadet
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
