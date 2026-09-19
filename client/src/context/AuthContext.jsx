import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('resqlearn_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('resqlearn_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user from /api/auth/me on initial load
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.get('/auth/me');
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('resqlearn_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.warn('Auth token verification failed:', err.message);
        localStorage.removeItem('resqlearn_token');
        localStorage.removeItem('resqlearn_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.success && data.token) {
      localStorage.setItem('resqlearn_token', data.token);
      localStorage.setItem('resqlearn_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Login failed.');
  };

  const register = async (formData) => {
    const data = await api.post('/auth/register', formData);
    if (data.success && data.token) {
      localStorage.setItem('resqlearn_token', data.token);
      localStorage.setItem('resqlearn_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Registration failed.');
  };

  const logout = () => {
    localStorage.removeItem('resqlearn_token');
    localStorage.removeItem('resqlearn_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const data = await api.put('/auth/profile', profileData);
    if (data.success && data.user) {
      setUser(prev => ({ ...prev, ...data.user }));
      localStorage.setItem('resqlearn_user', JSON.stringify({ ...user, ...data.user }));
      return data.user;
    }
    throw new Error(data.message || 'Profile update failed.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
