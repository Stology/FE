import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useActivityClick = (onRemove?: (id: string) => void) => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const handleItemClick = useCallback(
    (item: {
      id?: string;
      section?: string;
      testStatus?: 'valid' | 'deleted' | 'no-permission';
      to: string;
    }) => {
      // 1. 삭제된 대상
      if (item.testStatus === 'deleted') {
        showToast('대상이 삭제되거나 상태가 변경되었습니다.');

        // 목록에서 제거하여 건수 재계산 (HOM001-0300 기획 명세 피드백 반영)
        const identifier = item.id || item.section;
        if (onRemove && identifier) {
          onRemove(identifier);
        }
        return;
      }

      // 2. 권한 없음
      if (item.testStatus === 'no-permission') {
        showToast('접근 권한이 없습니다.');
        return;
      }

      // 정상 이동
      navigate(item.to);
    },
    [navigate, showToast, onRemove],
  );

  return {
    handleItemClick,
    setToastMessage,
    toastMessage,
  };
};
