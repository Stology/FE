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
  if (typeof window === 'undefined') return false;

  try {
    return window.sessionStorage.getItem(MOCK_AUTH_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistMockAuthSession() {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(MOCK_AUTH_STORAGE_KEY, 'true');
  } catch {
    // Storage can be unavailable while in-memory authentication still works.
  }
}

function clearMockAuthSession() {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
  } catch {
    // Clearing an unavailable storage must not block logout.
  }
}
