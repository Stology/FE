import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { Settings } from 'lucide-react';

import { useStudyDetail, useToast } from '@/shared/hooks';
import { getMockStudyTabById, mockStudyTabs } from '@/shared/mocks/studies';
import { studyApi } from '@/shared/api/study';
import type { Study } from '@/shared/types/stology';
import {
  AppLayout,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Header,
  Loading,
  PagePlaceholder,
  Tabs,
} from '@/shared/ui';
import { StudySettingsModal } from './components/StudySettingsModal';

import { useKnowledgeGraph } from './knowledge/hooks';
import { KnowledgeGraphPage } from './knowledge/KnowledgeGraphPage';
import { useQuestionDetails, useQuestions } from './questions/hooks/useQuestions';
import { useQuestionMutations } from './questions/hooks/useQuestionMutations';
import { buildQuestionMutationContent } from './questions/model/question_mutation_content';
import { QuestionsPage } from './questions/QuestionsPage';
import { WeeklyRecordsPage } from './records/WeeklyRecordsPage';
import { useWeeklyRecords } from './records/hooks/useWeeklyRecords';
import { WeeklyReportPage } from './reports/WeeklyReportPage';
import { useWeeklyReport } from './reports/hooks/useWeeklyReport';
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    startedAt: studyData.startDate ?? '',
    memberCount: studyData.members?.length ?? 0,
    members: studyData.members ?? [],
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <Settings className="w-4 h-4" />
                  설정
                </Button>
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
              </div>
            ) : undefined
          }
        >
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-stology-text-dark">
            <Badge variant={study.status === 'active' ? 'primary' : 'neutral'} className="h-[22px]">
              {study.status === 'active' ? '진행 중' : '종료됨'}
            </Badge>
            {study.status === 'active' && (
              <>
                <div className="h-3 w-px bg-stology-border-light" />
                <Badge variant="week" className="h-[22px]">
                  {study.currentWeek}주차
                </Badge>
              </>
            )}
            {study.startedAt && (
              <>
                <div className="h-3 w-px bg-stology-border-light" />
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-stology-text-light">시작일</span>
                  <span>{study.startedAt.replace(/-/g, '.')}</span>
                </div>
              </>
            )}
            {study.members.length > 0 && (
              <>
                <div className="h-3 w-px bg-stology-border-light" />
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stology-text-light">참여자</span>
                  <div className="flex -space-x-1.5">
                    {study.members.slice(0, 5).map((member, i) => (
                      <Avatar key={i} name={member} size="sm" className="ring-2 ring-white" />
                    ))}
                    {study.members.length > 5 && (
                      <div className="flex size-7 items-center justify-center rounded-full bg-stology-off-white text-[10px] font-semibold text-stology-text-light ring-2 ring-white z-10 relative">
                        +{study.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </Header>
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

      {isSettingsOpen && (
        <StudySettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          studyId={study.id}
          studyName={study.name}
          startDate={studyData.startDate}
          description={studyData.description}
          reviewerCount={studyData.reviewerCount}
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
  const recordsStudyId = /^\d+$/.test(study.id) ? study.id : undefined;
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

  const recordsQuery = useWeeklyRecords(recordsStudyId, selectedWeek);

  return (
    <WeeklyRecordsPage
      availableWeeks={availableWeeks}
      concepts={recordsQuery.data ?? []}
      errorMessage={
        recordsStudyId
          ? recordsQuery.error
            ? '잠시 후 다시 시도해 주세요.'
            : null
          : '유효하지 않은 스터디 ID입니다.'
      }
      isLoading={recordsQuery.isLoading}
      isReadOnly={study.status === 'ended'}
      onRetry={recordsStudyId ? () => recordsQuery.refetch() : undefined}
      onWeekChange={setSelectedWeek}
      selectedWeek={selectedWeek}
      studyId={recordsStudyId}
    />
  );
};

interface WeeklyReportTabProps {
  study: Study;
}

const WeeklyReportTab = ({ study }: WeeklyReportTabProps) => {
  const reportStudyId = /^\d+$/.test(study.id) ? study.id : undefined;
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>();
  const reportQuery = useWeeklyReport(reportStudyId, selectedWeek);
  const availableWeeks = useMemo(
    () =>
      Array.from(
        { length: Math.max(0, reportQuery.data?.totalWeeks ?? 0) },
        (_, index) => index + 1,
      ),
    [reportQuery.data?.totalWeeks],
  );

  const isReportNotFound =
    isAxiosError(reportQuery.error) && reportQuery.error.response?.status === 404;

  return (
    <WeeklyReportPage
      availableWeeks={availableWeeks}
      errorMessage={
        reportStudyId
          ? reportQuery.error && !isReportNotFound
            ? '잠시 후 다시 시도해 주세요.'
            : null
          : '주소의 스터디 ID를 확인해 주세요.'
      }
      isLoading={reportQuery.isLoading || reportQuery.isFetching}
      isReadOnly={study.status === 'ended'}
      onRetry={reportStudyId ? () => reportQuery.refetch() : undefined}
      onWeekChange={setSelectedWeek}
      report={reportQuery.data?.report}
      selectedWeek={selectedWeek}
    />
  );
};

interface QuestionsTabProps {
  study: Study;
}

const QUESTIONS_PAGE_SIZE = 10;

const QuestionsTab = ({ study }: QuestionsTabProps) => {
  const questionsStudyId = /^\d+$/.test(study.id) ? study.id : undefined;
  const [page, setPage] = useState(1);
  const [requestedQuestionIds, setRequestedQuestionIds] = useState<string[]>([]);
  const questionsQuery = useQuestions(questionsStudyId, page - 1, QUESTIONS_PAGE_SIZE);
  const detailQueries = useQuestionDetails(questionsStudyId, requestedQuestionIds);
  const {
    createAnswerMutation,
    createQuestionMutation,
    deleteAnswerMutation,
    deleteQuestionMutation,
    updateAnswerMutation,
    updateQuestionMutation,
  } = useQuestionMutations(questionsStudyId);

  const questionDetails = Object.fromEntries(
    requestedQuestionIds.flatMap((questionId, index) => {
      const detail = detailQueries[index]?.data;
      return detail ? [[questionId, detail]] : [];
    }),
  );
  const questionDetailStates = Object.fromEntries(
    requestedQuestionIds.map((questionId, index) => {
      const detailQuery = detailQueries[index];

      return [
        questionId,
        {
          errorMessage: detailQuery?.error ? '잠시 후 다시 시도해 주세요.' : null,
          isLoading: Boolean(detailQuery?.isLoading || detailQuery?.isFetching),
          onRetry: detailQuery ? () => detailQuery.refetch() : undefined,
        },
      ];
    }),
  );

  const handlePageChange = (nextPage: number) => {
    setRequestedQuestionIds([]);
    setPage(nextPage);
  };

  const handleQuestionSelect = (questionId: string) => {
    setRequestedQuestionIds((currentIds) =>
      currentIds.includes(questionId) ? currentIds : [...currentIds, questionId],
    );
  };

  async function handleQuestionCreate(values: { content: string; images: File[]; title: string }) {
    await createQuestionMutation.mutateAsync({
      ...values,
      content: buildQuestionMutationContent(values.content, [], values.images),
    });
    setPage(1);
  }

  async function handleQuestionUpdate(
    questionId: string,
    values: { content: string; images: File[]; title: string },
  ) {
    await updateQuestionMutation.mutateAsync({
      ...values,
      content: buildQuestionMutationContent(
        values.content,
        questionDetails[questionId]?.images ?? [],
        values.images,
      ),
      questionId,
    });
  }

  async function handleQuestionDelete(questionId: string) {
    await deleteQuestionMutation.mutateAsync(questionId);
    setRequestedQuestionIds((currentIds) => currentIds.filter((id) => id !== questionId));
  }

  async function handleReplyCreate(questionId: string, content: string, images: File[]) {
    await createAnswerMutation.mutateAsync({
      content: buildQuestionMutationContent(content, [], images),
      images,
      questionId,
    });
  }

  async function handleReplyUpdate(questionId: string, replyId: string, content: string) {
    const reply = questionDetails[questionId]?.replies.find(({ id }) => id === replyId);
    await updateAnswerMutation.mutateAsync({
      answerId: replyId,
      content: buildQuestionMutationContent(content, reply?.images ?? [], []),
      images: [],
      questionId,
    });
  }

  async function handleReplyDelete(questionId: string, replyId: string) {
    await deleteAnswerMutation.mutateAsync({ answerId: replyId, questionId });
  }

  return (
    <QuestionsPage
      canMutate={Boolean(questionsStudyId)}
      errorMessage={
        questionsStudyId
          ? questionsQuery.error
            ? '잠시 후 다시 시도해 주세요.'
            : null
          : '주소의 스터디 ID를 확인해 주세요.'
      }
      isLoading={questionsQuery.isLoading || questionsQuery.isFetching}
      isReadOnly={study.status === 'ended' || questionsQuery.data?.studyEnded === true}
      key={page}
      onPageChange={handlePageChange}
      onQuestionCreate={handleQuestionCreate}
      onQuestionDelete={handleQuestionDelete}
      onQuestionSelect={handleQuestionSelect}
      onQuestionUpdate={handleQuestionUpdate}
      onReplyCreate={handleReplyCreate}
      onReplyDelete={handleReplyDelete}
      onReplyUpdate={handleReplyUpdate}
      onRetry={questionsStudyId ? () => questionsQuery.refetch() : undefined}
      page={page}
      pageSize={QUESTIONS_PAGE_SIZE}
      questionDetails={questionDetails}
      questionDetailStates={questionDetailStates}
      questions={questionsQuery.data?.questions ?? []}
      totalPages={questionsQuery.data?.totalPages ?? 0}
    />
  );
};
