// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Material } from '@/shared/types/stology';

import { MaterialUploadPage } from './MaterialUploadPage';

afterEach(cleanup);

function selectFile(fileName = 'jwt.md') {
  const input = screen.getByLabelText(/드롭존 \/ 파일 선택/);
  const file = new File(['# JWT'], fileName, { type: 'text/markdown' });

  fireEvent.change(input, { target: { files: [file] } });
}

describe('MaterialUploadPage', () => {
  it('대기 중인 자료의 목록 정보를 표시한다', () => {
    render(<MaterialUploadPage />);

    expect(screen.getByText('JWT 정리')).toBeInTheDocument();
    expect(screen.getByText('2026-03-15')).toBeInTheDocument();
    expect(screen.getByText('검토 필요')).toBeInTheDocument();
    expect(screen.getByText('추출 실패')).toBeInTheDocument();
    expect(screen.getByText('1일 후 자동 삭제')).toBeInTheDocument();
    expect(screen.getByText('추출 중')).toBeInTheDocument();
  });

  it('업로드 주차 선택을 표시하지 않는다', () => {
    render(<MaterialUploadPage />);

    expect(screen.queryByRole('combobox', { name: '주차 선택' })).not.toBeInTheDocument();
  });

  it('제목 없이 등록하면 검증 메시지를 표시하고 제출하지 않는다', async () => {
    const handleSubmit = vi.fn();

    render(<MaterialUploadPage onSubmit={handleSubmit} />);
    selectFile();
    fireEvent.click(screen.getByRole('button', { name: '등록' }));

    expect(await screen.findByText('자료 제목을 입력해 주세요.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('파일 없이 등록하면 파일 선택 안내를 표시한다', async () => {
    const handleSubmit = vi.fn();

    render(<MaterialUploadPage onSubmit={handleSubmit} />);
    fireEvent.change(screen.getByRole('textbox', { name: '자료 제목 *' }), {
      target: { value: 'JWT 정리' },
    });
    fireEvent.click(screen.getByRole('button', { name: '등록' }));

    expect(await screen.findByText('마크다운 파일을 선택해 주세요.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('파일 업로드로 등록하면 입력값을 전달하고 등록 안내를 표시한다', async () => {
    const handleSubmit = vi.fn();

    render(<MaterialUploadPage onSubmit={handleSubmit} />);
    fireEvent.change(screen.getByRole('textbox', { name: '자료 제목 *' }), {
      target: { value: 'JWT 정리' },
    });
    selectFile();
    fireEvent.click(screen.getByRole('button', { name: '등록' }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledOnce());
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: 'jwt.md', mode: 'file', title: 'JWT 정리' }),
    );
    expect(handleSubmit.mock.calls[0]?.[0]).not.toHaveProperty('week');
    expect(
      screen.getByText(/‘JWT 정리’ 자료를 등록했습니다. AI 추출이 시작됩니다./),
    ).toBeInTheDocument();
  });

  it('텍스트 직접 입력으로 전환하면 본문 입력을 요구한다', async () => {
    const handleSubmit = vi.fn();

    render(<MaterialUploadPage onSubmit={handleSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: '텍스트 직접 입력' }));
    fireEvent.change(screen.getByRole('textbox', { name: '자료 제목 *' }), {
      target: { value: '캐시 전략' },
    });
    fireEvent.click(screen.getByRole('button', { name: '등록' }));

    expect(await screen.findByText('자료 본문을 입력해 주세요.')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: /자료 본문/ }), {
      target: { value: '# 캐시 전략' },
    });
    fireEvent.click(screen.getByRole('button', { name: '등록' }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledOnce());
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ content: '# 캐시 전략', mode: 'text', title: '캐시 전략' }),
    );
  });

  it('검토 필요 자료를 선택하면 검토 진입을 요청한다', () => {
    const handleMaterialReview = vi.fn();

    render(<MaterialUploadPage onMaterialReview={handleMaterialReview} />);
    fireEvent.click(screen.getByRole('button', { name: 'JWT 정리' }));

    expect(handleMaterialReview).toHaveBeenCalledOnce();
    expect(handleMaterialReview).toHaveBeenCalledWith(expect.objectContaining({ id: 'jwt-note' }));
  });

  it('본인의 검토 대기 자료에만 자료 수정 액션을 노출한다', () => {
    render(<MaterialUploadPage />);
    const editButtons = screen.getAllByRole('button', { name: '자료 수정' });

    expect(editButtons).toHaveLength(1);
  });

  it('자료 수정 모달에서 제출하면 수정 내용을 전달한다', async () => {
    const handleMaterialEdit = vi.fn();

    render(<MaterialUploadPage onMaterialEdit={handleMaterialEdit} />);
    fireEvent.click(screen.getByRole('button', { name: '자료 수정' }));

    fireEvent.change(screen.getByRole('textbox', { name: '자료 제목 수정 *' }), {
      target: { value: '토큰 재발급 정리' },
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => expect(handleMaterialEdit).toHaveBeenCalledOnce());
    expect(handleMaterialEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'token-reissue' }),
      expect.objectContaining({ title: '토큰 재발급 정리' }),
    );
  });

  it('본인의 추출 실패 자료에는 재분석 액션을 노출하고, 누르면 요청을 전달한다', () => {
    const handleMaterialReanalyze = vi.fn();
    const materials: Material[] = [
      {
        id: 'failed-own',
        isOwn: true,
        status: 'extract_failed',
        title: '실패한 자료',
        uploadedAt: '2026-03-16',
        uploaderName: '김철수',
        week: 3,
      },
    ];

    render(
      <MaterialUploadPage materials={materials} onMaterialReanalyze={handleMaterialReanalyze} />,
    );
    fireEvent.click(screen.getByRole('button', { name: '재분석' }));

    expect(handleMaterialReanalyze).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'failed-own' }),
    );
  });

  it('종료된 스터디는 업로드 폼과 수정 액션을 숨긴다', () => {
    render(<MaterialUploadPage isReadOnly />);

    expect(screen.queryByRole('button', { name: '등록' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '자료 수정' })).not.toBeInTheDocument();
    expect(
      screen.getByText('종료된 스터디에서는 자료 업로드와 검토가 불가능합니다.'),
    ).toBeInTheDocument();
  });

  it('자료가 없으면 빈 상태를 표시한다', () => {
    render(<MaterialUploadPage materials={[]} />);

    expect(screen.getByText('검토 대기 중인 자료가 없습니다.')).toBeInTheDocument();
  });

  it('오류가 있으면 오류와 다시 시도를 표시한다', () => {
    const handleRetry = vi.fn();

    render(<MaterialUploadPage errorMessage="네트워크 오류" onRetry={handleRetry} />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getByText('대기 중인 자료를 불러오지 못했습니다')).toBeInTheDocument();
    expect(handleRetry).toHaveBeenCalledOnce();
  });
});
