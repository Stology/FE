import { useNavigate, useParams } from 'react-router-dom';

import { ErrorMessage, Loading, Toast } from '@/shared/ui';

import { useInvite } from './hooks';

export const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const { error, isJoining, isLoading, joinError, joinStudy, study } = useInvite(token);

  const handleJoin = async () => {
    if (!study) return;
    const success = await joinStudy();
    if (success) {
      // 3. 참여하기 클릭 시 스터디 멤버로 추가하고 STD001 지식 구조 탭으로 이동한다.
      navigate(`/studies/${study.id}/knowledge`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white font-sans">
        <Loading label="초대 정보를 확인하고 있습니다..." size="lg" />
      </div>
    );
  }

  if (error || !study || study.status === 'ended') {
    const isEnded = study?.status === 'ended';
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white font-sans">
        <div className="flex w-[530px] flex-col items-center">
          <div className="w-full">
            <ErrorMessage
              message={
                error?.message || (isEnded ? '이미 종료된 스터디 초대입니다' : '잘못된 접근입니다.')
              }
              title="초대 정보를 확인할 수 없습니다"
            />
          </div>
          {isEnded && (
            <button
              className="mt-8 flex h-[38px] w-[260px] items-center justify-center rounded-[5px] border border-[#d9c000] bg-[#fee500] text-[13px] font-bold text-[#111] transition-colors hover:bg-[#f2d900]"
              onClick={() => navigate('/')}
              type="button"
            >
              홈으로 돌아가기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-white font-sans">
      {joinError && (
        <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2">
          <Toast
            message={joinError.message || '스터디 참여에 실패했습니다. 다시 시도해 주세요.'}
            type="error"
          />
        </div>
      )}

      <div className="flex flex-col items-center">
        {/* Logo */}
        <h1 className="text-[56px] font-bold leading-[81px] text-[#5b5cf6]">Stology</h1>

        {/* Title */}
        <h2 className="mt-2 text-[22px] font-medium leading-[32px] text-[#111]">
          스터디 초대가 도착했습니다
        </h2>

        {/* Invite Card */}
        <div className="mt-8 flex w-[530px] flex-col justify-center rounded-[10px] border border-[#e4c75c] bg-[#fff7d6] p-7 text-left">
          <h3 className="text-[17px] font-bold leading-[25px] text-[#111]">{study.name}</h3>
          <div className="mt-4 flex flex-col gap-1 text-[14px] font-medium leading-[22px] text-[#111]">
            <p>스터디장: 김소토</p>
            <p>현재 멤버: {study.memberCount}명</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          className="mt-8 flex h-[38px] w-[260px] items-center justify-center rounded-[5px] border border-[#d9c000] bg-[#fee500] text-[13px] font-bold text-[#111] transition-colors hover:bg-[#f2d900] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isJoining}
          onClick={handleJoin}
          type="button"
        >
          {isJoining ? '참여하는 중...' : '참여하기'}
        </button>
      </div>
    </div>
  );
};
