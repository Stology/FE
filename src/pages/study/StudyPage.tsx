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

import { useKnowledgeGraph } from './knowledge/hooks';
import { KnowledgeGraphPage } from './knowledge/KnowledgeGraphPage';
import { QuestionsPage } from './questions/QuestionsPage';
import { WeeklyRecordsPage } from './records/WeeklyRecordsPage';
import { useWeeklyRecords } from './records/hooks/useWeeklyRecords';
import { WeeklyReportPage } from './reports/WeeklyReportPage';
import {
  useAnalyzeMaterial,
  useSubmitMaterial,
  useUpdateMaterial,
  useUploadedMaterials,
  useUploadSSE,
} from './upload/hooks';
import { MaterialUploadPage } from './upload/MaterialUploadPage';

interface StudyRouteParams extends Record<string, string | undefined> {
  studyId: string;
  tab?: string;
}

// 스터디 상세 조회 API가 아직 없어(스터디 CRUD는 김이슬님 담당) mock 목록으로만 이름/주차/
// 종료 여부를 알 수 있다. mock에 없는 studyId(실 서버 전용 등)는 최소한의 기본값으로 렌더링을
// 계속하고, 각 탭의 실제 데이터는 자신의 API 호출로 별도 로딩/에러 처리한다(홈으로 보내지 않음).
const FALLBACK_STUDY_CURRENT_WEEK = 1;

export const StudyPage = () => {
  const { studyId, tab = 'knowledge' } = useParams<StudyRouteParams>();

  if (!studyId) {
    return <Navigate to="/" replace />;
  }

  const study: Study = getMockStudyById(studyId) ?? {
    currentWeek: FALLBACK_STUDY_CURRENT_WEEK,
    id: studyId,
    memberCount: 0,
    name: studyId,
    startedAt: '',
    status: 'active',
  };

  const meta = getMockStudyTabById(tab);
  if (!meta) {
    return <Navigate to={`/studies/${studyId}/knowledge`} replace />;
  }

  return (
    <AppLayout>
      <Card className="p-6">
        <Header code={mockStudyContainer.code} title={study.name} />
        <Tabs
          className="mt-6"
          items={mockStudyTabs.map((studyTab) => ({
            id: studyTab.id,
            label: studyTab.label,
            to: `/studies/${studyId}/${studyTab.id}`,
          }))}
        />
      </Card>
      {tab === 'knowledge' ? (
        <KnowledgeGraphTab key={study.id} study={study} />
      ) : tab === 'upload' ? (
        <MaterialUploadTab key={study.id} study={study} />
      ) : tab === 'questions' ? (
        <QuestionsTab key={study.id} study={study} />
      ) : tab === 'records' ? (
        <WeeklyRecordsTab key={study.id} study={study} />
      ) : tab === 'reports' ? (
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

interface KnowledgeGraphTabProps {
  study: Study;
}

const KnowledgeGraphTab = ({ study }: KnowledgeGraphTabProps) => {
  const navigate = useNavigate();
  const graphQuery = useKnowledgeGraph(study.id);

  return (
    <KnowledgeGraphPage
      availableWeeks={Array.from(
        { length: Math.max(0, study.currentWeek) },
        (_, index) => index + 1,
      )}
      errorMessage={graphQuery.error ? '지식 구조를 불러오지 못했습니다.' : null}
      graph={graphQuery.data}
      isLoading={graphQuery.isLoading}
      isReadOnly={study.status === 'ended'}
      onMaterialOpen={(material) =>
        navigate(`/studies/${study.id}/upload?materialId=${encodeURIComponent(material.id)}`)
      }
      onRetry={() => graphQuery.refetch()}
      studyId={study.id}
    />
  );
};

interface MaterialUploadTabProps {
  study: Study;
}

const MaterialUploadTab = ({ study }: MaterialUploadTabProps) => {
  const navigate = useNavigate();
  const materialsQuery = useUploadedMaterials(study.id, study.currentWeek);
  const submitMaterial = useSubmitMaterial(study.id);
  const updateMaterial = useUpdateMaterial(study.id);
  const analyzeMaterial = useAnalyzeMaterial(study.id);
  useUploadSSE(study.status === 'ended' ? undefined : study.id);

  return (
    <MaterialUploadPage
      currentWeek={study.currentWeek}
      errorMessage={materialsQuery.error ? '대기 중인 자료를 불러오지 못했습니다.' : null}
      isEditSubmitting={updateMaterial.isPending}
      isLoading={materialsQuery.isLoading}
      isReadOnly={study.status === 'ended'}
      isSubmitting={submitMaterial.isPending}
      materials={materialsQuery.data}
      onMaterialEdit={(material, payload) =>
        updateMaterial.mutateAsync({
          content: payload.content,
          dataTitle: payload.title,
          materialId: Number(material.id),
        })
      }
      onMaterialReanalyze={(material) => analyzeMaterial.mutate(Number(material.id))}
      onMaterialReview={() => navigate(`/studies/${study.id}/review`)}
      onRetry={() => materialsQuery.refetch()}
      onSubmit={(draft) => submitMaterial.mutateAsync(draft)}
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

  const recordsQuery = useWeeklyRecords(study.id, selectedWeek);

  return (
    <WeeklyRecordsPage
      availableWeeks={availableWeeks}
      concepts={recordsQuery.data}
      errorMessage={recordsQuery.error ? '주차별 기록을 불러오지 못했습니다.' : null}
      isLoading={recordsQuery.isLoading}
      isReadOnly={study.status === 'ended'}
      onRetry={() => recordsQuery.refetch()}
      onWeekChange={setSelectedWeek}
      selectedWeek={selectedWeek}
      studyId={study.id}
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

interface QuestionsTabProps {
  study: Study;
}

const QuestionsTab = ({ study }: QuestionsTabProps) => (
  <QuestionsPage isReadOnly={study.status === 'ended'} />
);
