import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Security
import ProtectedRoute from './components/routing/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import VerifyEmailPage from './pages/public/VerifyEmailPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// Protected Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import MyQueues from './pages/patient/MyQueues';
import LiveQueuePage from './pages/patient/LiveQueuePage';
import StaffConsole from './pages/staff/StaffConsole';
import QueueHistory from './pages/staff/QueueHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFeedback from './pages/admin/AdminFeedback';
import ProfilePage from './pages/common/ProfilePage';
import TawkToChat from './components/TawkToChat';

const App = () => {
  return (
    <div className="app-container">
      <TawkToChat />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Common Protected Routes (All roles) */}
        <Route element={<ProtectedRoute allowedRoles={['patient', 'staff', 'admin']} />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Patient Specific Routes */}
        <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/my-queues" element={<MyQueues />} />
          <Route path="/queue/:tokenID" element={<LiveQueuePage />} />
        </Route>

        {/* Staff & Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
          <Route path="/staff-console" element={<StaffConsole />} />
          <Route path="/staff-history" element={<QueueHistory />} />
          {/* Robustness for common typos like the one in user's browser */}
          <Route path="/staff console" element={<Navigate to="/staff-console" replace />} />
        </Route>

        {/* Admin Only Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
