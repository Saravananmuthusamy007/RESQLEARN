import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, BookOpen, LayoutDashboard, Shield } from 'lucide-react';

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
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-extrabold text-blue-600 tracking-tight">
              Adaptive First-Aid
            </Link>

            {user && (
              <div className="hidden sm:flex space-x-4">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
                </Link>

                <Link
                  to="/levels"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/levels') || location.pathname.startsWith('/levels/')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mr-1.5" /> Levels
                </Link>

                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/analytics"
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                        isActive('/admin/analytics')
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                      }`}
                    >
                      <Shield className="w-4 h-4 mr-1.5" /> Analytics
                    </Link>

                    <Link
                      to="/admin/questions"
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                        isActive('/admin/questions')
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                      }`}
                    >
                      <Shield className="w-4 h-4 mr-1.5" /> Questions
                    </Link>

                    <Link
                      to="/admin/levels"
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                        isActive('/admin/levels')
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                      }`}
                    >
                      <Shield className="w-4 h-4 mr-1.5" /> Levels
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-full">
                  {user.name} <span className="text-xs text-blue-600 capitalize">({user.role})</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm text-gray-500 hover:text-red-600 transition font-medium"
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
