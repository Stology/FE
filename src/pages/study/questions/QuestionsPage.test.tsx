// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { QuestionsPage } from './QuestionsPage';

afterEach(cleanup);

describe('QuestionsPage', () => {
  it('최신 질문의 목록 정보를 표시한다', () => {
    render(<QuestionsPage />);

    expect(screen.getByText('Refresh Token 저장 위치가 궁금합니다')).toBeInTheDocument();
    expect(screen.getByText('민지')).toBeInTheDocument();
    expect(screen.getByText('답글 3')).toBeInTheDocument();
    expect(screen.getByText('첨부 있음')).toBeInTheDocument();
  });

  it('선택한 페이지의 질문 목록으로 전환한다', () => {
    render(<QuestionsPage />);

    fireEvent.click(screen.getByRole('button', { name: '2페이지' }));

    expect(screen.getByText('Access Token 재발급 시점이 궁금합니다')).toBeInTheDocument();
    expect(screen.queryByText('Refresh Token 저장 위치가 궁금합니다')).not.toBeInTheDocument();
  });

  it('질문 작성 요청을 전달한다', () => {
    const handleQuestionCreate = vi.fn();

    render(<QuestionsPage onQuestionCreate={handleQuestionCreate} />);
    fireEvent.click(screen.getByRole('button', { name: '질문 작성' }));

    expect(handleQuestionCreate).toHaveBeenCalledOnce();
  });
});
