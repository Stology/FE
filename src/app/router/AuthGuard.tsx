import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/shared/stores/useAuthStore';
import { Loading } from '@/shared/ui';

export const AuthGuard = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const location = useLocation();

  if (!isInitialized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stology-off-white">
        <Loading label="인증 상태를 확인하는 중입니다." size="lg" />
      </main>
    );
  }

  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate replace to={`/login?redirect=${redirectUrl}`} />;
  }

  return <Outlet />;
};
