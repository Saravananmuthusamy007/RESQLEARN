import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import LearnerLayout from './layouts/LearnerLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Learner Pages
import Dashboard from './pages/learner/Dashboard';
import LevelsList from './pages/learner/LevelsList';
import LearningModule from './pages/learner/LearningModule';
import SimulationPage from './pages/learner/SimulationPage';
import AssessmentPage from './pages/learner/AssessmentPage';
import CertificationPage from './pages/learner/CertificationPage';
import LearningPartnerPage from './pages/learner/LearningPartnerPage';
import FeedbackPage from './pages/learner/FeedbackPage';
import ProfilePage from './pages/learner/ProfilePage';
import PublicVerifyPage from './pages/learner/PublicVerifyPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import LearnerManagementPage from './pages/admin/LearnerManagementPage';
import LevelEditorPage from './pages/admin/LevelEditorPage';
import DemoPlayPage from './pages/admin/DemoPlayPage';
import AdminAIPartnerPage from './pages/admin/AdminAIPartnerPage';
import FeedbackAdminPage from './pages/admin/FeedbackAdminPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
const RootRedirect = () => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Intelligent Root Routing */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:certificateId" element={<PublicVerifyPage />} />

          {/* Learner Protected Routes */}
          <Route element={<LearnerLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/levels" element={<LevelsList />} />
            <Route path="/levels/:id/learn" element={<LearningModule />} />
            <Route path="/levels/:id/simulation" element={<SimulationPage />} />
            <Route path="/levels/:id/assessment" element={<AssessmentPage />} />
            <Route path="/certification" element={<CertificationPage />} />
            <Route path="/learning-partner" element={<LearningPartnerPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/learners" element={<LearnerManagementPage />} />
            <Route path="/admin/levels" element={<LevelEditorPage />} />
            <Route path="/admin/demo" element={<DemoPlayPage />} />
            <Route path="/admin/learning-partner" element={<AdminAIPartnerPage />} />
            <Route path="/admin/feedback" element={<FeedbackAdminPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
