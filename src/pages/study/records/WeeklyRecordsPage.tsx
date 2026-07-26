import { useEffect, useState } from 'react';
import { LockKeyhole, RotateCcw } from 'lucide-react';

import { getMockWeeklyRecord, mockWeeklyRecordWeeks } from '@/shared/mocks/weeklyRecords';
import type { WeeklyRecordConcept, WeeklyRecordMaterial } from '@/shared/types/stology';
import { Button, EmptyState, ErrorMessage, Loading } from '@/shared/ui';

import { WeeklyRecordItem } from './WeeklyRecordItem';

interface WeeklyRecordsPageProps {
  availableWeeks?: number[];
  concepts?: WeeklyRecordConcept[];
  errorMessage?: string | null;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onMaterialDownload?: (material: WeeklyRecordMaterial) => void;
  onRetry?: () => void;
  onWeekChange?: (week: number) => void;
  selectedWeek?: number;
}

export const WeeklyRecordsPage = ({
  availableWeeks = mockWeeklyRecordWeeks,
  concepts,
  errorMessage,
  isLoading = false,
  isReadOnly = false,
  onMaterialDownload,
  onRetry,
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

  const renderRecordContent = () => {
    if (isLoading) {
      return (
        <div aria-live="polite" role="status">
          <Loading className="min-h-40" label="주차별 기록을 불러오는 중입니다" />
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="flex min-h-40 flex-col items-center justify-center gap-4">
          <div className="w-full max-w-lg" role="alert">
            <ErrorMessage message={errorMessage} title="주차별 기록을 불러오지 못했습니다" />
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

    if (visibleConcepts.length === 0) {
      return (
        <EmptyState
          className="min-h-40"
          title={
            activeWeek === undefined
              ? '아직 생성된 주차별 기록이 없습니다'
              : '이 주차에 활성화된 노드가 없습니다'
          }
        />
      );
    }

    return (
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
    );
  };

  return (
    <section
      aria-label="주차별 기록"
      aria-busy={isLoading}
      className="min-h-[520px] rounded-b-lg border border-stology-border-light bg-white px-4 py-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10"
    >
      <div className="w-full max-w-[1120px]">
        {isReadOnly ? (
          <div
            className="mb-5 flex items-start gap-2.5 border-y border-stology-border-light bg-stology-off-white px-4 py-3 text-stology-text-light"
            role="status"
          >
            <LockKeyhole aria-hidden className="mt-0.5 size-4 shrink-0" />
            <p className="text-[13px] leading-5">
              종료된 스터디입니다. 주차별 기록을 읽기 전용으로 확인할 수 있습니다.
            </p>
          </div>
        ) : null}

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

        {renderRecordContent()}
      </div>
    </section>
  );
};
