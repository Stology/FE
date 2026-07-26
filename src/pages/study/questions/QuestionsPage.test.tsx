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

  it('여러 질문의 상세 내용을 독립적으로 펼친다', () => {
    render(<QuestionsPage />);

    fireEvent.click(screen.getByRole('button', { name: /Refresh Token 저장 위치가 궁금합니다/ }));
    fireEvent.click(screen.getByRole('button', { name: /인가와 인증의 차이/ }));

    expect(
      screen.getByText(
        'Refresh Token은 httpOnly 쿠키에 저장하는 게 안전할까요, 아니면 별도 저장소가 좋을까요?',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('인증과 인가가 실제 요청 흐름에서 어떤 순서로 동작하는지 궁금합니다.'),
    ).toBeInTheDocument();
  });

  it('답글을 작성하고 답글 수를 갱신한다', () => {
    render(<QuestionsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Refresh Token 저장 위치가 궁금합니다/ }));

    const replyInput = screen.getByRole('textbox', { name: '답글 내용' });
    const submitButton = screen.getByRole('button', { name: '답글 작성' });

    expect(submitButton).toBeDisabled();
    fireEvent.change(replyInput, { target: { value: '쿠키 설정을 함께 확인하겠습니다.' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('쿠키 설정을 함께 확인하겠습니다.')).toBeInTheDocument();
    expect(screen.getByText('답글 4')).toBeInTheDocument();
    expect(replyInput).toHaveValue('');
  });

  it('본인 답글을 인라인으로 수정한다', () => {
    render(<QuestionsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Refresh Token 저장 위치가 궁금합니다/ }));
    fireEvent.click(screen.getByRole('button', { name: '수정' }));

    const editInput = screen.getByRole('textbox', { name: '김스토 답글 수정 내용' });
    fireEvent.change(editInput, { target: { value: '토큰 재발급 정책까지 정리했습니다.' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByText('토큰 재발급 정책까지 정리했습니다.')).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: '김스토 답글 수정 내용' }),
    ).not.toBeInTheDocument();
  });

  it('질문을 접었다 펼쳐도 작성 중인 답글을 유지한다', () => {
    render(<QuestionsPage />);
    const questionButton = screen.getByRole('button', {
      name: /Refresh Token 저장 위치가 궁금합니다/,
    });

    fireEvent.click(questionButton);
    fireEvent.change(screen.getByRole('textbox', { name: '답글 내용' }), {
      target: { value: '작성 중인 답글입니다.' },
    });
    fireEvent.click(questionButton);

    expect(screen.queryByRole('textbox', { name: '답글 내용' })).not.toBeInTheDocument();

    fireEvent.click(questionButton);
    expect(screen.getByRole('textbox', { name: '답글 내용' })).toHaveValue('작성 중인 답글입니다.');
  });

  it('종료된 스터디에서는 답글 작성과 수정 기능을 숨긴다', () => {
    render(<QuestionsPage isReadOnly />);
    fireEvent.click(screen.getByRole('button', { name: /Refresh Token 저장 위치가 궁금합니다/ }));

    expect(screen.queryByRole('textbox', { name: '답글 내용' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '답글 작성' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '이미지 첨부' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '질문 작성' })).not.toBeInTheDocument();
    expect(screen.getByText('서버의 토큰 재발급 정책도 같이 정리해볼게요.')).toBeInTheDocument();
  });
});
