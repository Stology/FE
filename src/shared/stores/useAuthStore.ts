import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  initialize: () => void;
  login: () => void;
  logout: () => void;
}

const MOCK_AUTH_STORAGE_KEY = 'stology.mock-authenticated';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isInitialized: false,
  initialize: () => {
    const isMockAuthEnabled = import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true';
    const hasMockSession = readMockAuthSession();

    set({
      isAuthenticated: isMockAuthEnabled && hasMockSession,
      isInitialized: true,
    });
  },
  login: () => {
    if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
      persistMockAuthSession();
    }

    set({ isAuthenticated: true, isInitialized: true });
  },
  logout: () => {
    clearMockAuthSession();

    set({ isAuthenticated: false, isInitialized: true });
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
