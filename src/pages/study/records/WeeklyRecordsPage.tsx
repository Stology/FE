import { getMockWeeklyRecord, mockWeeklyRecordWeeks } from '@/shared/mocks/weeklyRecords';
import type { WeeklyRecordConcept } from '@/shared/types/stology';

import { WeeklyRecordItem } from './WeeklyRecordItem';

interface WeeklyRecordsPageProps {
  availableWeeks?: number[];
  concepts?: WeeklyRecordConcept[];
  onWeekChange?: (week: number) => void;
  selectedWeek?: number;
}

const DEFAULT_WEEK = 3;

export const WeeklyRecordsPage = ({
  availableWeeks = mockWeeklyRecordWeeks,
  concepts,
  onWeekChange,
  selectedWeek = DEFAULT_WEEK,
}: WeeklyRecordsPageProps) => {
  const visibleConcepts = concepts ?? getMockWeeklyRecord(selectedWeek)?.concepts ?? [];

  return (
    <section
      aria-label="주차별 기록"
      className="min-h-[520px] rounded-b-lg border border-stology-border-light bg-white px-10 pb-10 pt-10"
    >
      <div className="w-full max-w-[1120px]">
        <div aria-label="주차 선택" className="mb-6 flex flex-wrap gap-2">
          {availableWeeks.map((week) => {
            const isSelected = week === selectedWeek;

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

        <div className="border-t border-stology-border-light">
          {visibleConcepts.map((concept) => (
            <WeeklyRecordItem concept={concept} key={concept.id} />
          ))}
        </div>
      </div>
    </section>
  );
};
