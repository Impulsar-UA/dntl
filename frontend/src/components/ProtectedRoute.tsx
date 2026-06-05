import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Guards the management area. Only authenticated staff accounts
 * (Admin / OrganizationRep) may access the web panel.
 */
export function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Donor accounts are mobile-only; deny access to the web panel.
  if (user?.userType === 'Donor') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
