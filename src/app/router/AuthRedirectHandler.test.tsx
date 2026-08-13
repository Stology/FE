// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { PENDING_AUTH_REDIRECT_KEY, savePendingAuthRedirect } from '@/shared/lib/auth_redirect';
import { useAuthStore } from '@/shared/stores/useAuthStore';

import { AuthRedirectHandler } from './AuthRedirectHandler';

beforeEach(() => {
  window.sessionStorage.clear();
  useAuthStore.setState({ isAuthenticated: false, isInitialized: false });
});

afterEach(cleanup);

describe('AuthRedirectHandler', () => {
  it('restores a pending invite path after authentication initializes', async () => {
    savePendingAuthRedirect('/invite/invite-token');
    useAuthStore.setState({ isAuthenticated: true, isInitialized: true });

    renderAuthRedirectHandler();

    await waitFor(() => expect(screen.getByText('invite page')).toBeInTheDocument());
    expect(window.sessionStorage.getItem(PENDING_AUTH_REDIRECT_KEY)).toBeNull();
  });

  it('keeps the current page until authentication succeeds', () => {
    savePendingAuthRedirect('/invite/invite-token');

    renderAuthRedirectHandler();

    expect(screen.getByText('home page')).toBeInTheDocument();
    expect(window.sessionStorage.getItem(PENDING_AUTH_REDIRECT_KEY)).toBe('/invite/invite-token');
  });
});

function renderAuthRedirectHandler() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AuthRedirectHandler />}>
          <Route path="/" element={<span>home page</span>} />
          <Route path="/invite/:token" element={<span>invite page</span>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}
