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
import UserManagementPage from '@/pages/admin/UserManagementPage';
// Donor panel
import DonorDashboard from '@/pages/donor/DonorDashboard';
import BrowseInitiativesPage from '@/pages/donor/BrowseInitiativesPage';
import DonationHistoryPage from '@/pages/donor/DonationHistoryPage';
import DonorPetitionsPage from '@/pages/donor/DonorPetitionsPage';
import AiAssistantPage from '@/pages/donor/AiAssistantPage';

export default function App() {
  const { isAuthenticated, isAdmin, isDonor } = useAuth();

  return (
    <Routes>
      {/* Public auth routes — redirect home if already signed in. */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      {/* Protected area — distinct route trees per role. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {isAdmin ? (
            <>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/moderation" element={<InitiativeModerationPage />} />
              <Route path="/petitions" element={<PetitionModerationPage />} />
              <Route path="/users" element={<UserManagementPage />} />
            </>
          ) : isDonor ? (
            <>
              <Route path="/" element={<DonorDashboard />} />
              <Route path="/initiatives" element={<BrowseInitiativesPage />} />
              <Route path="/assistant" element={<AiAssistantPage />} />
              <Route path="/petitions" element={<DonorPetitionsPage />} />
              <Route path="/history" element={<DonationHistoryPage />} />
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
