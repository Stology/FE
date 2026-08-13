import { useActivityClick } from '../hooks/useActivityClick';

import { cn } from '@/shared/lib/cn';
import { Select, Toast } from '@/shared/ui';
import type { TeamActivityItem, TeamActivityType } from '../mocks';

export type { TeamActivityItem, TeamActivityType };

// ─── Chip Colors ─────────────────────────────────────────────────────────────

const typeChipClass: Record<TeamActivityType, string> = {
  구조: 'border-stology-text-light bg-stology-off-white text-stology-text-dark',
  답글: 'border-stology-royal-blue bg-[#EFF6FF] text-stology-royal-blue',
};

// ─── Row ─────────────────────────────────────────────────────────────────────

interface TeamActivityRowProps {
  item: TeamActivityItem;
  onClick: (item: TeamActivityItem) => void;
}

const TeamActivityRow = ({ item, onClick }: TeamActivityRowProps) => {
  return (
    <li>
      <button
        type="button"
        className="grid w-full cursor-pointer items-center gap-3 rounded-[4px] border border-stology-border-light bg-white px-3 py-3 text-left hover:bg-stology-off-white"
        style={{ gridTemplateColumns: '48px 1fr 92px 42px 20px' }}
        onClick={() => onClick(item)}
      >
        <span
          className={cn(
            'inline-flex h-6 items-center justify-center rounded-[3px] border text-[10px] font-bold',
            typeChipClass[item.type],
          )}
        >
          {item.type}
        </span>

        <div className="min-w-0">
          <p className="truncate text-[12px] font-bold text-stology-text-dark">{item.summary}</p>
          <p className="truncate text-[10px] text-stology-text-light">{item.detail}</p>
        </div>

        <span className="truncate text-[10px] text-stology-text-dark">{item.target}</span>
        <span className="text-[10px] text-stology-text-light">{item.timeAgo}</span>
        <span aria-hidden="true" className="text-[10px] font-bold text-stology-text-light">
          ›
        </span>
      </button>
    </li>
  );
};

// ─── Study filter ─────────────────────────────────────────────────────────────

interface StudyFilterProps {
  studies: { id: string; name: string }[];
  selected: string;
  onChange: (id: string) => void;
}

const StudyFilter = ({ onChange, selected, studies }: StudyFilterProps) => (
  <Select
    aria-label="스터디 필터"
    className="h-auto w-auto rounded-[4px] border-stology-text-light px-2 py-1 text-[11px] focus:ring-0"
    value={selected}
    onChange={(e) => onChange(e.target.value)}
  >
    <option value="all">전체 스터디</option>
    {studies.map((s) => (
      <option key={s.id} value={s.id}>
        {s.name}
      </option>
    ))}
  </Select>
);

// ─── Panel ───────────────────────────────────────────────────────────────────

interface TeamActivityPanelProps {
  items: TeamActivityItem[];
  studies: { id: string; name: string }[];
  selectedStudy: string;
  onStudyChange: (id: string) => void;
  onRemove?: (id: string) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export const TeamActivityPanel = ({
  items,
  onStudyChange,
  selectedStudy,
  studies,
  onRemove,
  isLoading,
  error,
}: TeamActivityPanelProps) => {
  const { handleItemClick, setToastMessage, toastMessage } = useActivityClick(onRemove);

  return (
    <section className="relative flex min-h-[420px] w-full flex-col rounded-[6px] border border-stology-text-light bg-white p-5">
      {/* 예외 처리 상단 Toast (HOM001-0300) */}
      {toastMessage && (
        <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2 w-max max-w-[90%]">
          <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
        </div>
      )}

      {/* 제목 & 필터 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-heading-1 text-stology-text-dark">팀 활동</h2>
          <p className="mt-1 text-[12px] text-stology-text-light">
            참여 중인 스터디의 최근 변화를 확인하세요.
          </p>
        </div>
        {studies.length > 1 && (
          <StudyFilter studies={studies} selected={selectedStudy} onChange={onStudyChange} />
        )}
      </div>

      {isLoading ? (
        <p className="flex flex-1 items-center justify-center text-[12px] text-stology-text-light">
          불러오는 중...
        </p>
      ) : error ? (
        <p className="mt-4 rounded-[2px] border border-dashed border-red-200 px-3 py-1 text-[10px] text-red-500">
          팀 활동을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      ) : items.length > 0 ? (
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <div
            className="grid items-center gap-3 rounded-[2px] border border-stology-border-light bg-stology-off-white px-3 py-1.5 text-[10px] font-bold text-stology-text-light"
            style={{ gridTemplateColumns: '48px 1fr 92px 42px 20px' }}
          >
            <span>유형</span>
            <span>이벤트</span>
            <span>대상</span>
            <span>시간</span>
            <span>이동</span>
          </div>
          <div className="mt-1 min-h-0 flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-1">
              {items.map((item) => (
                <TeamActivityRow key={item.id} item={item} onClick={handleItemClick} />
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="flex flex-1 items-center justify-center text-[12px] text-stology-text-light">
          아직 팀 활동이 없습니다.
        </p>
      )}
    </section>
  );
};
