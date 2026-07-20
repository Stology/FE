import { getMockWeeklyRecord, mockWeeklyRecordWeeks } from '@/shared/mocks/weeklyRecords';
import type { WeeklyRecordConcept } from '@/shared/types/stology';
import { EmptyState } from '@/shared/ui';

import { WeeklyRecordItem } from './WeeklyRecordItem';

interface WeeklyRecordsPageProps {
  availableWeeks?: number[];
  concepts?: WeeklyRecordConcept[];
  onWeekChange?: (week: number) => void;
  selectedWeek?: number;
}

export const WeeklyRecordsPage = ({
  availableWeeks = mockWeeklyRecordWeeks,
  concepts,
  onWeekChange,
  selectedWeek,
}: WeeklyRecordsPageProps) => {
  const activeWeek = selectedWeek ?? availableWeeks[0];
  const visibleConcepts =
    concepts ?? (activeWeek === undefined ? [] : (getMockWeeklyRecord(activeWeek)?.concepts ?? []));

  return (
    <section
      aria-label="주차별 기록"
      className="min-h-[520px] rounded-b-lg border border-stology-border-light bg-white px-10 pb-10 pt-10"
    >
      <div className="w-full max-w-[1120px]">
        <div aria-label="주차 선택" className="mb-6 flex flex-wrap gap-2" role="group">
          {availableWeeks.map((week) => {
            const isSelected = week === activeWeek;

            return (
              <button
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? 'h-[39px] rounded-[14.5px] border border-stology-deep-navy bg-stology-deep-navy px-[21px] text-[13px] font-semibold leading-[19.5px] text-white'
                    : 'h-[39px] rounded-[14.5px] border border-stology-border-light bg-white px-[21px] text-[13px] font-semibold leading-[19.5px] text-stology-text-dark'
                }
                disabled={!onWeekChange}
                key={week}
                onClick={() => onWeekChange?.(week)}
                type="button"
              >
                {week}주차
              </button>
            );
          })}
        </div>

        {visibleConcepts.length > 0 ? (
          <div className="border-t border-stology-border-light">
            {visibleConcepts.map((concept) => (
              <WeeklyRecordItem concept={concept} key={concept.id} />
            ))}
          </div>
        ) : (
          <EmptyState className="min-h-40" title="이 주차에 활성화된 노드가 없습니다" />
        )}
      </div>
    </section>
  );
};
