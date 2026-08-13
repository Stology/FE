export const PENDING_AUTH_REDIRECT_KEY = 'stology-pending-auth-redirect';

export function getSafeRedirectPath(redirectUrl: string | null) {
  if (!redirectUrl?.startsWith('/') || redirectUrl.startsWith('//') || redirectUrl.includes('\\')) {
    return '/';
  }

  return redirectUrl;
}

export function savePendingAuthRedirect(redirectUrl: string | null) {
  const safeRedirectPath = getSafeRedirectPath(redirectUrl);

  accessSessionStorage((storage) => {
    if (safeRedirectPath === '/') {
      storage.removeItem(PENDING_AUTH_REDIRECT_KEY);
      return;
    }

    storage.setItem(PENDING_AUTH_REDIRECT_KEY, safeRedirectPath);
  });
}

export function consumePendingAuthRedirect() {
  return accessSessionStorage((storage) => {
    const redirectUrl = storage.getItem(PENDING_AUTH_REDIRECT_KEY);
    storage.removeItem(PENDING_AUTH_REDIRECT_KEY);

    const safeRedirectPath = getSafeRedirectPath(redirectUrl);
    return safeRedirectPath === '/' ? null : safeRedirectPath;
  });
}

function accessSessionStorage<Result>(operation: (storage: Storage) => Result) {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return operation(window.sessionStorage);
  } catch {
    return null;
  }
}
