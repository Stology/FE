import { useEffect, useState } from 'react';
import { LockKeyhole, RotateCcw } from 'lucide-react';

import { getMockWeeklyReport, mockWeeklyReportWeeks } from '@/shared/mocks/weeklyReports';
import type { WeeklyReport } from '@/shared/types/stology';
import { Button, EmptyState, ErrorMessage, Loading } from '@/shared/ui';

import { WeeklyReportRecommendations } from './WeeklyReportRecommendations';
import { WeeklyReportSummary } from './WeeklyReportSummary';
import { WeeklyReportTeamStats } from './WeeklyReportTeamStats';

interface WeeklyReportPageProps {
  availableWeeks?: number[];
  errorMessage?: string | null;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onRetry?: () => void;
  onWeekChange?: (week: number) => void;
  report?: WeeklyReport;
  selectedWeek?: number;
}

export const WeeklyReportPage = ({
  availableWeeks = mockWeeklyReportWeeks,
  errorMessage,
  isLoading = false,
  isReadOnly = false,
  onRetry,
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

  const renderReportContent = () => {
    if (isLoading) {
      return (
        <div aria-live="polite" role="status">
          <Loading className="min-h-48" label="주차별 리포트를 불러오는 중입니다" />
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="flex min-h-48 flex-col items-center justify-center gap-4">
          <div className="w-full max-w-lg" role="alert">
            <ErrorMessage message={errorMessage} title="주차별 리포트를 불러오지 못했습니다" />
          </div>
          {onRetry ? (
            <Button
              leftIcon={<RotateCcw aria-hidden size={15} />}
              onClick={onRetry}
              variant="outline"
            >
              다시 시도
            </Button>
          ) : null}
        </div>
      );
    }

    if (!visibleReport) {
      return (
        <EmptyState
          className="min-h-[180px] w-full max-w-[1040px]"
          description={
            activeWeek === undefined
              ? '완료된 주차의 리포트를 조회할 수 있습니다.'
              : '스터디가 완료되면 이곳에서 리포트를 확인할 수 있습니다.'
          }
          title={
            activeWeek === undefined
              ? '생성된 주차별 리포트가 없습니다.'
              : '이번 주차 스터디가 완료되지 않았습니다.'
          }
        />
      );
    }

    return (
      <article className="w-full max-w-[1534px] bg-white">
        <header className="pb-1 pt-4">
          <p className="text-[11px] font-bold uppercase leading-4 text-stology-electric-blue">
            RPT001 · Weekly Coverage Report
          </p>
          <h1 className="mt-1 text-[26px] font-bold leading-[32px] text-stology-text-dark">
            {visibleReport.week}주차 리포트
          </h1>
          <p className="mt-1 text-[12px] leading-5 text-stology-text-light">
            완료된 주차의 진행 상황, 노드 추천, 팀 활동을 하나의 문서형 리포트로 요약합니다.
          </p>
        </header>

        <WeeklyReportSummary report={visibleReport} />
        <WeeklyReportRecommendations recommendations={visibleReport.recommendations} />
        <WeeklyReportTeamStats activities={visibleReport.teamActivities} />
      </article>
    );
  };

  return (
    <section
      aria-label="주차별 리포트"
      aria-busy={isLoading}
      className="min-h-[520px] bg-white px-4 py-6 sm:px-6 lg:px-10"
    >
      {isReadOnly ? (
        <div
          className="mb-5 flex w-full max-w-[1534px] items-start gap-2.5 border-y border-stology-border-light bg-stology-off-white px-4 py-3 text-stology-text-light"
          role="status"
        >
          <LockKeyhole aria-hidden className="mt-0.5 size-4 shrink-0" />
          <p className="text-[13px] leading-5">
            종료된 스터디입니다. 주차별 리포트를 읽기 전용으로 확인할 수 있습니다.
          </p>
        </div>
      ) : null}

      <div aria-label="주차 선택" className="mb-1 flex flex-wrap gap-3" role="group">
        {availableWeeks.map((week) => {
          const isSelected = week === activeWeek;

          return (
            <button
              aria-pressed={isSelected}
              className={
                isSelected
                  ? 'h-9 min-w-[84px] rounded-full border border-stology-deep-navy bg-stology-deep-navy px-5 text-[13px] font-bold text-white'
                  : 'h-9 min-w-[84px] rounded-full border border-stology-border-light bg-white px-5 text-[13px] font-bold text-stology-text-dark transition hover:border-stology-light-blue hover:bg-stology-off-white'
              }
              disabled={isLoading}
              key={week}
              onClick={() => handleWeekChange(week)}
              type="button"
            >
              {week}주차
            </button>
          );
        })}
      </div>

      {renderReportContent()}
    </section>
  );
};
