// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { MaterialReview } from '@/shared/types/stology';

import { ReviewPage } from './ReviewPage';

afterEach(cleanup);

const renderPage = (props: Parameters<typeof ReviewPage>[0] = {}) =>
  render(
    <MemoryRouter>
      <ReviewPage {...props} />
    </MemoryRouter>,
  );

const emptyReview: MaterialReview = {
  candidates: [],
  material: {
    id: 'empty-note',
    isOwn: false,
    status: 'needs_review',
    title: '빈 자료',
    uploadedAt: '2026-03-16',
    uploaderName: '이영희',
    week: 3,
  },
  reviewerCount: 4,
};

describe('ReviewPage', () => {
  it('자료 배너와 검토 진행률을 표시한다', () => {
    renderPage();

    expect(
      screen.getByText(/JWT 정리 노트 \/ 업로더 김철수 \/ 업로드일 2026-03-15 \/ 3주차/),
    ).toBeInTheDocument();
    expect(screen.getByText('2/3 검토 완료')).toBeInTheDocument();
  });

  it('후보별 AI 매칭 근거와 승인자, 반려자를 표시한다', () => {
    renderPage();

    expect(screen.getByText('노드 후보 1: JWT')).toBeInTheDocument();
    expect(screen.getAllByText('현재 상태: 2/4명 승인')).toHaveLength(2);
    expect(screen.getByText('반려 있음')).toBeInTheDocument();
    expect(screen.getAllByText('승인자: 김철수, 이영희')).toHaveLength(3);
    expect(screen.getByText('반려자: 박민수')).toBeInTheDocument();
  });

  it('후보를 승인하면 진행률이 올라간다', () => {
    renderPage();

    expect(screen.getByText('2/3 검토 완료')).toBeInTheDocument();

    const cards = screen.getAllByRole('listitem');
    fireEvent.click(within(cards[0]).getByRole('button', { name: '승인' }));

    expect(screen.getByText('3/3 검토 완료')).toBeInTheDocument();
  });

  it('모든 후보를 검토하기 전에는 검토 마치기를 비활성화한다', () => {
    renderPage();

    expect(screen.getByRole('button', { name: '검토 마치기' })).toBeDisabled();
    expect(screen.getByText('모든 후보를 검토하면 제출할 수 있습니다')).toBeInTheDocument();
  });

  it('전체 승인 후 검토를 제출한다', () => {
    const handleSubmit = vi.fn();

    renderPage({ onSubmit: handleSubmit });
    fireEvent.click(screen.getByRole('button', { name: '전체 승인' }));

    const submitButton = screen.getByRole('button', { name: '검토 마치기' });
    expect(submitButton).toBeEnabled();

    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledOnce();
    expect(handleSubmit.mock.calls[0][0]).toHaveLength(3);
    expect(screen.getByText('검토를 제출했습니다.')).toBeInTheDocument();
  });

  it('선택한 후보만 일괄 반려한다', () => {
    renderPage();

    expect(screen.getByRole('button', { name: /선택 일괄 처리/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox', { name: 'JWT 후보 선택' }));
    fireEvent.click(screen.getByRole('button', { name: '선택 일괄 처리 (1)' }));
    fireEvent.click(screen.getByRole('button', { name: '선택 반려' }));

    const cards = screen.getAllByRole('listitem');
    expect(within(cards[0]).getByRole('button', { name: '반려' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('3/3 검토 완료')).toBeInTheDocument();
  });

  it('종료된 스터디는 모든 검토 액션을 비활성화한다', () => {
    renderPage({ isReadOnly: true });

    expect(screen.getByRole('button', { name: '전체 승인' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '검토 마치기' })).toBeDisabled();

    const cards = screen.getAllByRole('listitem');
    expect(within(cards[0]).getByRole('button', { name: '승인' })).toBeDisabled();
    expect(within(cards[0]).getByRole('button', { name: '반려' })).toBeDisabled();
  });

  it('후보가 없으면 빈 상태를 표시한다', () => {
    renderPage({ review: emptyReview });

    expect(screen.getByText('검토할 후보가 없습니다')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '검토 마치기' })).not.toBeInTheDocument();
  });

  it('오류가 있으면 오류를 표시한다', () => {
    renderPage({ errorMessage: '네트워크 오류' });

    expect(screen.getByText('AI 후보를 불러오지 못했습니다')).toBeInTheDocument();
  });
});
