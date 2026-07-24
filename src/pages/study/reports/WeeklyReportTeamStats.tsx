import type { WeeklyReportMemberActivity } from '@/shared/types/stology';
import { Avatar } from '@/shared/ui';

interface WeeklyReportTeamStatsProps {
  activities: WeeklyReportMemberActivity[];
}

export const WeeklyReportTeamStats = ({ activities }: WeeklyReportTeamStatsProps) => {
  const maxActivityCount = Math.max(
    1,
    ...activities.map(({ questionCount, uploadCount }) => questionCount + uploadCount),
  );

  return (
    <section
      aria-labelledby="weekly-report-team-title"
      className="border-t border-[#d1d1d1] px-5 py-5 sm:px-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          className="text-[17px] font-bold leading-[22px] text-[#141414]"
          id="weekly-report-team-title"
        >
          3. 팀 통계
        </h2>
        <span className="rounded-full bg-[#eeeeee] px-3 py-1 text-[10px] font-bold text-[#333333]">
          단순 카운트 MVP
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-4 text-[#6d6d6d]">
        자료 업로드와 질문 작성 수를 누적 막대로 표시합니다.
      </p>

      <div className="mt-4 grid gap-2">
        {activities.map((activity) => {
          const uploadWidth = (activity.uploadCount / maxActivityCount) * 100;
          const questionWidth = (activity.questionCount / maxActivityCount) * 100;

          return (
            <div
              className="grid grid-cols-[72px_1fr_52px] items-center gap-3"
              key={activity.memberId}
            >
              <span className="truncate text-[12px] font-bold text-[#1a1a1a]">
                {activity.memberName}
              </span>
              <div
                aria-label={`${activity.memberName}: 자료 업로드 ${activity.uploadCount}건, 질문 작성 ${activity.questionCount}건`}
                className="flex h-2.5 overflow-hidden rounded-full bg-[#e5e5e5]"
                role="img"
              >
                <span className="h-full bg-[#2a2a2a]" style={{ width: `${uploadWidth}%` }} />
                <span className="h-full bg-[#8a8a8a]" style={{ width: `${questionWidth}%` }} />
              </div>
              <span className="text-right text-[12px] font-semibold text-[#555555]">
                {activity.uploadCount} + {activity.questionCount}
              </span>
            </div>
          );
        })}
      </div>

      <div aria-label="통계 범례" className="mt-4 flex gap-5 text-[11px] text-[#666666]">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2 rounded-full bg-[#2a2a2a]" />
          자료 업로드
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2 rounded-full bg-[#8a8a8a]" />
          질문 작성
        </span>
      </div>

      <ul className="mt-4 grid gap-2 md:grid-cols-2">
        {activities.map((activity) => (
          <li
            className="rounded-lg border border-[#d1d1d1] bg-[#fafafa] px-3 py-2"
            key={activity.memberId}
          >
            <div className="flex items-center gap-2">
              <Avatar
                className="size-[18px] bg-[#555555] text-[9px] text-white"
                name={activity.memberName}
                size="sm"
              />
              <strong className="text-[11px] leading-4 text-[#222222]">
                {activity.memberName}
              </strong>
            </div>
            <p className="mt-1 text-[10px] leading-4 text-[#555555]">{activity.comment}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};
