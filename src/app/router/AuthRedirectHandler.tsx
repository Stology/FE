import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { consumePendingAuthRedirect } from '@/shared/lib/auth_redirect';
import { useAuthStore } from '@/shared/stores/useAuthStore';

export const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || location.pathname !== '/') {
      return;
    }

    const redirectPath = consumePendingAuthRedirect();

    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isInitialized, location.pathname, navigate]);

  return <Outlet />;
};
