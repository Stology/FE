import { Info } from 'lucide-react';

interface InviteNoticeCardProps {
  token?: string | null;
}

export const InviteNoticeCard = ({ token }: InviteNoticeCardProps) => {
  return (
    <div className="w-full bg-[#FFF7D6] border border-[#E4C75C] rounded-xl p-4 text-left shadow-sm transition-all">
      <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0" />
        <span>초대 링크 진입 안내</span>
      </div>
      <p className="text-xs text-amber-800 leading-relaxed">
        {token ? (
          <>
            초대 코드(
            <code className="font-mono bg-amber-200/60 px-1 py-0.5 rounded text-amber-900 font-semibold">
              {token}
            </code>
            )로 접근하셨습니다. 카카오 인증 성공 후 초대 수락 화면(INV001)으로 이동합니다.
          </>
        ) : (
          <>
            <code className="font-mono bg-amber-200/60 px-1 py-0.5 rounded text-amber-900 font-semibold">
              /invite/{'{token}'}
            </code>{' '}
            컨텍스트가 있으면 카카오 인증 성공 후 초대 수락 화면 INV001로 이동합니다. 수락 전 자동
            참여하지 않습니다.
          </>
        )}
      </p>
    </div>
  );
};
