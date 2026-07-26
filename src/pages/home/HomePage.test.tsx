// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '@/shared/api/http_client';

import { HomePage } from './HomePage';

vi.mock('@/shared/api/http_client', () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('HomePage empty states', () => {
  it('요청 중에는 각 영역의 로딩 상태를 빈 상태보다 먼저 표시한다', () => {
    vi.mocked(httpClient.get).mockReturnValue(new Promise(() => undefined));

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText('스터디 목록을 불러오는 중입니다')).toBeInTheDocument();
    expect(screen.getByText('내 할 일을 불러오는 중입니다')).toBeInTheDocument();
    expect(screen.getByText('팀 활동을 불러오는 중입니다')).toBeInTheDocument();
    expect(screen.queryByText('아직 진행 중인 스터디가 없습니다.')).not.toBeInTheDocument();
    expect(screen.queryByText('지금 확인할 항목이 없습니다.')).not.toBeInTheDocument();
    expect(screen.queryByText('아직 팀 활동이 없습니다.')).not.toBeInTheDocument();
  });

  it('요청에 실패하면 각 영역의 오류 상태를 fallback 데이터보다 먼저 표시한다', async () => {
    vi.mocked(httpClient.get).mockRejectedValue(new Error('네트워크 연결을 확인해주세요.'));

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByRole('alert')).toHaveLength(3);
    });

    expect(screen.getByText('스터디 목록을 불러오지 못했습니다')).toBeInTheDocument();
    expect(screen.getByText('내 할 일을 불러오지 못했습니다')).toBeInTheDocument();
    expect(screen.getByText('팀 활동을 불러오지 못했습니다')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /백엔드 마스터/ })).not.toBeInTheDocument();
    expect(screen.queryByText('검토 5 · 재업로드 2')).not.toBeInTheDocument();
  });

  it('홈 데이터가 없으면 명세에 정의된 빈 상태와 스터디 생성 진입점을 표시한다', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('아직 진행 중인 스터디가 없습니다.')).toBeInTheDocument();
    });

    expect(screen.getByText('지금 확인할 항목이 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('아직 팀 활동이 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /스터디 생성/ })).toBeInTheDocument();
  });
});
