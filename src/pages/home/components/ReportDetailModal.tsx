import { useNavigate } from 'react-router-dom';

import { Modal } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { useReportTodos, type ReportTodoItem } from '../hooks/useReportTodos';

export interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportDetailRow = ({
  item,
  onClickAction,
}: {
  item: ReportTodoItem;
  onClickAction: (item: ReportTodoItem) => void;
}) => {
  const isCreated = item.status === '생성 완료';

  return (
    <div
      className={cn(
        'flex h-[62px] w-full items-center rounded-[4px] border border-stology-border-light bg-white px-[15px] text-[11px]',
        !isCreated && 'opacity-[42%]',
      )}
    >
      {/* 상태 */}
      <div className="w-[96px] text-stology-text-dark">{item.status}</div>
      {/* 스터디 */}
      <div className="w-[210px] truncate font-bold text-stology-text-dark">{item.study.name}</div>
      {/* 리포트명 */}
      <div className="w-[330px] truncate text-stology-text-dark">{item.reportName}</div>
      {/* 생성일 */}
      <div className="w-[120px] truncate text-stology-text-dark">{item.createdAt}</div>
      {/* Action */}
      <button
        type="button"
        onClick={() => onClickAction(item)}
        disabled={!isCreated}
        className={cn(
          'flex-1 text-center font-normal',
          isCreated
            ? 'text-stology-electric-blue hover:underline'
            : 'text-stology-electric-blue cursor-not-allowed',
        )}
      >
        {isCreated ? '리포트 보기' : '보기 불가'}
      </button>
    </div>
  );
};

export const ReportDetailModal = ({ isOpen, onClose }: ReportDetailModalProps) => {
  const navigate = useNavigate();
  const { items, counts } = useReportTodos();

  function handleActionClick(item: ReportTodoItem) {
    onClose();
    const params = new URLSearchParams({ week: String(item.reportWeek) });
    navigate(`/studies/${encodeURIComponent(item.study.id)}/reports?${params.toString()}`);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="리포트 상세"
      description="참여 중인 스터디의 최신 리포트를 선택하세요."
      showCloseButton
      className="max-w-[1010px]"
    >
      <div className="mt-7 flex flex-col gap-6">
        {/* 필터 부분: 리포트 모달은 '전체 스터디' 하나만 존재 */}
        <div className="flex gap-4">
          <button
            type="button"
            className="flex h-[38px] w-[150px] items-center justify-center rounded-[19px] border border-stology-text-dark bg-stology-text-dark text-[12px] font-bold text-white transition-colors"
          >
            전체 스터디 &nbsp;{counts.completed}
          </button>
        </div>

        {/* 목록 컨테이너 */}
        <div className="flex flex-col gap-2">
          {/* List Header */}
          <div className="flex h-[42px] w-full items-center rounded-[3px] border border-stology-border-light bg-stology-off-white px-[15px] text-[11px] font-bold text-stology-text-dark">
            <div className="w-[96px]">상태</div>
            <div className="w-[210px]">스터디</div>
            <div className="w-[330px]">리포트명</div>
            <div className="w-[120px]">생성일</div>
            <div className="flex-1 text-center"></div>
          </div>

          {/* List Body */}
          <div className="flex max-h-[350px] flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
            {items.length === 0 ? (
              <div className="flex h-[42px] items-center rounded-[3px] border border-stology-border-light bg-stology-off-white pl-[15px] text-[11px] text-stology-text-light">
                빈 상태: 내용 없음
              </div>
            ) : (
              items.map((item) => (
                <ReportDetailRow key={item.id} item={item} onClickAction={handleActionClick} />
              ))
            )}
          </div>
        </div>

        {/* 하단 안내 텍스트 */}
        <div className="mt-4 text-[11px] font-medium text-stology-text-light">
          대상 삭제·상태 변경·권한 상실: 이동 차단 → 토스트 → 목록 새로고침/행 제거/숫자 재계산
        </div>
      </div>
    </Modal>
  );
};
