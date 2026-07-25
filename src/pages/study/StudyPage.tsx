import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { useEffect, useMemo, useState } from 'react';

import {
  getMockStudyById,
  getMockStudyTabById,
  mockStudyContainer,
  mockStudyTabs,
} from '@/shared/mocks/studies';
import type { Study } from '@/shared/types/stology';
import { AppLayout, Card, Header, PagePlaceholder, Tabs } from '@/shared/ui';

import { WeeklyRecordsPage } from './records/WeeklyRecordsPage';
import { WeeklyReportPage } from './reports/WeeklyReportPage';
import { MaterialUploadPage } from './upload/MaterialUploadPage';

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
      {tab === 'upload' && study ? (
        <MaterialUploadTab key={study.id} study={study} />
      ) : tab === 'records' && study ? (
        <WeeklyRecordsTab key={study.id} study={study} />
      ) : tab === 'reports' && study ? (
        <WeeklyReportTab key={study.id} study={study} />
      ) : (
        <PagePlaceholder
          code={meta.code}
          className="min-h-[calc(100vh-260px)]"
          title={meta.label}
        />
      )}
    </AppLayout>
  );
};

interface MaterialUploadTabProps {
  study: Study;
}

const MaterialUploadTab = ({ study }: MaterialUploadTabProps) => {
  const navigate = useNavigate();

  return (
    <MaterialUploadPage
      currentWeek={study.currentWeek}
      isReadOnly={study.status === 'ended'}
      onMaterialReview={(material) => navigate(`/studies/${study.id}/review/${material.id}`)}
    />
  );
};

interface WeeklyRecordsTabProps {
  study: Study;
}

const WeeklyRecordsTab = ({ study }: WeeklyRecordsTabProps) => {
  const availableWeeks = useMemo(
    () => Array.from({ length: Math.max(0, study.currentWeek) }, (_, index) => index + 1),
    [study.currentWeek],
  );
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(
    availableWeeks[availableWeeks.length - 1],
  );

  useEffect(() => {
    setSelectedWeek((currentWeek) =>
      currentWeek !== undefined && availableWeeks.includes(currentWeek)
        ? currentWeek
        : availableWeeks[availableWeeks.length - 1],
    );
  }, [availableWeeks]);

  return (
    <WeeklyRecordsPage
      availableWeeks={availableWeeks}
      isReadOnly={study.status === 'ended'}
      onWeekChange={setSelectedWeek}
      selectedWeek={selectedWeek}
    />
  );
};

interface WeeklyReportTabProps {
  study: Study;
}

const WeeklyReportTab = ({ study }: WeeklyReportTabProps) => {
  const availableWeeks = useMemo(
    () => Array.from({ length: Math.max(0, study.currentWeek) }, (_, index) => index + 1),
    [study.currentWeek],
  );
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(
    availableWeeks[availableWeeks.length - 1],
  );

  useEffect(() => {
    setSelectedWeek((currentWeek) =>
      currentWeek !== undefined && availableWeeks.includes(currentWeek)
        ? currentWeek
        : availableWeeks[availableWeeks.length - 1],
    );
  }, [availableWeeks]);

  return (
    <WeeklyReportPage
      availableWeeks={availableWeeks}
      isReadOnly={study.status === 'ended'}
      onWeekChange={setSelectedWeek}
      selectedWeek={selectedWeek}
    />
  );
};
