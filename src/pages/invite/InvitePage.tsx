import { useNavigate, useParams } from 'react-router-dom';

import { getMockStudyById } from '@/shared/mocks/studies';

export const InvitePage = () => {
  useParams<{ token: string }>();
  const navigate = useNavigate();

  // 초대 토큰에 해당하는 스터디 정보를 가져오는 mock 로직 (Figma 시안 기준 데이터 사용)
  const study = getMockStudyById('spring-study');

  const handleJoin = () => {
    // 3. 참여하기 클릭 시 스터디 멤버로 추가하고 STD001 지식 구조 탭으로 이동한다.
    navigate('/studies/spring-study/knowledge');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white font-sans">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <h1 className="text-[56px] font-bold leading-[81px] text-[#5b5cf6]">Stology</h1>

        {/* Title */}
        <h2 className="mt-2 text-[22px] font-medium leading-[32px] text-[#111]">
          스터디 초대가 도착했습니다
        </h2>

        {/* Invite Card */}
        <div className="mt-8 flex w-[530px] flex-col justify-center rounded-[10px] border border-[#e4c75c] bg-[#fff7d6] p-7 text-left">
          <h3 className="text-[17px] font-bold leading-[25px] text-[#111]">
            {study?.name || '백엔드 마스터'}
          </h3>
          <div className="mt-4 flex flex-col gap-1 text-[14px] font-medium leading-[22px] text-[#111]">
            <p>스터디장: 김스토</p>
            <p>현재 멤버: {study?.memberCount || 5}명</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleJoin}
          className="mt-8 flex h-[38px] w-[260px] items-center justify-center rounded-[5px] border border-[#d9c000] bg-[#fee500] text-[13px] font-bold text-[#111] transition-colors hover:bg-[#f2d900]"
        >
          참여하기
        </button>
      </div>
    </div>
  );
};
