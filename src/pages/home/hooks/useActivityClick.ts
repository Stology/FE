import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useActivityClick = () => {
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
    (item: { testStatus?: 'valid' | 'deleted' | 'no-permission'; to: string }) => {
      // 1. 삭제된 대상
      if (item.testStatus === 'deleted') {
        showToast('대상이 삭제되거나 상태가 변경되었습니다.');
        // TODO: 목록 새로고침 및 건수 갱신 API 연동 필요 (HOM001-0300)
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
    [navigate, showToast],
  );

  return {
    handleItemClick,
    setToastMessage,
    toastMessage,
  };
};
