import { create } from 'zustand';
import { authApi } from '@/shared/api/auth';

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  accessToken: string | null;
  initialize: () => Promise<void>;
  login: () => void;
  logout: () => void;
}

const MOCK_AUTH_STORAGE_KEY = 'stology.mock-authenticated';

let isInitializing = false;

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isInitialized: false,
  accessToken: null,
  initialize: async () => {
    if (isInitializing) return;
    isInitializing = true;

    if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
      const hasMockSession = readMockAuthSession();
      set({
        isAuthenticated: hasMockSession,
        isInitialized: true,
        accessToken: hasMockSession ? 'mock-token' : null,
      });
      isInitializing = false;
      return;
    }

    try {
      const { accessToken } = await authApi.reissue();
      set({ isAuthenticated: true, isInitialized: true, accessToken });
    } catch (error) {
      console.error('Reissue failed:', error);
      set({ isAuthenticated: false, isInitialized: true, accessToken: null });
    } finally {
      isInitializing = false;
    }
  },
  login: () => {
    if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
      persistMockAuthSession();
    }

    set({ isAuthenticated: true, isInitialized: true, accessToken: 'mock-token' });
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
      set({ isAuthenticated: false, isInitialized: true, accessToken: null });
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
