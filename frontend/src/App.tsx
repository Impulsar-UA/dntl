import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import NotFoundPage from '@/pages/NotFoundPage';
// Organization Representative panel
import OrgRepDashboard from '@/pages/orgrep/OrgRepDashboard';
import MyInitiativesPage from '@/pages/orgrep/MyInitiativesPage';
import InitiativeDetailPage from '@/pages/orgrep/InitiativeDetailPage';
// Administrator panel
import AdminDashboard from '@/pages/admin/AdminDashboard';
import InitiativeModerationPage from '@/pages/admin/InitiativeModerationPage';
import PetitionModerationPage from '@/pages/admin/PetitionModerationPage';

export default function App() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Public auth routes — redirect to dashboard if already signed in. */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      {/* Protected management area — distinct route trees per role. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {isAdmin ? (
            <>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/moderation" element={<InitiativeModerationPage />} />
              <Route path="/petitions" element={<PetitionModerationPage />} />
            </>
          ) : (
            <>
              <Route path="/" element={<OrgRepDashboard />} />
              <Route path="/initiatives" element={<MyInitiativesPage />} />
              <Route path="/initiatives/:id" element={<InitiativeDetailPage />} />
            </>
          )}
          {/* Any unknown in-app path returns to the role's home. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
