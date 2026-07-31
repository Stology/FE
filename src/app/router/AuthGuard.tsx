import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/shared/stores/useAuthStore';

export const AuthGuard = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // 보호된 페이지 접근 시, 기존 목적지(pathname + search)를 기억하여 로그인 페이지로 이동
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate replace to={`/login?redirect=${redirectUrl}`} />;
  }

  // 인증 성공 시 자식 라우트 렌더링
  return <Outlet />;
};
