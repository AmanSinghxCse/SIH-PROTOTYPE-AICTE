import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CaseTrackProvider } from './context/CaseTrackContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public & Shared Pages
import { HomePage } from './pages/HomePage';
import { PortalSelectPage } from './pages/PortalSelectPage';
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

// 6 Role-Specific Dashboards
import { PublicDashboardPage } from './pages/dashboards/PublicDashboardPage';
import { AdminDashboardPage } from './pages/dashboards/AdminDashboardPage';
import { OfficerDashboardPage } from './pages/dashboards/OfficerDashboardPage';
import { VerificationDashboardPage } from './pages/dashboards/VerificationDashboardPage';
import { SupervisorDashboardPage } from './pages/dashboards/SupervisorDashboardPage';
import { ManagementDashboardPage } from './pages/dashboards/ManagementDashboardPage';

export const App: React.FC = () => {
  return (
    <CaseTrackProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone Presentation & Login Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/presentation" element={<PresentationModePage />} />

          {/* Main App Layout */}
          <Route element={<MainLayout />}>
            {/* 1. Public Portal & Overview Landing */}
            <Route path="/" element={<HomePage />} />

            {/* 2. Role Selection Portal Hub */}
            <Route path="/portals" element={<PortalSelectPage />} />
            <Route path="/portal-select" element={<PortalSelectPage />} />

            {/* 3. Six Dedicated Role-Specific Portals (Protected by RBAC) */}
            <Route
              path="/portal/public"
              element={
                <ProtectedRoute allowedRoles={['public', 'admin']}>
                  <PublicDashboardPage />
                </ProtectedRoute>
              }
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
                <ProtectedRoute allowedRoles={['officer', 'admin']}>
                  <OfficerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/verification"
              element={
                <ProtectedRoute allowedRoles={['verification', 'admin']}>
                  <VerificationDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/supervisor"
              element={
                <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
                  <SupervisorDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/management"
              element={
                <ProtectedRoute allowedRoles={['management', 'admin']}>
                  <ManagementDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 4. Bureau Monitoring Dashboard (Unified) */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* 5. Central Complaint Registry */}
            <Route path="/registry" element={<RegistryPage />} />
            <Route path="/register" element={<NewComplaintPage />} />
            <Route path="/case/:id" element={<CaseDetailPage />} />

            {/* 6. Institution Profile & History */}
            <Route path="/institutions" element={<InstitutionsPage />} />

            {/* 7. Case Intelligence & Related Case Detection */}
            <Route path="/case-intelligence" element={<RelatedCasesPage />} />
            <Route path="/related-cases" element={<RelatedCasesPage />} />

            {/* 8. Circular Lifecycle & Project Progress */}
            <Route path="/workflow" element={<WorkflowPage />} />

            {/* 9. Deadlines & Operational Alerts */}
            <Route path="/alerts" element={<AlertsPage />} />

            {/* 10. Management Analytics */}
            <Route path="/analytics" element={<AnalyticsPage />} />

            {/* 11. Audit Logs & Compliance Reports */}
            <Route path="/reports" element={<AuditLogsPage />} />
            <Route path="/audit" element={<AuditLogsPage />} />

            {/* 12. Architecture & SIH Specs */}
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
