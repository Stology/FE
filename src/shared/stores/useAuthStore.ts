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
    const hasMockSession =
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem(MOCK_AUTH_STORAGE_KEY) === 'true';

    set({
      isAuthenticated: isMockAuthEnabled && hasMockSession,
      isInitialized: true,
    });
  },
  login: () => {
    if (import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true' && typeof window !== 'undefined') {
      window.sessionStorage.setItem(MOCK_AUTH_STORAGE_KEY, 'true');
    }

    set({ isAuthenticated: true, isInitialized: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
    }

    set({ isAuthenticated: false, isInitialized: true });
  },
}));

export { MOCK_AUTH_STORAGE_KEY };
