// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { toast } from '@/shared/hooks/useToast';
import { useToastStore } from '@/shared/stores/useToastStore';

import { ToastViewport } from './ToastViewport';

afterEach(() => {
  cleanup();
  useToastStore.getState().clearToasts();
  vi.useRealTimers();
});

describe('ToastViewport', () => {
  it('전역 헬퍼로 추가한 알림을 표시하고 직접 닫는다', () => {
    render(<ToastViewport />);

    act(() => {
      toast.success('링크가 복사되었습니다', { duration: 0 });
    });

    expect(screen.getByRole('status')).toHaveTextContent('링크가 복사되었습니다');

    fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }));

    expect(screen.queryByText('링크가 복사되었습니다')).not.toBeInTheDocument();
  });

  it('설정한 시간이 지나면 알림을 자동으로 닫는다', () => {
    vi.useFakeTimers();
    render(<ToastViewport />);

    act(() => {
      toast.error('업로드에 실패했습니다', { duration: 1000 });
    });

    expect(screen.getByRole('alert')).toHaveTextContent('업로드에 실패했습니다');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('업로드에 실패했습니다')).not.toBeInTheDocument();
  });

  it('여러 알림을 호출 순서대로 쌓아 표시한다', () => {
    render(<ToastViewport />);

    act(() => {
      toast.info('첫 번째 알림', { duration: 0 });
      toast.warning('두 번째 알림', { duration: 0 });
    });

    expect(screen.getAllByRole('status')).toHaveLength(2);
    expect(screen.getByRole('region', { name: '알림 목록' })).toHaveTextContent(
      '첫 번째 알림두 번째 알림',
    );
  });
});
