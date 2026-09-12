import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/learner/Dashboard';
import UserProfileDashboard from './pages/learner/UserProfileDashboard';
import LevelList from './pages/learner/LevelList';
import LevelContent from './pages/learner/LevelContent';
import PracticalAssessment from './pages/learner/PracticalAssessment';
import MCQAssessment from './pages/learner/MCQAssessment';
import Certificate from './pages/learner/Certificate';
import AdminProfileDashboard from './pages/admin/AdminProfileDashboard';
import ManageLevels from './pages/admin/ManageLevels';
import Analytics from './pages/admin/Analytics';
import ManageQuestions from './pages/admin/ManageQuestions';
import FeedbackInbox from './pages/admin/FeedbackInbox';
import AdminSimulationSandbox from './pages/admin/AdminSimulationSandbox';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ToastProvider } from './components/common/Toast';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Navigate to="/levels" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<div className="p-8 text-center text-red-500 font-bold text-xl">Unauthorized Access</div>} />
              
              {/* Protected Learner Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<UserProfileDashboard />} />
                <Route path="/levels" element={<LevelList />} />
                <Route path="/levels/:id" element={<LevelContent />} />
                <Route path="/practical/:levelId" element={<PracticalAssessment />} />
                <Route path="/mcq/:levelId" element={<MCQAssessment />} />
                <Route path="/certificate" element={<Certificate />} />
                <Route path="/certificate/:levelId" element={<Certificate />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/profile" element={<AdminProfileDashboard />} />
                <Route path="/admin/analytics" element={<Analytics />} />
                <Route path="/admin/questions" element={<ManageQuestions />} />
                <Route path="/admin/levels" element={<ManageLevels />} />
                <Route path="/admin/feedback" element={<FeedbackInbox />} />
                <Route path="/admin/sandbox" element={<AdminSimulationSandbox />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  </AuthProvider>
  );
}

export default App;
