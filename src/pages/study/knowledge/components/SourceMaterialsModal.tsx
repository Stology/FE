import type { WeeklyRecordMaterial } from '@/shared/types/stology';
import { Button, Modal } from '@/shared/ui';

interface SourceMaterialsModalProps {
  isOpen: boolean;
  materials: WeeklyRecordMaterial[];
  nodeLabel: string;
  onClose: () => void;
  onMaterialOpen?: (material: WeeklyRecordMaterial) => void;
}

export const SourceMaterialsModal = ({
  isOpen,
  materials,
  nodeLabel,
  onClose,
  onMaterialOpen,
}: SourceMaterialsModalProps) => (
  <Modal
    bodyClassName="mt-[14px]"
    className="max-w-[440px] p-6"
    footer={
      <Button className="px-[21px] text-stology-text-dark" onClick={onClose} variant="outline">
        닫기
      </Button>
    }
    isOpen={isOpen}
    onClose={onClose}
    overlayClassName="bg-[rgba(10,25,47,0.45)]"
    title={`${nodeLabel} 관련자료`}
    titleClassName="font-kr text-[20px] leading-[30px] text-stology-deep-navy"
  >
    <ul className="flex max-h-[280px] flex-col gap-2 overflow-y-auto" aria-label="원본 자료 목록">
      {materials.map((material) => {
        const isActionDisabled = !onMaterialOpen;

        return (
          <li
            className="grid min-h-[43px] shrink-0 grid-cols-1 gap-1 rounded-[5.5px] border border-stology-border-light px-[14px] py-2 sm:h-[43px] sm:grid-cols-[93px_minmax(0,1fr)] sm:items-center sm:gap-[9px] sm:py-0"
            key={material.id}
          >
            <strong
              className="truncate text-[13px] leading-[19.5px] text-stology-text-dark"
              id={`source-material-title-${material.id}`}
            >
              {material.title}
            </strong>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <span className="min-w-0 flex-1 truncate text-[11px] leading-[16.5px] text-stology-text-light sm:w-[122px] sm:flex-none">
                {material.uploaderName}&nbsp;&nbsp;{material.uploadedAt}
              </span>
              <button
                className="shrink-0 text-[11px] font-bold leading-[16.5px] text-stology-electric-blue transition hover:text-stology-royal-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stology-electric-blue disabled:cursor-not-allowed disabled:text-stology-text-light"
                disabled={isActionDisabled}
                onClick={() => onMaterialOpen?.(material)}
                type="button"
              >
                다운로드
              </button>
              <span className="w-[77px] shrink-0 whitespace-nowrap text-[11px] leading-[16.5px] text-stology-text-light">
                링크(MVP 보류)
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  </Modal>
);
