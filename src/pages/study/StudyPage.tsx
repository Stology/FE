import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';

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
            ? '주차별 기록을 불러오지 못했습니다.'
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
      useMockFallback={false}
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
