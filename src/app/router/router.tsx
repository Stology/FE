import { createBrowserRouter, Navigate } from 'react-router-dom';

import { HomePage } from '@/pages/home/HomePage';
import { InvitePage } from '@/pages/invite/InvitePage';
import { LoginPage } from '@/pages/login/LoginPage';
import { ReviewPage } from '@/pages/review/ReviewPage';
import { StudyPage } from '@/pages/study/StudyPage';

import { AuthGuard } from './AuthGuard';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/invite/:token',
    element: <InvitePage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/studies/:studyId',
        element: <Navigate to="knowledge" replace />,
      },
      {
        path: '/studies/:studyId/:tab',
        element: <StudyPage />,
      },
      {
        path: '/studies/:studyId/review/:materialId',
        element: <ReviewPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
