// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '@/shared/api/http_client';
import type { NodeCandidate } from '@/shared/types/stology';

import { ReviewPage } from './ReviewPage';

vi.mock('@/shared/api/http_client', () => ({
  httpClient: { get: vi.fn(), patch: vi.fn() },
}));

afterEach(() => {
  cleanup();
  vi.mocked(httpClient.get).mockReset();
  vi.mocked(httpClient.patch).mockReset();
});

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

const renderPage = (props: Parameters<typeof ReviewPage>[0] = {}) =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <ReviewPage {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );

const renderReviewRoute = (path: string) =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<p>홈 화면</p>} path="/" />
          <Route element={<ReviewPage />} path="/studies/:studyId/review" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

const mockCandidates: NodeCandidate[] = [
  {
    approverNames: ['김철수', '이영희'],
    id: 'jwt',
    matchReason: 'AI 매칭 근거: 자료 원문에서 해당 개념과 관계를 추출함',
    name: 'JWT',
    rejecterNames: [],
    reviewerCount: 4,
  },
  {
    approverNames: ['김철수', '이영희'],
    id: 'refresh-token',
    matchReason: 'AI 매칭 근거: 자료 원문에서 해당 개념과 관계를 추출함',
    myAction: 'approved',
    name: 'Refresh Token',
    rejecterNames: [],
    reviewerCount: 4,
  },
  {
    approverNames: ['김철수', '이영희'],
    id: 'session',
    matchReason: 'AI 매칭 근거: 자료 원문에서 해당 개념과 관계를 추출함',
    myAction: 'rejected',
    name: 'Session',
    rejecterNames: ['박민수'],
    reviewerCount: 4,
  },
];

describe('ReviewPage', () => {
  it('검토 진행률을 표시한다', () => {
    renderPage({ candidates: mockCandidates });

    expect(screen.getByText('2/3 검토 완료')).toBeInTheDocument();
  });

  it('후보별 AI 매칭 근거와 승인자, 반려자를 표시한다', () => {
    renderPage({ candidates: mockCandidates });

    expect(screen.getByText('노드 후보 1: JWT')).toBeInTheDocument();
    expect(screen.getAllByText('현재 상태: 2/4명 승인')).toHaveLength(2);
    expect(screen.getByText('반려 있음')).toBeInTheDocument();
    expect(screen.getAllByText('승인자: 김철수, 이영희')).toHaveLength(3);
    expect(screen.getByText('반려자: 박민수')).toBeInTheDocument();
  });

  it('후보를 승인하면 진행률이 올라간다', () => {
    renderPage({ candidates: mockCandidates });

    expect(screen.getByText('2/3 검토 완료')).toBeInTheDocument();

    const cards = screen.getAllByRole('listitem');
    fireEvent.click(within(cards[0]).getByRole('button', { name: '승인' }));

    expect(screen.getByText('3/3 검토 완료')).toBeInTheDocument();
  });

  it('모든 후보를 검토하기 전에는 검토 마치기를 비활성화한다', () => {
    renderPage({ candidates: mockCandidates });

    expect(screen.getByRole('button', { name: '검토 마치기' })).toBeDisabled();
    expect(screen.getByText('모든 후보를 검토하면 제출할 수 있습니다')).toBeInTheDocument();
  });

  it('전체 승인 후 검토를 제출한다', () => {
    const handleSubmit = vi.fn();

    renderPage({ candidates: mockCandidates, onSubmit: handleSubmit });
    fireEvent.click(screen.getByRole('button', { name: '전체 승인' }));

    const submitButton = screen.getByRole('button', { name: '검토 마치기' });
    expect(submitButton).toBeEnabled();

    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledOnce();
    expect(handleSubmit.mock.calls[0][0]).toHaveLength(3);
    expect(screen.getByText('검토를 제출했습니다.')).toBeInTheDocument();
  });

  it('선택된 후보 수를 표시하고 선택이 없으면 일괄 액션을 비활성화한다', () => {
    renderPage({ candidates: mockCandidates });

    expect(screen.getByText('선택된 후보 0개')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '선택 승인' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '선택 반려' })).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox', { name: 'JWT 후보 선택' }));

    expect(screen.getByText('선택된 후보 1개')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '선택 승인' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '선택 반려' })).toBeEnabled();
  });

  it('선택한 후보만 일괄 반려한다', () => {
    renderPage({ candidates: mockCandidates });

    fireEvent.click(screen.getByRole('checkbox', { name: 'JWT 후보 선택' }));
    fireEvent.click(screen.getByRole('button', { name: '선택 반려' }));

    const cards = screen.getAllByRole('listitem');
    expect(within(cards[0]).getByRole('button', { name: '반려' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('3/3 검토 완료')).toBeInTheDocument();
  });

  it('선택한 후보만 일괄 승인한다', () => {
    renderPage({ candidates: mockCandidates });

    fireEvent.click(screen.getByRole('checkbox', { name: 'JWT 후보 선택' }));
    fireEvent.click(screen.getByRole('button', { name: '선택 승인' }));

    const cards = screen.getAllByRole('listitem');
    expect(within(cards[0]).getByRole('button', { name: '승인' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('선택된 후보 0개')).toBeInTheDocument();
  });

  it('종료된 스터디는 모든 검토 액션을 비활성화한다', () => {
    renderPage({ candidates: mockCandidates, isReadOnly: true });

    expect(screen.getByRole('button', { name: '전체 승인' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '선택 승인' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '선택 반려' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '검토 마치기' })).toBeDisabled();

    const cards = screen.getAllByRole('listitem');
    expect(within(cards[0]).getByRole('button', { name: '승인' })).toBeDisabled();
    expect(within(cards[0]).getByRole('button', { name: '반려' })).toBeDisabled();
  });

  it('종료된 스터디의 직접 검토 URL에서 실 API로 후보를 불러와 읽기 전용으로 표시한다', async () => {
    vi.mocked(httpClient.get).mockImplementation((url: string) => {
      if (url.includes('/node/get-examination-info')) {
        return Promise.resolve({
          data: {
            code: 'OK',
            message: '',
            result: {
              nodeCandidates: [
                {
                  memberVoteInfos: [],
                  nodeCandidateId: 1,
                  numberOfAcceptedStudyMembers: 0,
                  numberOfStudyMembers: 4,
                  studyNodeId: 10,
                },
              ],
            },
            success: true,
          },
        });
      }
      return Promise.resolve({
        data: {
          code: 'OK',
          message: '',
          result: {
            activeLevel: 1,
            definition: '',
            isActive: true,
            materialCount: 0,
            nodeId: 10,
            recentMaterials: [],
            relations: {},
            title: 'JWT',
          },
          success: true,
        },
      });
    });

    renderReviewRoute('/studies/ended-study/review');

    await waitFor(() => expect(screen.getByText('노드 후보 1: JWT')).toBeInTheDocument());

    expect(screen.getByRole('button', { name: '전체 승인' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '검토 마치기' })).toBeDisabled();
  });

  it('투표 제출이 실패하면 성공 메시지 대신 오류를 표시한다', async () => {
    vi.mocked(httpClient.get).mockImplementation((url: string) => {
      if (url.includes('/node/get-examination-info')) {
        return Promise.resolve({
          data: {
            code: 'OK',
            message: '',
            result: {
              nodeCandidates: [
                {
                  memberVoteInfos: [],
                  nodeCandidateId: 1,
                  numberOfAcceptedStudyMembers: 0,
                  numberOfStudyMembers: 4,
                  studyNodeId: 10,
                },
              ],
            },
            success: true,
          },
        });
      }
      return Promise.resolve({
        data: {
          code: 'OK',
          message: '',
          result: {
            activeLevel: 1,
            definition: '',
            isActive: true,
            materialCount: 0,
            nodeId: 10,
            recentMaterials: [],
            relations: {},
            title: 'JWT',
          },
          success: true,
        },
      });
    });
    vi.mocked(httpClient.patch).mockRejectedValue(new Error('network error'));

    renderReviewRoute('/studies/spring-study/review');

    await waitFor(() => expect(screen.getByText('노드 후보 1: JWT')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '전체 승인' }));
    fireEvent.click(screen.getByRole('button', { name: '검토 마치기' }));

    expect(await screen.findByText('검토 제출에 실패했습니다')).toBeInTheDocument();
    expect(screen.queryByText('검토를 제출했습니다.')).not.toBeInTheDocument();
  });

  it('mock 목록에 없는 studyId는 홈으로 보내지 않고 API 오류로 표시한다', async () => {
    renderReviewRoute('/studies/unknown-study/review');

    expect(screen.queryByText('홈 화면')).not.toBeInTheDocument();
    expect(await screen.findByText('AI 후보를 불러오지 못했습니다')).toBeInTheDocument();
  });

  it('후보가 없으면 빈 상태를 표시한다', () => {
    renderPage({ candidates: [] });

    expect(screen.getByText('검토할 후보가 없습니다')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '검토 마치기' })).not.toBeInTheDocument();
  });

  it('오류가 있으면 오류를 표시한다', () => {
    renderPage({ candidates: [], errorMessage: '네트워크 오류' });

    expect(screen.getByText('AI 후보를 불러오지 못했습니다')).toBeInTheDocument();
  });
});
