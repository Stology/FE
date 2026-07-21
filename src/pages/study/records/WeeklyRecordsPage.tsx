import { useEffect, useState } from 'react';

import { getMockWeeklyRecord, mockWeeklyRecordWeeks } from '@/shared/mocks/weeklyRecords';
import type { WeeklyRecordConcept, WeeklyRecordMaterial } from '@/shared/types/stology';
import { EmptyState } from '@/shared/ui';

import { WeeklyRecordItem } from './WeeklyRecordItem';

interface WeeklyRecordsPageProps {
  availableWeeks?: number[];
  concepts?: WeeklyRecordConcept[];
  onMaterialDownload?: (material: WeeklyRecordMaterial) => void;
  onWeekChange?: (week: number) => void;
  selectedWeek?: number;
}

export const WeeklyRecordsPage = ({
  availableWeeks = mockWeeklyRecordWeeks,
  concepts,
  onMaterialDownload,
  onWeekChange,
  selectedWeek,
}: WeeklyRecordsPageProps) => {
  const [internalWeek, setInternalWeek] = useState(() => selectedWeek ?? availableWeeks[0]);
  const [openConceptIds, setOpenConceptIds] = useState<string[]>([]);
  const activeWeek =
    selectedWeek ??
    (internalWeek !== undefined && availableWeeks.includes(internalWeek)
      ? internalWeek
      : availableWeeks[0]);
  const visibleConcepts =
    concepts ?? (activeWeek === undefined ? [] : (getMockWeeklyRecord(activeWeek)?.concepts ?? []));

  useEffect(() => {
    setOpenConceptIds([]);
  }, [activeWeek]);

  useEffect(() => {
    if (selectedWeek !== undefined) return;

    setInternalWeek((currentWeek) =>
      currentWeek !== undefined && availableWeeks.includes(currentWeek)
        ? currentWeek
        : availableWeeks[0],
    );
  }, [availableWeeks, selectedWeek]);

  const handleWeekChange = (week: number) => {
    if (selectedWeek === undefined) setInternalWeek(week);
    onWeekChange?.(week);
  };

  const handleConceptToggle = (conceptId: string) => {
    setOpenConceptIds((current) =>
      current.includes(conceptId)
        ? current.filter((openId) => openId !== conceptId)
        : [...current, conceptId],
    );
  };

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
                key={week}
                onClick={() => handleWeekChange(week)}
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
              <WeeklyRecordItem
                concept={concept}
                isOpen={openConceptIds.includes(concept.id)}
                key={concept.id}
                onDownload={onMaterialDownload}
                onToggle={() => handleConceptToggle(concept.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState className="min-h-40" title="이 주차에 활성화된 노드가 없습니다" />
        )}
      </div>
    </section>
  );
};
