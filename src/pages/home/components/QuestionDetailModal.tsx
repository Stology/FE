import { useNavigate } from 'react-router-dom';

import { Modal } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { useQuestionTodos, type QuestionTodoItem } from '../hooks/useQuestionTodos';

export interface QuestionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStudyIds: readonly string[];
}

const FilterButton = ({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex h-[38px] w-[150px] items-center justify-center rounded-[13px] border text-[12px] font-bold transition-colors',
      active
        ? 'border-stology-text-dark bg-stology-text-dark text-white'
        : 'border-stology-border-light bg-white text-stology-text-dark hover:bg-stology-off-white',
    )}
  >
    {label} &nbsp;{count}
  </button>
);

const DetailRow = ({
  item,
  onClickAction,
}: {
  item: QuestionTodoItem;
  onClickAction: (item: QuestionTodoItem) => void;
}) => (
  <div
    className={cn(
      'flex h-[62px] w-full items-center rounded-[4px] border border-stology-border-light bg-white text-[11px]',
      item.isRead && 'opacity-50',
    )}
  >
    {/* 상태 */}
    <div className="w-[96px] pl-[15px] font-bold text-stology-text-dark">{item.status}</div>
    {/* 질문 제목 */}
    <div className="w-[262px] truncate font-bold text-stology-text-dark">{item.title}</div>
    {/* 스터디 */}
    <div className="w-[172px] truncate text-stology-text-dark">{item.study}</div>
    {/* 작성자 */}
    <div className="w-[140px] truncate text-stology-text-dark">{item.author}</div>
    {/* 작성 시각 */}
    <div className="w-[110px] truncate text-stology-text-dark">{item.createdAt}</div>
    {/* Action */}
    <button
      type="button"
      onClick={() => onClickAction(item)}
      className="flex-1 text-center font-normal text-stology-electric-blue hover:underline"
    >
      {item.action}
    </button>
  </div>
);

export const QuestionDetailModal = ({
  activeStudyIds,
  isOpen,
  onClose,
}: QuestionDetailModalProps) => {
  const navigate = useNavigate();
  const { items, filter, setFilter, counts, markAsRead } = useQuestionTodos(activeStudyIds);

  function handleActionClick(item: QuestionTodoItem) {
    // 1. 해당 알림을 읽음 처리
    markAsRead(item.to);
    // 2. 모달 닫기
    onClose();
    // 3. 해당 페이지로 이동
    navigate(item.to);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="질문함 상세"
      description="새 질문과 내 질문의 새 답글을 확인하세요."
      showCloseButton
      className="max-w-[1010px] p-7"
    >
      <div className="flex flex-col gap-[27px]">
        {/* 필터 그룹 */}
        <div className="flex gap-4">
          <FilterButton
            active={filter === '전체'}
            onClick={() => setFilter('전체')}
            label="전체"
            count={counts.total}
          />
          <FilterButton
            active={filter === '새 질문'}
            onClick={() => setFilter('새 질문')}
            label="새 질문"
            count={counts.newQuestion}
          />
          <FilterButton
            active={filter === '새 답글'}
            onClick={() => setFilter('새 답글')}
            label="새 답글"
            count={counts.newReply}
          />
        </div>

        {/* 목록 컨테이너 */}
        <div className="flex flex-col gap-2">
          {/* List Header */}
          <div className="flex h-[42px] w-full items-center rounded-[3px] border border-stology-border-light bg-stology-off-white text-[11px] font-bold text-stology-text-dark">
            <div className="w-[96px] pl-[15px]">유형/읽음</div>
            <div className="w-[262px]">질문 제목</div>
            <div className="w-[172px]">스터디</div>
            <div className="w-[140px]">작성자</div>
            <div className="w-[110px]">작성 시각</div>
            <div className="flex-1 text-center"></div>
          </div>

          {/* List Body */}
          <div className="flex max-h-[350px] flex-col gap-2 overflow-y-auto pr-2">
            {items.map((item) => (
              <DetailRow key={item.id} item={item} onClickAction={handleActionClick} />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
