import { createBrowserRouter, Navigate } from 'react-router-dom';

import { ComponentPreviewPage } from '@/pages/dev/ComponentPreviewPage';
import { HomePage } from '@/pages/home/HomePage';
import { InvitePage } from '@/pages/invite/InvitePage';
import { LoginPage } from '@/pages/login/LoginPage';
import { ReviewPage } from '@/pages/review/ReviewPage';
import { StudyPage } from '@/pages/study/StudyPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/invite/:token',
    element: <InvitePage />,
  },
  {
    path: '/dev/components',
    element: <ComponentPreviewPage />,
  },
  {
    path: '/dev/components/:section',
    element: <ComponentPreviewPage />,
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
]);
