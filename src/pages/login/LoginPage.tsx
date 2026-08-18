import { useNavigate, useSearchParams } from 'react-router-dom';

import stologyIcon from '@/shared/assets/stology-icon.png';
import { getSafeRedirectPath, savePendingAuthRedirect } from '@/shared/lib/auth_redirect';
import { useAuthStore } from '@/shared/stores/useAuthStore';

import { KakaoSymbolIcon } from './components/KakaoSymbolIcon';

const TEST_TOKEN =
  'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI0OTc2OTIyODY0Iiwicm9sZSI6IiIsInNvY2lhbF90eXBlIjoiS0FLQU8iLCJpYXQiOjE3ODY4NjcyNjksImV4cCI6MTc4OTQ1OTI2OX0.lpb3y5GOJ6cPS3lA_m6alUw-krngmedKm2KloYAtAjEU2mfQw37f5BNsJmR2Ei9K';

const TEST_AUTH_URL = import.meta.env.VITE_TEST_AUTH_URL;

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const redirectUrl = searchParams.get('redirect') || searchParams.get('redirect_url');

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = import.meta.env.VITE_KAKAO_AUTH_URL || '#';

    if (kakaoAuthUrl !== '#') {
      savePendingAuthRedirect(redirectUrl);
      window.location.href = kakaoAuthUrl;
      return;
    }

    if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
      login();
      navigate(getSafeRedirectPath(redirectUrl), { replace: true });
      return;
    }

    alert(
      '카카오 로그인 연동 (VITE_KAKAO_AUTH_URL 환경 변수가 설정되면 카카오 OAuth 페이지로 이동합니다.)',
    );
  };

  const handleTestLogin = () => {
    if (TEST_AUTH_URL) {
      const redirect = getSafeRedirectPath(redirectUrl);
      window.location.href = `${TEST_AUTH_URL}${encodeURIComponent(redirect)}`;
      return;
    }

    // VITE_TEST_AUTH_URL 미설정 시 로컬 토큰 fallback
    login(TEST_TOKEN);
    navigate(getSafeRedirectPath(redirectUrl), { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-stology-off-white p-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex flex-col items-center gap-2.5 pb-8">
          <img alt="" className="size-14" height="56" src={stologyIcon} width="56" />
          <h1 className="text-[36px] font-bold leading-[54px] text-stology-deep-navy">
            <span>St</span>
            <span className="text-stology-electric-blue">o</span>
            <span>logy</span>
          </h1>
        </div>

        <p className="pb-8 text-base font-medium leading-6 text-stology-text-dark">
          당신의 활동이 소중한 자산이 되도록
        </p>

        <button
          type="button"
          onClick={handleKakaoLogin}
          className="flex min-w-48 cursor-pointer items-center justify-center gap-2 rounded-[4.5px] bg-[#FEE500] px-6 py-3 text-sm font-semibold text-[#191919] transition-colors hover:bg-[#FADA0A]"
        >
          <KakaoSymbolIcon className="size-4 text-[#191919]" />
          <span>카카오로 시작하기</span>
        </button>

        {/* 테스트 로그인 */}
        <button
          type="button"
          onClick={handleTestLogin}
          className="mt-4 text-xs font-medium text-stology-text-light underline transition-colors hover:text-stology-text-dark"
        >
          테스트 계정으로 시작하기
        </button>
      </div>
    </main>
  );
};
