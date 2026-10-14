import { Navigate, Outlet } from 'react-router';

import { useAppSelector } from '../../store/hooks';

export function ProtectedRoute() {
  const { session, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Navigate to='/login' replace />;
  }

  return <Outlet />;
}
