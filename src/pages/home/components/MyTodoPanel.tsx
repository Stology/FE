import { useActivityClick } from '../hooks/useActivityClick';

import { cn } from '@/shared/lib/cn';
import { Toast } from '@/shared/ui/Toast';
import type { MyTodoItem, MyTodoSection } from '../mocks';

export type { MyTodoItem, MyTodoSection };

// ─── Section chip colors ────────────────────────────────────────────────────

const sectionChipClass: Record<MyTodoSection, string> = {
  자료: 'border-stology-text-light bg-stology-off-white text-stology-text-dark',
  질문함: 'border-stology-royal-blue bg-[#EFF6FF] text-stology-royal-blue',
  리포트: 'border-stology-electric-blue bg-[#DBEAFE] text-stology-royal-blue',
};

// ─── Row ─────────────────────────────────────────────────────────────────────

interface MyTodoRowProps {
  item: MyTodoItem;
  onClick: (item: MyTodoItem) => void;
}

const MyTodoRow = ({ item, onClick }: MyTodoRowProps) => {
  return (
    <li className="flex items-center gap-3 rounded-[4px] border border-stology-border-light bg-white px-3 py-[14px]">
      {/* 섹션 칩 */}
      <span
        className={cn(
          'inline-flex h-6 w-12 shrink-0 items-center justify-center rounded-[3px] border text-[10px] font-bold',
          sectionChipClass[item.section],
        )}
      >
        {item.section}
      </span>

      {/* 요약 텍스트 */}
      <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-stology-text-dark">
        {item.summary}
      </span>

      {/* 상세보기 CTA */}
      <button
        type="button"
        onClick={() => onClick(item)}
        className="shrink-0 text-[10px] font-bold text-stology-text-light hover:text-stology-electric-blue"
      >
        상세보기
      </button>
    </li>
  );
};

// ─── Panel ───────────────────────────────────────────────────────────────────

interface MyTodoPanelProps {
  items: MyTodoItem[];
  onRemove?: (id: string) => void;
  onClickItem?: (item: MyTodoItem) => void;
}

const DEFAULT_TODO_SECTIONS: MyTodoSection[] = ['자료', '질문함', '리포트'];

export const MyTodoPanel = ({ items, onRemove, onClickItem }: MyTodoPanelProps) => {
  const { handleItemClick, setToastMessage, toastMessage } = useActivityClick(onRemove);

  const displayItems = DEFAULT_TODO_SECTIONS.map((section) => {
    const existing = items.find((item) => item.section === section);
    return existing || { section, summary: '지금 확인할 항목이 없습니다.', to: '#' };
  });

  return (
    <section className="flex min-h-[420px] w-full flex-col rounded-[6px] border border-stology-text-light bg-white p-5 relative">
      {/* 예외 처리 상단 Toast (HOM001-0300) */}
      {toastMessage && (
        <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2 w-max max-w-[90%]">
          <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
        </div>
      )}
      {/* 제목 */}
      <h2 className="text-heading-1 text-stology-text-dark">내 할 일</h2>
      <p className="mt-1 text-[12px] text-stology-text-light">
        자료·질문함·리포트를 섹션별로 확인하세요.
      </p>

      {/* 필드 헤더 */}
      <div className="mt-5 grid grid-cols-[48px_1fr_50px] gap-3 rounded-[2px] border border-stology-border-light bg-stology-off-white px-3 py-1.5 text-[10px] font-bold text-stology-text-light">
        <span>섹션</span>
        <span>확인할 내용</span>
        <span>상세</span>
      </div>

      {/* 항목 목록 */}
      <ul className="mt-1 flex flex-col gap-1">
        {displayItems.map((item) => (
          <MyTodoRow
            key={item.section}
            item={item}
            onClick={(clickedItem) => {
              if (
                (clickedItem.section === '질문함' ||
                  clickedItem.section === '자료' ||
                  clickedItem.section === '리포트') &&
                onClickItem
              ) {
                onClickItem(clickedItem);
              } else {
                handleItemClick(clickedItem);
              }
            }}
          />
        ))}
      </ul>
    </section>
  );
};
