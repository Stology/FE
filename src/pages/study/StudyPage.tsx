import { Navigate, useParams } from 'react-router-dom';

import {
  getMockStudyById,
  getMockStudyTabById,
  mockStudyContainer,
  mockStudyTabs,
} from '@/shared/mocks/studies';
import { AppLayout, Card, Header, PagePlaceholder, Tabs } from '@/shared/ui';

interface StudyRouteParams extends Record<string, string | undefined> {
  studyId: string;
  tab?: string;
}

export const StudyPage = () => {
  const { studyId, tab = 'knowledge' } = useParams<StudyRouteParams>();

  if (!studyId) {
    return <Navigate to="/" replace />;
  }

  const study = getMockStudyById(studyId);
  const meta = getMockStudyTabById(tab) ?? {
    code: mockStudyContainer.code,
    label: mockStudyContainer.title,
  };

  return (
    <AppLayout>
      <Card className="p-6">
        <Header code={mockStudyContainer.code} title={study?.name ?? mockStudyContainer.title} />
        <Tabs
          className="mt-6"
          items={mockStudyTabs.map((studyTab) => ({
            id: studyTab.id,
            label: studyTab.label,
            to: `/studies/${studyId}/${studyTab.id}`,
          }))}
        />
      </Card>
      <PagePlaceholder code={meta.code} className="min-h-[calc(100vh-260px)]" title={meta.label} />
    </AppLayout>
  );
};
