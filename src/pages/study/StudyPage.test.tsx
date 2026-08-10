// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '@/shared/api/http_client';

import { StudyPage } from './StudyPage';

vi.mock('@/shared/api/http_client', () => ({
  httpClient: { get: vi.fn(), patch: vi.fn() },
}));

afterEach(() => {
  cleanup();
  vi.mocked(httpClient.get).mockReset();
});

const emptyGraphResponse = {
  data: { code: 'OK', message: '', result: { edges: [], nodes: [] }, success: true },
};

const createWeeklyReportResponse = (currentWeek: number) => ({
  data: {
    code: 'REPORT200_1',
    errorDetail: null,
    message: '주차별 전체 리포트를 조회했습니다.',
    result: {
      aiReviewContent: `${currentWeek}주차 학습 요약입니다.`,
      currentWeek,
      memberActivityStatisticsList: [],
      newActiveNodeCount: 1,
      newActiveNodePercentage: 50,
      recommendedNodeList: [],
      reinforcedNodeCount: 1,
      reinforcedNodePercentage: 50,
      reportId: currentWeek,
      totalNodeCount: 2,
      totalWeeks: 3,
      weeklyCoreNodeList: [
        { materialCount: 1, nodeName: `주차 ${currentWeek} 핵심 노드`, state: '신규 활성화' },
      ],
    },
    success: true,
  },
});

const createQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderStudyRoute = (path: string) =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<p>홈 화면</p>} path="/" />
          <Route element={<StudyPage />} path="/studies/:studyId/:tab" />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  );

const LocationProbe = () => {
  const location = useLocation();

  return <output aria-label="현재 경로">{`${location.pathname}${location.search}`}</output>;
};

describe('StudyPage route validation', () => {
  it('mock 목록에 없는 studyId는 홈으로 보내지 않고 API 오류로 표시한다', async () => {
    renderStudyRoute('/studies/unknown-study/knowledge');

    expect(screen.queryByText('홈 화면')).not.toBeInTheDocument();
    expect(await screen.findByText('지식 구조를 불러오지 못했습니다')).toBeInTheDocument();
  });

  it('지원하지 않는 탭은 지식 구조로 이동한다', () => {
    vi.mocked(httpClient.get).mockResolvedValue(emptyGraphResponse);

    renderStudyRoute('/studies/spring-study/missing-tab');

    expect(screen.getByRole('region', { name: '지식 구조' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: '현재 경로' })).toHaveTextContent(
      '/studies/spring-study/knowledge',
    );
  });
});

describe('StudyPage knowledge route', () => {
  it('mock 목록에 없어도 실 API 응답이 있으면 정상적으로 그래프를 표시한다', async () => {
    vi.mocked(httpClient.get).mockResolvedValue(emptyGraphResponse);

    renderStudyRoute('/studies/4/knowledge');

    expect(await screen.findByRole('region', { name: '지식 구조' })).toBeInTheDocument();
    expect(screen.queryByText('홈 화면')).not.toBeInTheDocument();
  });

  it('연결 자료를 선택하면 자료 업로드 탭으로 이동한다', async () => {
    vi.mocked(httpClient.get).mockImplementation((url: string) => {
      if (url.includes('/knowledge-graph/nodes/')) {
        return Promise.resolve({
          data: {
            code: 'OK',
            message: '',
            result: {
              activeLevel: 1,
              definition: '서버가 발급하는 자가 검증 가능한 인증 토큰',
              isActive: true,
              materialCount: 1,
              nodeId: 1,
              recentMaterials: [
                { createdAt: '2026-03-27', id: 7, memberName: '김철수', title: 'JWT 정리 노트' },
              ],
              relations: {},
              title: 'JWT',
            },
            success: true,
          },
        });
      }
      if (url.includes('/upload')) {
        return Promise.resolve({
          data: { code: 'OK', message: '', result: { files: [] }, success: true },
        });
      }
      return Promise.resolve({
        data: {
          code: 'OK',
          message: '',
          result: {
            edges: [],
            nodes: [
              {
                activationWeek: 3,
                activeLevel: 1,
                description: '서버가 발급하는 자가 검증 가능한 인증 토큰',
                id: 1,
                recommendWeek: 0,
                title: 'JWT',
              },
            ],
          },
          success: true,
        },
      });
    });

    renderStudyRoute('/studies/spring-study/knowledge');

    await waitFor(() => screen.getByRole('button', { name: 'JWT 노드' }));
    fireEvent.click(screen.getByRole('button', { name: 'JWT 노드' }));

    await waitFor(() => screen.getByRole('button', { name: /JWT 정리 노트/ }));
    fireEvent.click(screen.getByRole('button', { name: /JWT 정리 노트/ }));

    expect(screen.getByRole('region', { name: '자료 업로드' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: '현재 경로' })).toHaveTextContent(
      '/studies/spring-study/upload?materialId=7',
    );
  });
});

describe('StudyPage questions route', () => {
  it('질문함 경로에서 질문 목록을 표시한다', () => {
    renderStudyRoute('/studies/spring-study/questions');

    expect(screen.getByRole('region', { name: '질문함' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '질문 작성' })).toBeInTheDocument();
  });

  it('종료된 스터디의 질문함을 읽기 전용으로 표시한다', () => {
    renderStudyRoute('/studies/ended-study/questions');

    expect(screen.getByRole('region', { name: '질문함' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '질문 작성' })).not.toBeInTheDocument();
  });
});

describe('StudyPage reports route', () => {
  it('최신 리포트를 조회하고 선택한 주차를 다시 조회한다', async () => {
    vi.mocked(httpClient.get).mockImplementation((_url: string, config) =>
      Promise.resolve(createWeeklyReportResponse(config?.params?.week ?? 3)),
    );

    renderStudyRoute('/studies/1/reports');

    expect(
      await screen.findByRole('heading', { level: 1, name: '3주차 리포트' }),
    ).toBeInTheDocument();
    expect(httpClient.get).toHaveBeenCalledWith('/api/study/1/report/all', {
      params: undefined,
    });

    fireEvent.click(screen.getByRole('button', { name: '2주차' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: '2주차 리포트' }),
    ).toBeInTheDocument();
    expect(httpClient.get).toHaveBeenCalledWith('/api/study/1/report/all', {
      params: { week: 2 },
    });
  });

  it('숫자가 아닌 스터디 ID에서는 리포트를 요청하지 않는다', async () => {
    renderStudyRoute('/studies/spring-study/reports');

    expect(await screen.findByText('주소의 스터디 ID를 확인해 주세요.')).toBeInTheDocument();
    expect(
      vi.mocked(httpClient.get).mock.calls.some(([url]) => String(url).includes('/report/all')),
    ).toBe(false);
  });

  it('실패한 리포트를 재시도하는 동안 로딩 상태를 표시한다', async () => {
    let resolveRetry: ((value: ReturnType<typeof createWeeklyReportResponse>) => void) | undefined;
    const retryResponse = new Promise<ReturnType<typeof createWeeklyReportResponse>>((resolve) => {
      resolveRetry = resolve;
    });

    let reportRequestCount = 0;
    vi.mocked(httpClient.get).mockImplementation((url: string) => {
      if (!url.includes('/report/all')) {
        return Promise.resolve({
          data: { code: 'OK', errorDetail: null, message: '', result: [], success: true },
        });
      }

      reportRequestCount += 1;
      return reportRequestCount === 1 ? Promise.reject(new Error('Network Error')) : retryResponse;
    });

    renderStudyRoute('/studies/1/reports');

    expect(await screen.findByText('주차별 리포트를 불러오지 못했습니다')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    await waitFor(() => expect(reportRequestCount).toBe(2));
    expect(await screen.findByText('주차별 리포트를 불러오는 중입니다')).toBeInTheDocument();

    act(() => resolveRetry?.(createWeeklyReportResponse(3)));

    expect(
      await screen.findByRole('heading', { level: 1, name: '3주차 리포트' }),
    ).toBeInTheDocument();
  });

  it('종료된 스터디의 리포트를 읽기 전용으로 표시한다', () => {
    renderStudyRoute('/studies/ended-study/reports');

    expect(
      screen.getByText('종료된 스터디입니다. 주차별 리포트를 읽기 전용으로 확인할 수 있습니다.'),
    ).toBeInTheDocument();
  });
});

describe('StudyPage weekly records route', () => {
  it('does not request weekly records for a non-numeric study ID', async () => {
    renderStudyRoute('/studies/spring-study/records');

    expect(await screen.findByText('유효하지 않은 스터디 ID입니다.')).toBeInTheDocument();
    expect(
      vi.mocked(httpClient.get).mock.calls.some(([url]) => String(url).includes('/active-nodes')),
    ).toBe(false);
  });

  it('loads weekly nodes and fetches materials when a node is expanded', async () => {
    vi.mocked(httpClient.get).mockImplementation((url: string) => {
      if (url.endsWith('/active-nodes')) {
        return Promise.resolve({
          data: {
            code: 'NODE200_1',
            errorDetail: null,
            isSuccess: true,
            message: '주차별 활성 노드를 조회했습니다.',
            result: {
              nodes: [{ activationWeek: 1, activeLevel: 1, studyNodeId: 10, title: 'JWT' }],
            },
          },
        });
      }

      if (url.endsWith('/node/10/info')) {
        return Promise.resolve({
          data: {
            code: 'NODE200_2',
            errorDetail: null,
            isSuccess: true,
            message: '노드 자료를 조회했습니다.',
            result: {
              materials: [
                {
                  createdAt: '2026-03-15T10:30:00',
                  dataTitle: 'JWT 정리 노트',
                  presignedUrl: 'https://example.com/jwt.md',
                  studyMaterialId: 20,
                  updatedAt: '2026-03-15T10:30:00',
                  uploaderName: '김철수',
                },
              ],
              studyNodeId: 10,
            },
          },
        });
      }

      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    renderStudyRoute('/studies/1/records');

    const nodeButton = await screen.findByRole('button', { name: /JWT/ });

    expect(httpClient.get).toHaveBeenCalledWith('/api/study/1/active-nodes', {
      params: { week: 1 },
    });

    fireEvent.click(nodeButton);

    expect(await screen.findByText('JWT 정리 노트')).toBeInTheDocument();
    expect(httpClient.get).toHaveBeenCalledWith('/api/study/1/node/10/info');
  });
});

describe('StudyPage questions route', () => {
  it('질문함 경로에서 질문 목록과 작성 기능을 표시한다', () => {
    renderStudyRoute('/studies/spring-study/questions');

    expect(screen.getByRole('button', { name: '질문 작성' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: '질문 목록' })).toBeInTheDocument();
    expect(screen.getByText('Refresh Token 저장 위치가 궁금합니다')).toBeInTheDocument();
  });

  it('종료된 스터디의 질문함을 읽기 전용으로 표시한다', () => {
    renderStudyRoute('/studies/ended-study/questions');

    expect(screen.getByRole('list', { name: '질문 목록' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '질문 작성' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Refresh Token 저장 위치가 궁금합니다/ }));

    expect(screen.queryByRole('button', { name: '답글 작성' })).not.toBeInTheDocument();
    expect(screen.getByText('서버의 토큰 재발급 정책도 같이 정리해볼게요.')).toBeInTheDocument();
  });
});
