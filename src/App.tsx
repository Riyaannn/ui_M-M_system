import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { RoleGuard } from './routes/RoleGuard';

// Layouts
import { AdminLayout } from './components/layout/AdminLayout';
import { MentorLayout } from './components/layout/MentorLayout';
import { MenteeLayout } from './components/layout/MenteeLayout';

// Public & Authentication Pages
import { PortalSelectionPage } from './pages/auth/PortalSelectionPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { MentorLoginPage } from './pages/auth/MentorLoginPage';
import { MenteeLoginPage } from './pages/auth/MenteeLoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';
import { NotFoundPage } from './pages/auth/NotFoundPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMentorsPage } from './pages/admin/AdminMentorsPage';
import { AdminMenteesPage } from './pages/admin/AdminMenteesPage';
import { AdminMenteeProfilePage } from './pages/admin/AdminMenteeProfilePage';
import { AdminAssignmentsPage } from './pages/admin/AdminAssignmentsPage';
import { AdminVerificationsPage } from './pages/admin/AdminVerificationsPage';
import { AdminPermissionsPage } from './pages/admin/AdminPermissionsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Mentor Pages
import { MentorDashboardPage } from './pages/mentor/MentorDashboardPage';
import { MentorMenteesPage } from './pages/mentor/MentorMenteesPage';
import { MentorMenteeDetailPage } from './pages/mentor/MentorMenteeDetailPage';
import { MentorRecommendationsPage } from './pages/mentor/MentorRecommendationsPage';
import { MentorNotesPage } from './pages/mentor/MentorNotesPage';

// Mentee Pages
import { MenteeDashboardPage } from './pages/mentee/MenteeDashboardPage';
import { MenteeProfilePage } from './pages/mentee/MenteeProfilePage';
import { MenteeAcademicRecordsPage } from './pages/mentee/MenteeAcademicRecordsPage';
import { MenteeMentorPage } from './pages/mentee/MenteeMentorPage';
import { MenteeRecommendationsPage } from './pages/mentee/MenteeRecommendationsPage';

// Smart Root Redirect based on authenticated role
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
            {/* Entry & Public Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<PortalSelectionPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/mentor/login" element={<MentorLoginPage />} />
            <Route path="/mentee/login" element={<MenteeLoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Administrator Protected Routes */}
            <Route
              path="/admin"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminLayout />
                </RoleGuard>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="mentors" element={<AdminMentorsPage />} />
              <Route path="mentees" element={<AdminMenteesPage />} />
              <Route path="mentees/:id" element={<AdminMenteeProfilePage />} />
              <Route path="assignments" element={<AdminAssignmentsPage />} />
              <Route path="verifications" element={<AdminVerificationsPage />} />
              <Route path="permissions" element={<AdminPermissionsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>

            {/* Mentor Protected Routes */}
            <Route
              path="/mentor"
              element={
                <RoleGuard allowedRoles={['mentor']}>
                  <MentorLayout />
                </RoleGuard>
              }
            >
              <Route index element={<Navigate to="/mentor/dashboard" replace />} />
              <Route path="dashboard" element={<MentorDashboardPage />} />
              <Route path="mentees" element={<MentorMenteesPage />} />
              <Route path="mentees/:id" element={<MentorMenteeDetailPage />} />
              <Route path="recommendations" element={<MentorRecommendationsPage />} />
              <Route path="notes" element={<MentorNotesPage />} />
            </Route>

            {/* Mentee Protected Routes */}
            <Route
              path="/mentee"
              element={
                <RoleGuard allowedRoles={['mentee']}>
                  <MenteeLayout />
                </RoleGuard>
              }
            >
              <Route index element={<Navigate to="/mentee/dashboard" replace />} />
              <Route path="dashboard" element={<MenteeDashboardPage />} />
              <Route path="profile" element={<MenteeProfilePage />} />
              <Route path="academic-records" element={<MenteeAcademicRecordsPage />} />
              <Route path="mentor" element={<MenteeMentorPage />} />
              <Route path="recommendations" element={<MenteeRecommendationsPage />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
