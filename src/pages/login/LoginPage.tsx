import { useSearchParams } from 'react-router-dom';
import { InviteNoticeCard } from './components/InviteNoticeCard';
import { KakaoSymbolIcon } from './components/KakaoSymbolIcon';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('redirect_url');
  const inviteToken = searchParams.get('invite') || searchParams.get('token');

  const hasInviteContext = Boolean(inviteToken || redirectUrl?.includes('/invite/'));
  const extractedToken =
    inviteToken || (redirectUrl ? (redirectUrl.match(/\/invite\/([^/?]+)/)?.[1] ?? null) : null);

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = import.meta.env.VITE_KAKAO_AUTH_URL || '#';
    if (kakaoAuthUrl !== '#') {
      window.location.href = kakaoAuthUrl;
    } else {
      console.log('Kakao login initiated', { redirectUrl, inviteToken });
      alert(
        '카카오 로그인 연동 (VITE_KAKAO_AUTH_URL 환경 변수가 설정되면 카카오 OAuth 페이지로 이동합니다.)',
      );
    }
  };

  return (
    <main className="min-h-screen bg-stology-off-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center text-center space-y-8 z-10">
        {/* Brand Header */}
        <div className="space-y-3">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#5B5CF6] tracking-tight font-sans">
            Stology
          </h1>
          <p className="text-lg md:text-xl font-medium text-stology-text-dark">
            당신의 활동이 소중한 자산이 되도록
          </p>
        </div>

        {/* Kakao Social Login CTA */}
        <div className="w-full space-y-3">
          <button
            type="button"
            onClick={handleKakaoLogin}
            className="w-full py-3.5 px-6 bg-[#FEE500] hover:bg-[#FADA0A] active:scale-[0.99] text-[#191919] font-bold text-base rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <KakaoSymbolIcon className="w-5 h-5 text-[#191919]" />
            <span>카카오로 시작하기</span>
          </button>
        </div>

        {/* Invite Link Context Guidance Card (Figma LGN001 Spec Callout 3) */}
        {hasInviteContext ? <InviteNoticeCard token={extractedToken} /> : <InviteNoticeCard />}
      </div>

      <footer className="absolute bottom-6 text-xs text-stology-text-light">
        © {new Date().getFullYear()} Stology. All rights reserved.
      </footer>
    </main>
  );
};
