// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('질문을 작성해 목록 최상단에 추가한다', async () => {
    const handleQuestionCreate = vi.fn();

    render(<QuestionsPage onQuestionCreate={handleQuestionCreate} />);
    fireEvent.click(screen.getByRole('button', { name: '질문 작성' }));

    expect(screen.getByRole('dialog', { name: '질문 작성' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '질문하기' })).toBeDisabled();

    fireEvent.change(screen.getByRole('textbox', { name: '질문 제목' }), {
      target: { value: '토큰 저장 정책이 궁금합니다' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: '질문 본문' }), {
      target: { value: 'Refresh Token 저장 정책을 어떻게 정하면 좋을까요?' },
    });
    await waitFor(() => expect(screen.getByRole('button', { name: '질문하기' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: '질문하기' }));

    await waitFor(() =>
      expect(handleQuestionCreate).toHaveBeenCalledWith({
        content: 'Refresh Token 저장 정책을 어떻게 정하면 좋을까요?',
        images: [],
        title: '토큰 저장 정책이 궁금합니다',
      }),
    );
    expect(screen.getByText('토큰 저장 정책이 궁금합니다')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: '질문 작성' })).not.toBeInTheDocument();
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

  it('본인 질문을 기존 내용으로 열어 수정한다', async () => {
    const handleQuestionUpdate = vi.fn();

    render(<QuestionsPage onQuestionUpdate={handleQuestionUpdate} />);
    fireEvent.click(screen.getByRole('button', { name: /JWT 만료 시간 기준/ }));
    fireEvent.click(screen.getByRole('button', { name: '질문 수정' }));

    expect(screen.getByRole('dialog', { name: '질문 수정' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '질문 제목' })).toHaveValue('JWT 만료 시간 기준');
    await waitFor(() => expect(screen.getByRole('button', { name: '수정하기' })).toBeEnabled());

    fireEvent.change(screen.getByRole('textbox', { name: '질문 제목' }), {
      target: { value: 'JWT 만료 시간 설정 기준' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: '질문 본문' }), {
      target: { value: '서비스별 만료 시간 설정 기준을 알고 싶습니다.' },
    });
    await waitFor(() => expect(screen.getByRole('button', { name: '수정하기' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

    await waitFor(() =>
      expect(handleQuestionUpdate).toHaveBeenCalledWith('jwt-expiration', {
        content: '서비스별 만료 시간 설정 기준을 알고 싶습니다.',
        images: [],
        title: 'JWT 만료 시간 설정 기준',
      }),
    );
    expect(screen.getByText('JWT 만료 시간 설정 기준')).toBeInTheDocument();
    expect(screen.getByText('서비스별 만료 시간 설정 기준을 알고 싶습니다.')).toBeInTheDocument();
  });

  it('질문 작성 모달을 닫으면 입력 내용을 폐기한다', () => {
    render(<QuestionsPage />);
    fireEvent.click(screen.getByRole('button', { name: '질문 작성' }));
    fireEvent.change(screen.getByRole('textbox', { name: '질문 제목' }), {
      target: { value: '임시 질문' },
    });
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));

    fireEvent.click(screen.getByRole('button', { name: '질문 작성' }));
    expect(screen.getByRole('textbox', { name: '질문 제목' })).toHaveValue('');
  });

  it('본문에 붙여넣은 이미지를 첨부 목록에 표시한다', () => {
    render(<QuestionsPage />);
    fireEvent.click(screen.getByRole('button', { name: '질문 작성' }));

    const image = new File(['image'], 'question.png', { type: 'image/png' });
    fireEvent.paste(screen.getByRole('textbox', { name: '질문 본문' }), {
      clipboardData: {
        items: [{ getAsFile: () => image, type: 'image/png' }],
      },
    });

    expect(screen.getByText('question.png')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'question.png 제거' }));
    expect(screen.queryByText('question.png')).not.toBeInTheDocument();
  });

  it('글자 수 제한을 초과하면 오류를 표시하고 제출을 막는다', async () => {
    render(<QuestionsPage />);
    fireEvent.click(screen.getByRole('button', { name: '질문 작성' }));

    fireEvent.change(screen.getByRole('textbox', { name: '질문 제목' }), {
      target: { value: '제'.repeat(51) },
    });
    fireEvent.change(screen.getByRole('textbox', { name: '질문 본문' }), {
      target: { value: '본'.repeat(1001) },
    });

    expect(await screen.findByText('제목은 50자 이내입니다.')).toBeInTheDocument();
    expect(await screen.findByText('본문은 1000자 이내입니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '질문하기' })).toBeDisabled();
  });

  it('모달 포커스를 내부에 유지하고 닫은 뒤 작성 버튼으로 돌려보낸다', async () => {
    render(<QuestionsPage />);
    const openButton = screen.getByRole('button', { name: '질문 작성' });
    openButton.focus();
    fireEvent.click(openButton);

    const titleInput = screen.getByRole('textbox', { name: '질문 제목' });
    const closeButton = screen.getByRole('button', { name: '닫기' });
    expect(titleInput).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(closeButton).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(titleInput).toHaveFocus();

    fireEvent.click(closeButton);
    await waitFor(() => expect(openButton).toHaveFocus());
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
