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

  it('선택한 질문 식별자를 전달한다', () => {
    const handleQuestionSelect = vi.fn();

    render(<QuestionsPage onQuestionSelect={handleQuestionSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Refresh Token 저장 위치가 궁금합니다/ }));

    expect(handleQuestionSelect).toHaveBeenCalledOnce();
    expect(handleQuestionSelect).toHaveBeenCalledWith('refresh-token-storage');
  });

  it('질문이 없으면 빈 상태를 표시하고 페이지네이션을 숨긴다', () => {
    render(<QuestionsPage questions={[]} />);

    expect(screen.getByText('아직 질문이 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('첫 질문을 작성해보세요!')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '질문 목록 페이지' })).not.toBeInTheDocument();
  });

  it.each([0, -1, 1.5])('유효하지 않은 pageSize %s를 기본값으로 보정한다', (pageSize) => {
    render(<QuestionsPage pageSize={pageSize} />);

    expect(screen.getByText('Refresh Token 저장 위치가 궁금합니다')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2페이지' })).toBeInTheDocument();
  });
});
