// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCK_AUTH_STORAGE_KEY, useAuthStore } from './useAuthStore';

beforeEach(() => {
  window.sessionStorage.clear();
  useAuthStore.setState({ isAuthenticated: false, isInitialized: false });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('useAuthStore', () => {
  it('Mock 로그인 상태를 현재 브라우저 세션에 저장한다', () => {
    vi.stubEnv('VITE_ENABLE_MOCK_AUTH', 'true');

    useAuthStore.getState().login();

    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: true,
      isInitialized: true,
    });
    expect(window.sessionStorage.getItem(MOCK_AUTH_STORAGE_KEY)).toBe('true');
  });

  it('앱 초기화 시 저장된 Mock 로그인 상태를 복원한다', () => {
    vi.stubEnv('VITE_ENABLE_MOCK_AUTH', 'true');
    window.sessionStorage.setItem(MOCK_AUTH_STORAGE_KEY, 'true');

    useAuthStore.getState().initialize();

    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it('Mock 인증이 비활성화되면 저장된 상태를 인증에 사용하지 않는다', () => {
    vi.stubEnv('VITE_ENABLE_MOCK_AUTH', 'false');
    window.sessionStorage.setItem(MOCK_AUTH_STORAGE_KEY, 'true');

    useAuthStore.getState().initialize();

    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: false,
      isInitialized: true,
    });
  });

  it('로그아웃하면 인증 상태와 저장된 세션을 제거한다', () => {
    vi.stubEnv('VITE_ENABLE_MOCK_AUTH', 'true');
    useAuthStore.getState().login();

    useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: false,
      isInitialized: true,
    });
    expect(window.sessionStorage.getItem(MOCK_AUTH_STORAGE_KEY)).toBeNull();
  });
});
