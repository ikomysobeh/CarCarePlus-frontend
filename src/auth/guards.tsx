import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Flex, Spinner } from '@chakra-ui/react';
import { useAuth } from './AuthContext';
import type { Role } from '../api/types';

function FullscreenLoader() {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="appBg">
      <Spinner size="xl" color="brand.500" borderWidth="4px" />
    </Flex>
  );
}

// Requires a logged-in user.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullscreenLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

// Requires the user's role to be in the allowed list.
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullscreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
