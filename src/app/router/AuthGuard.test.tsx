// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/shared/stores/useAuthStore';

import { AuthGuard } from './AuthGuard';

beforeEach(() => {
  useAuthStore.setState({ isAuthenticated: false, isInitialized: false });
});

afterEach(cleanup);

describe('AuthGuard', () => {
  it('인증 상태를 초기화하는 동안 로딩을 표시한다', () => {
    renderAuthGuard('/protected');

    expect(screen.getByText('인증 상태를 확인하는 중입니다.')).toBeInTheDocument();
  });

  it('비로그인 사용자를 기존 목적지와 함께 로그인 화면으로 보낸다', async () => {
    useAuthStore.setState({ isAuthenticated: false, isInitialized: true });

    renderAuthGuard('/protected?week=3');

    await waitFor(() =>
      expect(screen.getByRole('status', { name: '현재 경로' })).toHaveTextContent(
        '/login?redirect=%2Fprotected%3Fweek%3D3',
      ),
    );
  });

  it('인증된 사용자에게 보호된 화면을 표시한다', () => {
    useAuthStore.setState({ isAuthenticated: true, isInitialized: true });

    renderAuthGuard('/protected');

    expect(screen.getByText('보호된 화면')).toBeInTheDocument();
  });
});

const LocationStatus = () => {
  const location = useLocation();
  return (
    <output aria-label="현재 경로">
      {location.pathname}
      {location.search}
    </output>
  );
};

function renderAuthGuard(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<AuthGuard />}>
          <Route path="/protected" element={<span>보호된 화면</span>} />
        </Route>
        <Route
          path="/login"
          element={
            <>
              <span>로그인 화면</span>
              <LocationStatus />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}
