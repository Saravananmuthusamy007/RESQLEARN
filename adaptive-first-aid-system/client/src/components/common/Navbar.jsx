import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, BookOpen, LayoutDashboard, Shield, Award, MessageSquare, PlayCircle } from 'lucide-react';

const AVATAR_MAP = {
  'avatar-1': '👨‍⚕️',
  'avatar-2': '👩‍⚕️',
  'avatar-3': '🚑',
  'avatar-4': '🦸‍♂️',
  'avatar-5': '🦸‍♀️',
  'avatar-6': '🩺'
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xl font-extrabold text-blue-600 tracking-tight flex items-center">
              Adaptive First-Aid
            </Link>

            {user && (
              <div className="hidden sm:flex space-x-2">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
                </Link>

                <Link
                  to="/levels"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/levels') || location.pathname.startsWith('/levels/')
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mr-1.5" /> Levels
                </Link>

                <Link
                  to="/profile"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/profile')
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1.5">{AVATAR_MAP[user.avatar] || '👤'}</span> Profile
                </Link>

                <Link
                  to="/certificate"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/certificate')
                      ? 'bg-amber-50 text-amber-800 font-bold'
                      : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50/50'
                  }`}
                >
                  <Award className="w-4 h-4 mr-1.5 text-amber-600" /> Certificate
                </Link>

                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/profile"
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                        isActive('/admin/profile')
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                      }`}
                    >
                      <Shield className="w-4 h-4 mr-1.5" /> Admin Profile
                    </Link>

                    <Link
                      to="/admin/analytics"
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                        isActive('/admin/analytics')
                          ? 'bg-purple-50 text-purple-700 font-bold'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                      }`}
                    >
                      Analytics
                    </Link>

                    <Link
                      to="/admin/questions"
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                        isActive('/admin/questions')
                          ? 'bg-purple-50 text-purple-700 font-bold'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                      }`}
                    >
                      Questions
                    </Link>

                    <Link
                      to="/admin/feedback"
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                        isActive('/admin/feedback')
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 mr-1.5" /> Feedback
                    </Link>

                    <Link
                      to="/admin/sandbox"
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                        isActive('/admin/sandbox')
                          ? 'bg-amber-50 text-amber-800 font-bold'
                          : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50/50'
                      }`}
                      title="Preview Simulation Mode / Test Sandbox"
                    >
                      <PlayCircle className="w-4 h-4 mr-1.5 text-amber-600" /> Test Sandbox
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={user.role === 'admin' ? '/admin/profile' : '/profile'}
                  className="flex items-center space-x-2 text-sm text-gray-700 font-medium bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 transition"
                >
                  <span className="text-lg">{AVATAR_MAP[user.avatar] || '👨‍⚕️'}</span>
                  <span>{user.name}</span>
                  <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm text-gray-500 hover:text-red-600 transition font-medium px-2 py-1"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
