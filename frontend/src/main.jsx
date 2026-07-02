import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import StudentLogin from './pages/auth/StudentLogin';
import TPOLogin from './pages/auth/TPOLogin';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentApplications from './pages/student/Applications';

// TPO pages
import TPODashboard from './pages/tpo/Dashboard';
import TPODrives from './pages/tpo/Drives';
import TPOVerification from './pages/tpo/Verification';
import TPOAnnouncements from './pages/tpo/Announcements';
import TPOAnalytics from './pages/tpo/Analytics';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterApplicants from './pages/recruiter/Applicants';
import RecruiterProfile from './pages/recruiter/Profile';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login/student" replace />} />
          <Route path="/login/student" element={<StudentLogin />} />
          <Route path="/login/tpo" element={<TPOLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Student routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentProfile />
            </ProtectedRoute>
          } />
          <Route path="/student/applications" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentApplications />
            </ProtectedRoute>
          } />

          {/* TPO routes */}
          <Route path="/tpo/dashboard" element={
            <ProtectedRoute allowedRoles={['TPO']}>
              <TPODashboard />
            </ProtectedRoute>
          } />
          <Route path="/tpo/drives" element={
            <ProtectedRoute allowedRoles={['TPO']}>
              <TPODrives />
            </ProtectedRoute>
          } />
          <Route path="/tpo/verification" element={
            <ProtectedRoute allowedRoles={['TPO']}>
              <TPOVerification />
            </ProtectedRoute>
          } />
          <Route path="/tpo/announcements" element={
            <ProtectedRoute allowedRoles={['TPO']}>
              <TPOAnnouncements />
            </ProtectedRoute>
          } />
          <Route path="/tpo/analytics" element={
            <ProtectedRoute allowedRoles={['TPO']}>
              <TPOAnalytics />
            </ProtectedRoute>
          } />

          {/* Recruiter routes */}
          <Route path="/recruiter/dashboard" element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <RecruiterDashboard />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/applicants" element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <RecruiterApplicants />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/profile" element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <RecruiterProfile />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login/student" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
