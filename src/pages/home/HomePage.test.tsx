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
