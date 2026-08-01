import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';

import { useAuthStore } from '@/shared/stores/useAuthStore';
import { ToastViewport } from '@/shared/ui';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});

export const AppProvider = ({ children }: PropsWithChildren) => {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastViewport />
    </QueryClientProvider>
  );
};
