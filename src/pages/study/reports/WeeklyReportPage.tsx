import { useEffect, useState } from 'react';

import { getMockWeeklyReport, mockWeeklyReportWeeks } from '@/shared/mocks/weeklyReports';
import type { WeeklyReport } from '@/shared/types/stology';
import { EmptyState } from '@/shared/ui';

import { WeeklyReportRecommendations } from './WeeklyReportRecommendations';
import { WeeklyReportSummary } from './WeeklyReportSummary';
import { WeeklyReportTeamStats } from './WeeklyReportTeamStats';

interface WeeklyReportPageProps {
  availableWeeks?: number[];
  onWeekChange?: (week: number) => void;
  report?: WeeklyReport;
  selectedWeek?: number;
}

export const WeeklyReportPage = ({
  availableWeeks = mockWeeklyReportWeeks,
  onWeekChange,
  report,
  selectedWeek,
}: WeeklyReportPageProps) => {
  const lastAvailableWeek = availableWeeks[availableWeeks.length - 1];
  const [internalWeek, setInternalWeek] = useState(() => selectedWeek ?? lastAvailableWeek);
  const activeWeek =
    selectedWeek !== undefined
      ? availableWeeks.includes(selectedWeek)
        ? selectedWeek
        : lastAvailableWeek
      : internalWeek !== undefined && availableWeeks.includes(internalWeek)
        ? internalWeek
        : lastAvailableWeek;
  const visibleReport =
    report?.week === activeWeek
      ? report
      : activeWeek === undefined
        ? undefined
        : getMockWeeklyReport(activeWeek);

  useEffect(() => {
    if (selectedWeek !== undefined) return;

    setInternalWeek((currentWeek) =>
      currentWeek !== undefined && availableWeeks.includes(currentWeek)
        ? currentWeek
        : lastAvailableWeek,
    );
  }, [availableWeeks, lastAvailableWeek, selectedWeek]);

  const handleWeekChange = (week: number) => {
    if (selectedWeek === undefined) setInternalWeek(week);
    onWeekChange?.(week);
  };

  return (
    <section
      aria-label="주차별 리포트"
      className="min-h-[520px] bg-white px-4 py-6 sm:px-6 lg:px-10"
    >
      <div aria-label="주차 선택" className="mb-5 flex flex-wrap gap-3" role="group">
        {availableWeeks.map((week) => {
          const isSelected = week === activeWeek;

          return (
            <button
              aria-pressed={isSelected}
              className={
                isSelected
                  ? 'h-9 min-w-[84px] rounded-full border border-[#1f1f1f] bg-[#1f1f1f] px-5 text-[13px] font-bold text-white'
                  : 'h-9 min-w-[84px] rounded-full border border-[#d1d1d1] bg-white px-5 text-[13px] font-bold text-[#141414]'
              }
              key={week}
              onClick={() => handleWeekChange(week)}
              type="button"
            >
              {week}주차
            </button>
          );
        })}
      </div>

      {visibleReport ? (
        <article className="w-full max-w-[1040px] overflow-hidden rounded-lg border border-[#d1d1d1] bg-white">
          <header className="border-b border-[#d1d1d1] px-5 py-5 sm:px-7">
            <p className="text-[11px] font-bold uppercase leading-4 text-[#141414]">
              RPT001 · Weekly Coverage Report
            </p>
            <h1 className="mt-1 text-[26px] font-bold leading-[32px] text-[#141414]">
              {visibleReport.week}주차 리포트
            </h1>
            <p className="mt-1 text-[12px] leading-5 text-[#6d6d6d]">
              완료된 주차의 진행 상황, 노드 추천, 팀 활동을 하나의 문서형 리포트로 요약합니다.
            </p>
          </header>

          <WeeklyReportSummary report={visibleReport} />
          <WeeklyReportRecommendations recommendations={visibleReport.recommendations} />
          <WeeklyReportTeamStats activities={visibleReport.teamActivities} />
        </article>
      ) : (
        <EmptyState
          className="w-full max-w-[1040px]"
          description="주차가 완료되면 리포트가 생성됩니다."
          title={
            activeWeek === undefined
              ? '생성된 주차별 리포트가 없습니다.'
              : `${activeWeek}주차 리포트가 아직 없습니다.`
          }
        />
      )}
    </section>
  );
};
