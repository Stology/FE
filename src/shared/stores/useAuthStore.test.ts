// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authApi } from '@/shared/api/auth';

import { MOCK_AUTH_STORAGE_KEY, useAuthStore } from './useAuthStore';

vi.mock('@/shared/api/auth', () => ({
  authApi: { logout: vi.fn(), reissue: vi.fn() },
}));

beforeEach(() => {
  window.sessionStorage.clear();
  useAuthStore.setState({ isAuthenticated: false, isInitialized: false });
  vi.mocked(authApi.reissue).mockRejectedValue(new Error('No refresh session'));
});

afterEach(() => {
  vi.restoreAllMocks();
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

  it('Mock 인증이 비활성화되면 저장된 상태를 인증에 사용하지 않는다', async () => {
    vi.stubEnv('VITE_ENABLE_MOCK_AUTH', 'false');
    window.sessionStorage.setItem(MOCK_AUTH_STORAGE_KEY, 'true');

    await useAuthStore.getState().initialize();

    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: false,
      isInitialized: true,
      memberId: null,
    });
  });

  it('재발급이 성공하면 accessToken과 memberId를 저장한다', async () => {
    vi.stubEnv('VITE_ENABLE_MOCK_AUTH', 'false');
    vi.mocked(authApi.reissue).mockResolvedValue({ accessToken: 'real-token', userId: 7 });

    await useAuthStore.getState().initialize();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'real-token',
      isAuthenticated: true,
      isInitialized: true,
      memberId: 7,
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

  it('저장소 조회가 차단되어도 로그아웃 상태로 초기화한다', async () => {
    vi.stubEnv('VITE_ENABLE_MOCK_AUTH', 'true');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage access denied', 'SecurityError');
    });

    await expect(useAuthStore.getState().initialize()).resolves.toBeUndefined();
    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: false,
      isInitialized: true,
    });
  });

  it('저장소 쓰기와 삭제가 차단되어도 로그인과 로그아웃을 처리한다', () => {
    vi.stubEnv('VITE_ENABLE_MOCK_AUTH', 'true');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage access denied', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Storage access denied', 'SecurityError');
    });

    expect(() => useAuthStore.getState().login()).not.toThrow();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    expect(() => useAuthStore.getState().logout()).not.toThrow();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
