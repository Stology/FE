import { ChevronRight } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import type { WeeklyRecordConcept, WeeklyRecordMaterial } from '@/shared/types/stology';
import { Button } from '@/shared/ui';

import { useWeeklyRecordMaterials } from './hooks/useWeeklyRecordMaterials';

interface WeeklyRecordItemProps {
  concept: WeeklyRecordConcept;
  isOpen: boolean;
  onDownload?: (material: WeeklyRecordMaterial) => void;
  onToggle: () => void;
  studyId?: string;
}

const statusLabel = {
  newly_activated: '신규 활성',
  reinforced: '보강',
} as const;

const SAFE_DOWNLOAD_PROTOCOLS = new Set(['http:', 'https:', 'blob:']);
const SAFE_DATA_URL_PATTERN = /^data:(text\/(?:markdown|plain)|application\/octet-stream)[;,]/i;
const INVALID_FILE_NAME_CHARACTERS = new Set(['<', '>', ':', '"', '/', '\\', '|', '?', '*']);

const getSafeDownloadUrl = (downloadUrl: string) => {
  if (SAFE_DATA_URL_PATTERN.test(downloadUrl)) return downloadUrl;

  try {
    const url = new URL(downloadUrl, window.location.origin);
    return SAFE_DOWNLOAD_PROTOCOLS.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

const getSafeFileName = (title: string) => {
  const normalizedTitle = Array.from(title.trim(), (character) =>
    character.charCodeAt(0) <= 31 || INVALID_FILE_NAME_CHARACTERS.has(character) ? '_' : character,
  )
    .join('')
    .replace(/[. ]+$/g, '')
    .slice(0, 100);

  return `${normalizedTitle || 'material'}.md`;
};

const downloadMaterial = (material: WeeklyRecordMaterial) => {
  if (!material.downloadUrl) return;

  const safeDownloadUrl = getSafeDownloadUrl(material.downloadUrl);
  if (!safeDownloadUrl) return;

  const link = document.createElement('a');
  link.href = safeDownloadUrl;
  link.download = getSafeFileName(material.title);
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const WeeklyRecordItem = ({
  concept,
  isOpen,
  onDownload,
  onToggle,
  studyId,
}: WeeklyRecordItemProps) => {
  const panelId = `weekly-record-${concept.id}-panel`;
  const triggerId = `weekly-record-${concept.id}-trigger`;
  const materialsQuery = useWeeklyRecordMaterials(studyId, concept.id, isOpen);
  const materials = studyId ? (materialsQuery.data ?? []) : concept.materials;

  const handleDownload = (material: WeeklyRecordMaterial) => {
    if (onDownload) {
      onDownload(material);
      return;
    }

    downloadMaterial(material);
  };

  return (
    <section className="border-b border-stology-border-light">
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="flex min-h-[55px] w-full items-center gap-2.5 px-1 py-4 text-left transition hover:bg-stology-off-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-stology-electric-blue"
        id={triggerId}
        onClick={onToggle}
        type="button"
      >
        <ChevronRight
          aria-hidden
          className={cn(
            'size-3.5 shrink-0 text-stology-text-light transition-transform',
            isOpen && 'rotate-90',
          )}
        />
        <span className="text-[15px] font-semibold leading-[22.5px] text-stology-text-dark">
          {concept.name}
        </span>
        <span
          className={cn(
            'pl-1 text-xs font-semibold leading-[18px]',
            concept.status === 'newly_activated'
              ? 'text-stology-electric-blue'
              : 'text-stology-text-light',
          )}
        >
          {statusLabel[concept.status]}
        </span>
      </button>

      {isOpen ? (
        <div
          aria-labelledby={triggerId}
          className="space-y-2 pb-6 pl-4 pr-1 sm:pl-7"
          id={panelId}
          role="region"
        >
          {materialsQuery.isLoading ? (
            <p className="py-5 text-center text-[13px] text-stology-text-light" role="status">
              연결 자료를 불러오는 중입니다.
            </p>
          ) : materialsQuery.error ? (
            <div className="flex flex-col items-center gap-3 py-4" role="alert">
              <p className="text-[13px] text-red-600">연결 자료를 불러오지 못했습니다.</p>
              <Button onClick={() => materialsQuery.refetch()} size="sm" variant="outline">
                다시 시도
              </Button>
            </div>
          ) : materials.length > 0 ? (
            materials.map((material) => (
              <div
                className="flex min-h-[62px] flex-col items-stretch justify-between gap-3 rounded-[5.5px] border border-stology-border-light bg-stology-off-white px-4 py-[15px] sm:flex-row sm:items-center sm:gap-4"
                key={material.id}
              >
                <p className="min-w-0 break-words text-[13px] leading-[19.5px]">
                  <span className="font-semibold text-stology-text-dark">{material.title}</span>
                  <span className="font-normal text-stology-text-light">
                    {' '}
                    · 업로드자 {material.uploaderName} · {material.uploadedAt}
                  </span>
                </p>
                <div className="flex shrink-0 items-center justify-end gap-2.5">
                  <Button
                    className="h-8 px-[15px] text-xs text-stology-text-dark"
                    disabled={!onDownload && !material.downloadUrl}
                    onClick={() => handleDownload(material)}
                    size="sm"
                    variant="outline"
                  >
                    다운로드
                  </Button>
                  <span className="text-[11px] leading-[16.5px] text-gray-400">링크(MVP 보류)</span>
                </div>
              </div>
            ))
          ) : (
            <p
              className="rounded-[5.5px] border border-dashed border-stology-border-light bg-stology-off-white px-4 py-5 text-center text-[13px] text-stology-text-light"
              role="status"
            >
              연결된 자료가 없습니다.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
};
