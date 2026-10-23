import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CaseTrackProvider } from './context/CaseTrackContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public & Shared Pages
import { HomePage } from './pages/HomePage';
import { PortalSelectPage } from './pages/PortalSelectPage';
import { HelpPage } from './pages/HelpPage';
import { DashboardPage } from './pages/DashboardPage';
import { RegistryPage } from './pages/RegistryPage';
import { NewComplaintPage } from './pages/NewComplaintPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { RelatedCasesPage } from './pages/RelatedCasesPage';
import { WorkflowPage } from './pages/WorkflowPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { PresentationModePage } from './pages/PresentationModePage';
import { AboutArchitecturePage } from './pages/AboutArchitecturePage';
import { LoginPage } from './pages/LoginPage';

// Dedicated Secure Login Pages
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { OfficerLoginPage } from './pages/auth/OfficerLoginPage';

// Exactly 3 Dedicated Role Dashboards
import { PublicDashboardPage } from './pages/dashboards/PublicDashboardPage';
import { AdminDashboardPage } from './pages/dashboards/AdminDashboardPage';
import { OfficerDashboardPage } from './pages/dashboards/OfficerDashboardPage';

export const App: React.FC = () => {
  return (
    <CaseTrackProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone Authentication Pages */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/officer/login" element={<OfficerLoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/presentation" element={<PresentationModePage />} />

          {/* Main App Layout */}
          <Route element={<MainLayout />}>
            {/* 1. Public Portal & Overview Landing */}
            <Route path="/" element={<HomePage />} />
            <Route path="/help" element={<HelpPage />} />

            {/* 2. Role Selection Portal Hub */}
            <Route path="/portals" element={<PortalSelectPage />} />
            <Route path="/portal-select" element={<PortalSelectPage />} />

            {/* 3. Exactly Three Dedicated Role Portals */}
            <Route
              path="/portal/public"
              element={<PublicDashboardPage />}
            />
            <Route
              path="/portal/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/officer"
              element={
                <ProtectedRoute allowedRoles={['bureau_officer', 'officer']}>
                  <OfficerDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Legacy Portal Route Redirects to Consolidated Admin Portal */}
            <Route path="/portal/verification" element={<Navigate to="/portal/admin" replace />} />
            <Route path="/portal/supervisor" element={<Navigate to="/portal/admin" replace />} />
            <Route path="/portal/management" element={<Navigate to="/portal/admin" replace />} />

            {/* 4. Public Complaint Filing & Case Inspection */}
            <Route path="/register" element={<NewComplaintPage />} />
            <Route path="/case/:id" element={<CaseDetailPage />} />

            {/* 5. Central Complaint Registry (Protected for Admin & Bureau Officers) */}
            <Route
              path="/registry"
              element={
                <ProtectedRoute allowedRoles={['admin', 'bureau_officer', 'officer']}>
                  <RegistryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 6. Institutions Directory */}
            <Route path="/institutions" element={<InstitutionsPage />} />

            {/* 7. Case Intelligence & Related Case Detection (Authorized Staff Only) */}
            <Route
              path="/case-intelligence"
              element={
                <ProtectedRoute allowedRoles={['admin', 'bureau_officer', 'officer']}>
                  <RelatedCasesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/related-cases" element={<Navigate to="/case-intelligence" replace />} />

            {/* 8. Circular Redressal Lifecycle */}
            <Route path="/workflow" element={<WorkflowPage />} />

            {/* 9. Operational Alerts (Staff Only) */}
            <Route
              path="/alerts"
              element={
                <ProtectedRoute allowedRoles={['admin', 'bureau_officer', 'officer']}>
                  <AlertsPage />
                </ProtectedRoute>
              }
            />

            {/* 10. Analytics & Compliance Reports (Admin Only) */}
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />

            {/* 11. Specifications */}
            <Route path="/about" element={<AboutArchitecturePage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CaseTrackProvider>
  );
};

export default App;
