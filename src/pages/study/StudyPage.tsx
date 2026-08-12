import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';

import { useStudyDetail, useToast } from '@/shared/hooks';
import { getMockStudyTabById, mockStudyTabs } from '@/shared/mocks/studies';
import { studyApi } from '@/shared/api/study';
import type { Study } from '@/shared/types/stology';
import {
  AppLayout,
  Button,
  Card,
  EmptyState,
  Header,
  Loading,
  PagePlaceholder,
  Tabs,
} from '@/shared/ui';

import { useKnowledgeGraph } from './knowledge/hooks';
import { KnowledgeGraphPage } from './knowledge/KnowledgeGraphPage';
import { QuestionsPage } from './questions/QuestionsPage';
import { WeeklyRecordsPage } from './records/WeeklyRecordsPage';
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

export const StudyPage = () => {
  const { studyId, tab = 'knowledge' } = useParams<StudyRouteParams>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: studyData, isLoading, error, refetch } = useStudyDetail(studyId);

  const handleDelete = async () => {
    if (!studyData) return;
    if (!window.confirm(`정말 '${studyData.name}' 스터디를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await studyApi.deleteStudy(Number(studyId));
      showToast({ message: '스터디가 삭제되었습니다.', type: 'success' });
      navigate('/');
    } catch {
      showToast({ message: '스터디 삭제에 실패했습니다.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!studyId) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loading label="스터디 정보를 불러오는 중입니다" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    const isUnauthorizedOrNotFound =
      isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 404);

    if (isUnauthorizedOrNotFound) {
      return <Navigate to="/" replace />;
    }

    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <EmptyState
            title="스터디 정보를 불러오지 못했습니다"
            description="일시적인 네트워크 문제이거나 서버 오류일 수 있습니다. 잠시 후 다시 시도해 주세요."
            action={
              <Button onClick={() => void refetch()} variant="outline">
                다시 시도
              </Button>
            }
          />
        </div>
      </AppLayout>
    );
  }

  if (!studyData) {
    return <Navigate to="/" replace />;
  }

  const study: Study = {
    id: String(studyData.studyId),
    name: studyData.name,
    currentWeek: studyData.currentWeek,
    status: studyData.isActive ? 'active' : 'ended',
    startedAt: '',
    memberCount: 0,
  };

  const meta = getMockStudyTabById(tab);
  if (!meta) {
    return <Navigate to={`/studies/${studyId}/knowledge`} replace />;
  }

  const isLeader = studyData.isLeader;

  return (
    <AppLayout>
      <Card className="p-6">
        <Header
          title={study.name}
          actions={
            isLeader && study.status === 'active' ? (
              <Button
                variant="outline"
                size="sm"
                aria-label="스터디 삭제"
                className="border-red-200 text-red-700 hover:bg-red-100"
                disabled={isDeleting}
                onClick={() => {
                  void handleDelete();
                }}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
            ) : undefined
          }
        />
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

interface QuestionsTabProps {
  study: Study;
}

const QuestionsTab = ({ study }: QuestionsTabProps) => (
  <QuestionsPage isReadOnly={study.status === 'ended'} />
);
