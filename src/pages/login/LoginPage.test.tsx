// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { MOCK_AUTH_STORAGE_KEY, useAuthStore } from '@/shared/stores/useAuthStore';

import { LoginPage } from './LoginPage';

beforeEach(() => {
  vi.stubEnv('VITE_ENABLE_MOCK_AUTH', 'true');
  vi.stubEnv('VITE_KAKAO_AUTH_URL', '');
  window.sessionStorage.clear();
  useAuthStore.setState({ isAuthenticated: false, isInitialized: true });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('LoginPage', () => {
  it('Figma 로고를 표시하고 기획 설명 문구는 노출하지 않는다', () => {
    renderLoginPage('/login');

    expect(screen.getByRole('heading', { name: 'Stology' })).toBeInTheDocument();
    expect(screen.queryByText('초대 링크 진입 안내')).not.toBeInTheDocument();
  });

  it('Mock 로그인 후 기존 내부 목적지로 이동한다', () => {
    renderLoginPage('/login?redirect=%2Fstudies%2Fstudy-2%2Fquestions');

    fireEvent.click(screen.getByRole('button', { name: '카카오로 시작하기' }));

    expect(screen.getByText('질문함 화면')).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(window.sessionStorage.getItem(MOCK_AUTH_STORAGE_KEY)).toBe('true');
  });

  it('외부 redirect 주소는 무시하고 홈으로 이동한다', () => {
    renderLoginPage('/login?redirect=%2F%2Fevil.example');

    fireEvent.click(screen.getByRole('button', { name: '카카오로 시작하기' }));

    expect(screen.getByText('홈 화면')).toBeInTheDocument();
  });

  it('인증 설정이 없으면 로그인 안내를 표시하고 현재 화면을 유지한다', () => {
    vi.stubEnv('VITE_ENABLE_MOCK_AUTH', 'false');
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    renderLoginPage('/login');

    fireEvent.click(screen.getByRole('button', { name: '카카오로 시작하기' }));

    expect(alertSpy).toHaveBeenCalledOnce();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

function renderLoginPage(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<span>홈 화면</span>} />
        <Route path="/studies/study-2/questions" element={<span>질문함 화면</span>} />
      </Routes>
    </MemoryRouter>,
  );
}
