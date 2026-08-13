import type { WeeklyReportMemberActivity } from '@/shared/types/stology';
import { Avatar, EmptyState } from '@/shared/ui';

interface WeeklyReportTeamStatsProps {
  activities: WeeklyReportMemberActivity[];
}

export const WeeklyReportTeamStats = ({ activities }: WeeklyReportTeamStatsProps) => {
  const maxActivityCount = Math.max(
    1,
    ...activities.map(({ questionCount, uploadCount }) => questionCount + uploadCount),
  );

  return (
    <section aria-labelledby="weekly-report-team-title" className="pb-0 pt-7">
      <h2
        className="text-[17px] font-bold leading-[22px] text-stology-text-dark"
        id="weekly-report-team-title"
      >
        3. 팀 통계
      </h2>
      <p className="mt-1 text-[11px] leading-4 text-stology-text-light">
        자료 업로드와 질문 작성 수를 누적 막대로 표시합니다.
      </p>

      {activities.length === 0 ? (
        <EmptyState
          className="mt-4 min-h-[180px]"
          description="자료 업로드나 질문 작성 내역이 쌓이면 이곳에 표시됩니다."
          title="집계할 팀 활동이 없습니다."
        />
      ) : (
        <>
          <div className="mt-4 grid gap-2">
            {activities.map((activity) => {
              const uploadWidth = (activity.uploadCount / maxActivityCount) * 100;
              const questionWidth = (activity.questionCount / maxActivityCount) * 100;

              return (
                <div
                  className="grid grid-cols-[72px_1fr_52px] items-center gap-3"
                  key={activity.memberId}
                >
                  <span className="truncate text-[12px] font-bold text-stology-text-dark">
                    {activity.memberName}
                  </span>
                  <div
                    aria-label={`${activity.memberName}: 자료 업로드 ${activity.uploadCount}건, 질문 작성 ${activity.questionCount}건`}
                    className="flex h-3.5 overflow-hidden rounded-full bg-stology-off-white"
                    role="img"
                  >
                    <span
                      className="h-full bg-stology-electric-blue"
                      style={{ width: `${uploadWidth}%` }}
                    />
                    <span
                      className="h-full bg-stology-light-blue"
                      style={{ width: `${questionWidth}%` }}
                    />
                  </div>
                  <span className="text-right text-[12px] font-semibold text-stology-text-light">
                    {activity.uploadCount} + {activity.questionCount}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            aria-label="통계 범례"
            className="mt-3 flex gap-5 text-[11px] text-stology-text-light"
          >
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="size-2 rounded-full bg-stology-electric-blue" />
              자료 업로드
            </span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="size-2 rounded-full bg-stology-light-blue" />
              질문 작성
            </span>
          </div>

          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {activities.map((activity) => (
              <li
                className="min-h-16 rounded-[5.5px] border border-stology-border-light bg-white px-4 py-3"
                key={activity.memberId}
              >
                <div className="flex items-center gap-2">
                  <Avatar
                    className="size-[30px] text-[11px]"
                    name={activity.memberName}
                    size="sm"
                  />
                  <strong className="text-[13px] leading-5 text-stology-text-dark">
                    {activity.memberName}
                  </strong>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-stology-text-light">
                  {activity.comment}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};
