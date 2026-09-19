import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Shield, Award, MessageSquare, Bot, User, LogOut, Menu, X, BarChart3, Users, PlaySquare, BookOpen } from 'lucide-react';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const learnerNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Training Levels', path: '/levels', icon: BookOpen },
    { name: 'Certification', path: '/certification', icon: Award },
    { name: 'AI Partner', path: '/learning-partner', icon: Bot },
    { name: 'Feedback', path: '/feedback', icon: MessageSquare },
  ];

  const adminNavLinks = [
    { name: 'Admin Dashboard', path: '/admin', icon: Activity },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Learners', path: '/admin/learners', icon: Users },
    { name: 'Level Editor', path: '/admin/levels', icon: BookOpen },
    { name: 'Demo Play', path: '/admin/demo', icon: PlaySquare },
    { name: 'Admin AI', path: '/admin/learning-partner', icon: Bot },
  ];

  const currentLinks = isAdmin ? adminNavLinks : learnerNavLinks;

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/30">
              <Activity className="w-6 h-6 text-white animate-heartbeat" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white font-mono">
                Resq<span className="text-cyan-400">Learn</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                BLS Simulation v1.0
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {currentLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    active
                      ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile / Role Badge & Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-800">
              <div className="text-right">
                <div className="text-xs font-semibold text-white truncate max-w-[130px]">{user?.name}</div>
                <div className="text-[10px] font-mono tracking-wider uppercase font-bold text-cyan-400">
                  {user?.role === 'admin' ? 'Medical Director' : 'First-Aid Cadet'}
                </div>
              </div>

              <Link
                to={isAdmin ? '/admin/profile' : '/profile'}
                className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                title="Profile Settings"
              >
                <User className="w-4 h-4" />
              </Link>

              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-lg bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/60 flex items-center justify-center text-rose-300 hover:text-rose-100 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 ${
                  active ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs">
              <div className="text-white font-semibold">{user?.name}</div>
              <div className="text-[10px] text-cyan-400 uppercase font-mono">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
