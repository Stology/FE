// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from './ConfirmDialog';

afterEach(cleanup);

describe('ConfirmDialog', () => {
  it('기본 확인과 취소 액션을 제공한다', () => {
    const handleCancel = vi.fn();
    const handleConfirm = vi.fn();

    render(
      <ConfirmDialog
        description="이 작업을 계속할까요?"
        isOpen
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title="작업 확인"
      />,
    );

    expect(screen.getByRole('dialog', { name: '작업 확인' })).toHaveTextContent(
      '이 작업을 계속할까요?',
    );
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    expect(handleCancel).toHaveBeenCalledOnce();
    expect(handleConfirm).toHaveBeenCalledOnce();
  });

  it('위험 액션을 danger 버튼으로 표시한다', () => {
    render(
      <ConfirmDialog
        confirmText="삭제"
        isOpen
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        title="삭제 확인"
        variant="danger"
      />,
    );

    expect(screen.getByRole('button', { name: '삭제' })).toHaveClass('bg-stology-reject');
  });

  it('처리 중에는 확인과 취소를 막는다', () => {
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        isLoading
        isOpen
        onCancel={handleCancel}
        onConfirm={vi.fn()}
        title="스터디 종료"
      />,
    );

    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleCancel).not.toHaveBeenCalled();
  });

  it('일반 상태에서 Escape를 누르면 취소한다', () => {
    const handleCancel = vi.fn();

    render(<ConfirmDialog isOpen onCancel={handleCancel} onConfirm={vi.fn()} title="작업 확인" />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleCancel).toHaveBeenCalledOnce();
  });
});
