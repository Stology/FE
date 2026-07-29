import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useActivityClick = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleItemClick = useCallback(
    (item: { testStatus?: 'valid' | 'deleted' | 'no-permission'; to: string }) => {
      // 1. 삭제된 대상
      if (item.testStatus === 'deleted') {
        return;
      }

      // 2. 권한 없음
      if (item.testStatus === 'no-permission') {
        setToastMessage('접근 권한이 없습니다.');

        // 이전 타이머 정리 (Race condition 방지)
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          setToastMessage(null);
        }, 3000);
        return;
      }

      // 정상 이동
      navigate(item.to);
    },
    [navigate],
  );

  return {
    handleItemClick,
    setToastMessage,
    toastMessage,
  };
};
