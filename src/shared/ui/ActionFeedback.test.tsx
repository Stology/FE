// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';
import { Tooltip } from './Tooltip';

afterEach(cleanup);

describe('Tooltip', () => {
  it('비활성 액션과 사유를 접근 가능한 관계로 연결한다', () => {
    render(
      <Tooltip content="스터디장만 사용할 수 있습니다.">
        <Button disabled>스터디 종료</Button>
      </Tooltip>,
    );

    const trigger = screen.getByText('스터디 종료').parentElement;
    const tooltip = screen.getByRole('tooltip', { hidden: true });

    expect(screen.getByRole('button', { name: '스터디 종료' })).toBeDisabled();
    expect(trigger).toHaveAttribute('tabindex', '0');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    expect(tooltip).toHaveTextContent('스터디장만 사용할 수 있습니다.');
  });

  it('아래쪽 배치를 지원한다', () => {
    render(
      <Tooltip content="권한이 없습니다." placement="bottom">
        <Button disabled>수정</Button>
      </Tooltip>,
    );

    expect(screen.getByRole('tooltip', { hidden: true })).toHaveClass('top-full');
  });
});

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
});
