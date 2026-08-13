// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '@/shared/api/http_client';

import { StudyEndedSummary } from './StudyEndedSummary';
import { StudySettingsMenu } from './StudySettingsMenu';

vi.mock('@/shared/api/http_client', () => ({
  httpClient: { get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderSettingsMenu(onStudyClosed = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <StudySettingsMenu onStudyClosed={onStudyClosed} studyId="7" />
    </QueryClientProvider>,
  );
}

describe('StudySettingsMenu', () => {
  it('명세에 정의된 설정 항목을 표시한다', () => {
    renderSettingsMenu();

    fireEvent.click(screen.getByRole('button', { name: '스터디 설정' }));

    expect(screen.getByRole('menuitem', { name: '초대 링크' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '검토 인원 수 조정' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: '리포트 생성 시간' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '스터디 종료' })).toBeInTheDocument();
  });

  it('Figma 문구와 버튼 구성으로 종료 확인 모달을 표시한다', () => {
    renderSettingsMenu();

    fireEvent.click(screen.getByRole('button', { name: '스터디 설정' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '스터디 종료' }));

    const dialog = screen.getByRole('dialog', { name: '스터디 종료' });
    expect(dialog).toHaveClass('max-w-[440px]');
    expect(dialog.parentElement).toHaveClass('bg-[rgba(10,25,47,0.28)]');
    expect(dialog.parentElement).not.toHaveClass('bg-stology-deep-navy');
    expect(dialog).toHaveTextContent('스터디를 종료 하시겠습니까?');
    expect(dialog).toHaveTextContent(
      '스터디를 종료하면 더 이상 자료 업로드, 검토, 질문 작성이 불가능합니다.',
    );
    expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '예' })).toHaveClass('bg-[#171717]');
  });

  it('검토 인원을 조회하고 증감 결과를 즉시 저장한다', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: {
        code: 'STUDY200_2',
        errorDetail: null,
        message: '',
        result: { maxReviewerCount: 4, reviewerCount: 2 },
        success: true,
      },
    });
    vi.mocked(httpClient.patch).mockResolvedValue({
      data: { code: 'STUDY200_3', errorDetail: null, message: '', result: null, success: true },
    });
    renderSettingsMenu();

    fireEvent.click(screen.getByRole('button', { name: '스터디 설정' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '검토 인원 수 조정' }));

    expect(await screen.findByText('2명')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '검토 인원 늘리기' }));

    await waitFor(() =>
      expect(httpClient.patch).toHaveBeenCalledWith('/api/study/7/reviewer-count', {
        reviewerCount: 3,
      }),
    );
  });

  it('스터디 종료 확인 후 서버의 활동 요약을 전달한다', async () => {
    const onStudyClosed = vi.fn();
    const summary = { activeNodeCount: 8, questionCount: 3, uploadedMaterialCount: 5 };
    vi.mocked(httpClient.patch).mockResolvedValue({
      data: {
        code: 'STUDY200_4',
        errorDetail: null,
        message: '',
        result: summary,
        success: true,
      },
    });
    renderSettingsMenu(onStudyClosed);

    fireEvent.click(screen.getByRole('button', { name: '스터디 설정' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '스터디 종료' }));
    fireEvent.click(screen.getByRole('button', { name: '예' }));

    await waitFor(() => expect(onStudyClosed).toHaveBeenCalledWith(summary));
    expect(httpClient.patch).toHaveBeenCalledWith('/api/study/7/close');
  });
});

describe('StudyEndedSummary', () => {
  it('종료 통계와 홈 이동 액션을 표시한다', () => {
    const onGoHome = vi.fn();
    render(
      <StudyEndedSummary
        onGoHome={onGoHome}
        summary={{ activeNodeCount: 8, questionCount: 3, uploadedMaterialCount: 5 }}
      />,
    );

    expect(screen.getByRole('heading', { name: '스터디가 종료되었습니다' })).toBeInTheDocument();
    expect(screen.getByText('8개')).toBeInTheDocument();
    expect(screen.getByText('5개')).toBeInTheDocument();
    expect(screen.getByText('3개')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '홈으로 이동' }));
    expect(onGoHome).toHaveBeenCalledOnce();
  });
});
