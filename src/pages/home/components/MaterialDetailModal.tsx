import { useNavigate } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { Modal } from '@/shared/ui';

import {
  type MaterialTodoFilter,
  type MaterialTodoItem,
  useMaterialTodos,
} from '../hooks/useMaterialTodos';

interface MaterialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Hom001DetailRow = ({ item }: { item: MaterialTodoItem }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (item.status === '검토 필요') {
      // 검토 REV001
      navigate(`/studies/${encodeURIComponent(item.study)}/review/${item.id}`);
    } else {
      // 빈 업로드 UPL001
      navigate(`/studies/${encodeURIComponent(item.study)}/upload`);
    }
  };

  return (
    <div className="flex h-[62px] items-center gap-4 rounded-[4px] border border-stology-border-light bg-white px-[15px] text-[11px]">
      {/* 상태 */}
      <span className="w-[96px] text-stology-text-dark">{item.status}</span>
      {/* 자료 제목 */}
      <span className="w-[262px] truncate font-bold text-stology-text-dark">{item.title}</span>
      {/* 스터디 */}
      <span className="w-[172px] truncate text-stology-text-dark">{item.study}</span>
      {/* 주차 */}
      <span className="w-[140px] text-stology-text-dark">{item.week}</span>
      {/* 업로더/일 */}
      <span className="w-[110px] text-stology-text-dark">
        {item.uploader} · {item.date}
      </span>
      {/* 액션 CTA */}
      <button
        type="button"
        onClick={handleAction}
        disabled={item.state?.isLoading || item.state?.isError || item.state?.permissionDenied}
        className={cn(
          'flex-1 text-center font-bold',
          item.state?.isLoading || item.state?.isError || item.state?.permissionDenied
            ? 'text-stology-text-light cursor-not-allowed'
            : 'text-stology-royal-blue hover:text-stology-electric-blue',
        )}
      >
        {item.state?.isLoading
          ? '로딩 중...'
          : item.state?.isError
            ? '오류 발생'
            : item.state?.permissionDenied
              ? '권한 부족'
              : item.state?.isReadOnly
                ? '읽기 전용'
                : item.status === '검토 필요'
                  ? '검토하기'
                  : '재업로드'}
      </button>
    </div>
  );
};
export const MaterialDetailModal = ({ isOpen, onClose }: MaterialDetailModalProps) => {
  const { filter, setFilter, items, counts } = useMaterialTodos();

  const FILTERS: { label: MaterialTodoFilter; count: number }[] = [
    { label: '전체', count: counts['전체'] },
    { label: '검토', count: counts['검토'] },
    { label: '재업로드 필요', count: counts['재업로드 필요'] },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="자료 상세"
      description="처리해야 할 자료를 상태별로 확인하세요."
      showCloseButton
      className="max-w-[1010px] p-7" // 1010px 넓이 설정, 패딩 맞춤
    >
      <div className="flex flex-col gap-[27px]">
        {/* 필터 탭 */}
        <div className="flex gap-4">
          {FILTERS.map(({ label, count }) => {
            const isActive = filter === label;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilter(label)}
                className={cn(
                  'flex h-[38px] w-[150px] items-center justify-center whitespace-pre-wrap rounded-[19px] border text-[12px] font-bold transition-colors',
                  isActive
                    ? 'border-stology-text-dark bg-stology-text-dark text-white'
                    : 'border-stology-border-light bg-white text-stology-text-dark hover:bg-stology-off-white',
                )}
              >
                {`${label}  ${count}`}
              </button>
            );
          })}
        </div>

        {/* 리스트 영역 */}
        <div className="flex flex-col">
          {/* 리스트 헤더 */}
          <div className="flex h-[42px] items-center gap-4 rounded-[3px] border border-stology-border-light bg-stology-off-white px-[15px] text-[11px] font-bold text-stology-text-dark">
            <span className="w-[96px]">상태</span>
            <span className="w-[262px]">자료 제목</span>
            <span className="w-[172px]">스터디</span>
            <span className="w-[140px]">주차</span>
            <span className="w-[110px]">업로더/일</span>
            <span className="flex-1 text-center"></span>
          </div>

          {/* 리스트 본문 (스크롤) */}
          <div className="mt-3 flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
            {items.length > 0 ? (
              items.map((item) => <Hom001DetailRow key={item.id} item={item} />)
            ) : (
              <div className="flex h-[42px] items-center rounded-[3px] border border-stology-border-light bg-stology-off-white px-[15px] text-[11px] text-stology-text-light">
                빈 상태: 내용 없음
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
