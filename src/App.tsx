import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';
import { NotFoundPage } from './pages/auth/NotFoundPage';

// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMentorsPage } from './pages/admin/AdminMentorsPage';
import { AdminMenteesPage } from './pages/admin/AdminMenteesPage';
import { AdminMenteeProfilePage } from './pages/admin/AdminMenteeProfilePage';
import { AdminAssignmentsPage } from './pages/admin/AdminAssignmentsPage';
import { AdminVerificationsPage } from './pages/admin/AdminVerificationsPage';
import { AdminPermissionsPage } from './pages/admin/AdminPermissionsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Mentor pages
import { MentorDashboardPage } from './pages/mentor/MentorDashboardPage';
import { MentorMenteesPage } from './pages/mentor/MentorMenteesPage';
import { MentorMenteeDetailPage } from './pages/mentor/MentorMenteeDetailPage';
import { MentorRecommendationsPage } from './pages/mentor/MentorRecommendationsPage';
import { MentorNotesPage } from './pages/mentor/MentorNotesPage';

// Mentee pages
import { MenteeDashboardPage } from './pages/mentee/MenteeDashboardPage';
import { MenteeProfilePage } from './pages/mentee/MenteeProfilePage';
import { MenteeAcademicRecordsPage } from './pages/mentee/MenteeAcademicRecordsPage';
import { MenteeMentorPage } from './pages/mentee/MenteeMentorPage';
import { MenteeRecommendationsPage } from './pages/mentee/MenteeRecommendationsPage';

// Root redirect based on role
const RootRedirect: React.FC = () => {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile) return <Navigate to="/login" replace />;

  if (profile.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (profile.role === 'mentor') return <Navigate to="/mentor/dashboard" replace />;
  return <Navigate to="/mentee/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Admin protected routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="mentors" element={<AdminMentorsPage />} />
              <Route path="mentees" element={<AdminMenteesPage />} />
              <Route path="mentees/:id" element={<AdminMenteeProfilePage />} />
              <Route path="assignments" element={<AdminAssignmentsPage />} />
              <Route path="verifications" element={<AdminVerificationsPage />} />
              <Route path="permissions" element={<AdminPermissionsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>

            {/* Mentor protected routes */}
            <Route
              path="/mentor"
              element={
                <ProtectedRoute allowedRoles={['mentor']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<MentorDashboardPage />} />
              <Route path="mentees" element={<MentorMenteesPage />} />
              <Route path="mentees/:id" element={<MentorMenteeDetailPage />} />
              <Route path="recommendations" element={<MentorRecommendationsPage />} />
              <Route path="notes" element={<MentorNotesPage />} />
            </Route>

            {/* Mentee protected routes */}
            <Route
              path="/mentee"
              element={
                <ProtectedRoute allowedRoles={['mentee']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<MenteeDashboardPage />} />
              <Route path="profile" element={<MenteeProfilePage />} />
              <Route path="academic-records" element={<MenteeAcademicRecordsPage />} />
              <Route path="mentor" element={<MenteeMentorPage />} />
              <Route path="recommendations" element={<MenteeRecommendationsPage />} />
            </Route>

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
