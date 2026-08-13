// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  consumePendingAuthRedirect,
  getSafeRedirectPath,
  PENDING_AUTH_REDIRECT_KEY,
  savePendingAuthRedirect,
} from './auth_redirect';

beforeEach(() => {
  window.sessionStorage.clear();
});

describe('auth redirect', () => {
  it('stores and consumes an internal invite path once', () => {
    savePendingAuthRedirect('/invite/invite-token');

    expect(window.sessionStorage.getItem(PENDING_AUTH_REDIRECT_KEY)).toBe('/invite/invite-token');
    expect(consumePendingAuthRedirect()).toBe('/invite/invite-token');
    expect(consumePendingAuthRedirect()).toBeNull();
  });

  it('rejects external and backslash redirect paths', () => {
    expect(getSafeRedirectPath('//evil.example')).toBe('/');
    expect(getSafeRedirectPath('/\\evil.example')).toBe('/');

    savePendingAuthRedirect('//evil.example');

    expect(window.sessionStorage.getItem(PENDING_AUTH_REDIRECT_KEY)).toBeNull();
  });

  it('fails safely when session storage is unavailable', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    expect(consumePendingAuthRedirect()).toBeNull();
    expect(getItemSpy).toHaveBeenCalledOnce();
  });
});
