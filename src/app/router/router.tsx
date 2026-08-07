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
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/invite/:token',
        element: <InvitePage />,
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
        path: '/studies/:studyId/review',
        element: <ReviewPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
