import { RouterProvider } from 'react-router-dom';

import { AppProvider } from './providers/AppProvider';
import { router } from './router/router';

export const App = () => (
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
);
