// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCK_AUTH_STORAGE_KEY, useAuthStore } from '@/shared/stores/useAuthStore';

import { AppProvider } from './AppProvider';

beforeEach(() => {
  vi.stubEnv('VITE_ENABLE_MOCK_AUTH', 'true');
  window.sessionStorage.clear();
  useAuthStore.setState({ isAuthenticated: false, isInitialized: false });
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('AppProvider', () => {
  it('앱 시작 시 저장된 인증 상태를 초기화한다', async () => {
    window.sessionStorage.setItem(MOCK_AUTH_STORAGE_KEY, 'true');

    render(
      <AppProvider>
        <span>애플리케이션</span>
      </AppProvider>,
    );

    await waitFor(() =>
      expect(useAuthStore.getState()).toMatchObject({
        isAuthenticated: true,
        isInitialized: true,
      }),
    );
  });
});
