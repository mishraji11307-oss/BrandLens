import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppShell } from './components/layout/AppShell';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { BrandKitPage } from './pages/BrandKitPage';
import { ContentReviewPage } from './pages/ContentReviewPage';
import { ReviewWorkspacePage } from './pages/ReviewWorkspacePage';
import { ReviewHistoryPage } from './pages/ReviewHistoryPage';
import { ApprovalCentrePage } from './pages/ApprovalCentrePage';
import { GovernanceInsightsPage } from './pages/GovernanceInsightsPage';
import { VisualCheckerPage } from './pages/VisualCheckerPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-xs font-semibold text-slate-500">
        Loading BrandLens...
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Application Shell */}
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/brand-kit" element={<BrandKitPage />} />
              <Route path="/review" element={<ContentReviewPage />} />
              <Route path="/review/:id" element={<ReviewWorkspacePage />} />
              <Route path="/history" element={<ReviewHistoryPage />} />
              <Route path="/approvals" element={<ApprovalCentrePage />} />
              <Route path="/insights" element={<GovernanceInsightsPage />} />
              <Route path="/visual-checker" element={<VisualCheckerPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
};

export default App;

