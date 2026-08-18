import { create } from 'zustand';
import { authApi } from '@/shared/api/auth';

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  accessToken: string | null;
  memberId: number | null;
  initialize: () => Promise<void>;
  login: (token?: string) => void;
  logout: () => void;
}

const MOCK_AUTH_STORAGE_KEY = 'stology.mock-authenticated';

let isInitializing = false;

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isInitialized: false,
  accessToken: null,
  memberId: null,
  initialize: async () => {
    if (isInitializing) return;
    isInitializing = true;

    if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
      const hasMockSession = readMockAuthSession();
      set({
        accessToken: hasMockSession ? 'mock-token' : null,
        isAuthenticated: hasMockSession,
        isInitialized: true,
        memberId: null,
      });
      isInitializing = false;
      return;
    }

    try {
      const { accessToken, userId } = await authApi.reissue();
      set((state) => {
        // login()이 initialize() 도중에 먼저 호출된 경우 덮어쓰지 않음
        if (state.isAuthenticated) return {};
        return { accessToken, isAuthenticated: true, isInitialized: true, memberId: userId };
      });
    } catch (error) {
      console.error('Reissue failed:', error);
      set((state) => {
        // login()이 initialize() 도중에 먼저 호출된 경우 덮어쓰지 않음
        if (state.isAuthenticated) return {};
        return { accessToken: null, isAuthenticated: false, isInitialized: true, memberId: null };
      });
    } finally {
      isInitializing = false;
    }
  },
  login: (token?: string) => {
    if (token) {
      let parsedUserId = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        parsedUserId = payload.sub ? parseInt(payload.sub, 10) : null;
      } catch (e) {
        console.error('Failed to parse test token', e);
      }
      set({
        accessToken: token,
        isAuthenticated: true,
        isInitialized: true,
        memberId: parsedUserId,
      });
      return;
    }

    if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
      persistMockAuthSession();
    }

    set({ accessToken: 'mock-token', isAuthenticated: true, isInitialized: true, memberId: null });
  },
  logout: async () => {
    try {
      if (import.meta.env.VITE_ENABLE_MOCK_AUTH !== 'true') {
        await authApi.logout();
      }
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      clearMockAuthSession();
      set({ accessToken: null, isAuthenticated: false, isInitialized: true, memberId: null });
    }
  },
}));

export { MOCK_AUTH_STORAGE_KEY };

function readMockAuthSession() {
  return accessSessionStorage(
    (storage) => storage.getItem(MOCK_AUTH_STORAGE_KEY) === 'true',
    false,
  );
}

function persistMockAuthSession() {
  accessSessionStorage((storage) => storage.setItem(MOCK_AUTH_STORAGE_KEY, 'true'), undefined);
}

function clearMockAuthSession() {
  accessSessionStorage((storage) => storage.removeItem(MOCK_AUTH_STORAGE_KEY), undefined);
}

function accessSessionStorage<Result>(
  operation: (storage: Storage) => Result,
  fallback: Result,
): Result {
  if (typeof window === 'undefined') return fallback;

  try {
    return operation(window.sessionStorage);
  } catch {
    return fallback;
  }
}
