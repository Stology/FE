import { useEffect, useState } from 'react';
import { PenLine, RotateCcw } from 'lucide-react';

import { mockQuestionDetails, mockQuestions } from '@/shared/mocks/questions';
import type { QuestionDetail, QuestionReply, QuestionSummary } from '@/shared/types/stology';
import { Button, ConfirmDialog, EmptyState, ErrorMessage, Loading } from '@/shared/ui';

import { QuestionDetailPanel } from './QuestionDetailPanel';
import { QuestionFormModal, type QuestionFormValues } from './QuestionFormModal';
import { QuestionListItem } from './QuestionListItem';
import { QuestionPagination } from './QuestionPagination';
import { stripQuestionImageTokens } from './model/question_mutation_content';

interface QuestionsPageProps {
  canMutate?: boolean;
  errorMessage?: string | null;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onPageChange?: (page: number) => void;
  onQuestionCreate?: (values: QuestionFormValues) => Promise<void> | void;
  onQuestionDelete?: (questionId: string) => Promise<void> | void;
  onQuestionSelect?: (questionId: string) => void;
  onQuestionUpdate?: (questionId: string, values: QuestionFormValues) => Promise<void> | void;
  onReplyCreate?: (questionId: string, content: string, images: File[]) => Promise<void> | void;
  onReplyDelete?: (questionId: string, replyId: string) => Promise<void> | void;
  onReplyUpdate?: (questionId: string, replyId: string, content: string) => Promise<void> | void;
  onRetry?: () => void;
  page?: number;
  pageSize?: number;
  questionDetailStates?: Record<
    string,
    { errorMessage?: string | null; isLoading: boolean; onRetry?: () => void }
  >;
  questionDetails?: Record<string, QuestionDetail>;
  questions?: QuestionSummary[];
  totalPages?: number;
}

const DEFAULT_PAGE_SIZE = 3;

export const QuestionsPage = ({
  canMutate = true,
  errorMessage,
  isLoading = false,
  isReadOnly = false,
  onPageChange,
  onQuestionCreate,
  onQuestionDelete,
  onQuestionSelect,
  onQuestionUpdate,
  onReplyCreate,
  onReplyDelete,
  onReplyUpdate,
  onRetry,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  questionDetailStates = {},
  questionDetails: controlledQuestionDetails,
  questions: controlledQuestions,
  totalPages: controlledTotalPages,
}: QuestionsPageProps) => {
  const isMutationDisabled = isReadOnly || !canMutate;
  const validPageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  const [internalQuestions, setInternalQuestions] = useState(mockQuestions);
  const [internalQuestionDetails, setInternalQuestionDetails] = useState(mockQuestionDetails);
  const [questionForm, setQuestionForm] = useState<
    { mode: 'create' } | { mode: 'edit'; questionId: string } | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<
    | { questionId: string; type: 'question' }
    | { questionId: string; replyId: string; type: 'reply' }
    | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const questions = controlledQuestions ?? internalQuestions;
  const questionDetails = controlledQuestionDetails ?? internalQuestionDetails;
  const totalPages = controlledTotalPages ?? Math.ceil(questions.length / validPageSize);
  const lastPage = Math.max(1, totalPages);
  const [internalPage, setInternalPage] = useState(1);
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(() => new Set());
  const [repliesByQuestion, setRepliesByQuestion] = useState<Record<string, QuestionReply[]>>(() =>
    Object.fromEntries(
      Object.entries(questionDetails).map(([questionId, detail]) => [questionId, detail.replies]),
    ),
  );
  const requestedPage = page ?? internalPage;
  const activePage = Math.min(Math.max(requestedPage, 1), lastPage);
  const visibleQuestions =
    controlledTotalPages === undefined
      ? questions.slice((activePage - 1) * validPageSize, activePage * validPageSize)
      : questions;

  useEffect(() => {
    if (page !== undefined) return;
    setInternalPage((currentPage) => Math.min(Math.max(currentPage, 1), lastPage));
  }, [lastPage, page]);

  const handlePageChange = (nextPage: number) => {
    if (page === undefined) setInternalPage(nextPage);
    onPageChange?.(nextPage);
  };

  const handleQuestionToggle = (questionId: string) => {
    setExpandedQuestionIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(questionId)) nextIds.delete(questionId);
      else nextIds.add(questionId);
      return nextIds;
    });
    onQuestionSelect?.(questionId);
  };

  async function handleReplyCreate(questionId: string, content: string, images: File[]) {
    await onReplyCreate?.(questionId, content, images);

    if (controlledQuestionDetails === undefined) {
      setRepliesByQuestion((currentReplies) => ({
        ...currentReplies,
        [questionId]: [
          ...(currentReplies[questionId] ?? questionDetails[questionId]?.replies ?? []),
          {
            id: `${questionId}-reply-${crypto.randomUUID()}`,
            authorName: '김스토',
            content,
            createdAt: new Date().toISOString().slice(0, 10),
            isMine: true,
          },
        ],
      }));
    }
  }

  async function handleReplyUpdate(questionId: string, replyId: string, content: string) {
    await onReplyUpdate?.(questionId, replyId, content);

    if (controlledQuestionDetails === undefined) {
      setRepliesByQuestion((currentReplies) => ({
        ...currentReplies,
        [questionId]: (
          currentReplies[questionId] ??
          questionDetails[questionId]?.replies ??
          []
        ).map((reply) => (reply.id === replyId ? { ...reply, content } : reply)),
      }));
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'reply') {
        const { questionId, replyId } = deleteTarget;
        await onReplyDelete?.(questionId, replyId);
        if (controlledQuestionDetails === undefined) {
          setRepliesByQuestion((currentReplies) => ({
            ...currentReplies,
            [questionId]: (currentReplies[questionId] ?? []).filter(
              (reply) => reply.id !== replyId,
            ),
          }));
        }
        setDeleteTarget(null);
        return;
      }

      const { questionId } = deleteTarget;
      await onQuestionDelete?.(questionId);
      if (controlledQuestions === undefined) {
        setInternalQuestions((currentQuestions) =>
          currentQuestions.filter((question) => question.id !== questionId),
        );
      }
      if (controlledQuestionDetails === undefined) {
        setInternalQuestionDetails((currentDetails) => {
          const nextDetails = { ...currentDetails };
          delete nextDetails[questionId];
          return nextDetails;
        });
        setRepliesByQuestion((currentReplies) => {
          const nextReplies = { ...currentReplies };
          delete nextReplies[questionId];
          return nextReplies;
        });
      }
      setExpandedQuestionIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(questionId);
        return nextIds;
      });
      setDeleteTarget(null);
    } catch {
      // The mutation layer reports the error. Keep the dialog open for retry.
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleQuestionSubmit(values: QuestionFormValues) {
    if (questionForm?.mode === 'edit') {
      const { questionId } = questionForm;
      await onQuestionUpdate?.(questionId, values);

      if (controlledQuestions === undefined) {
        setInternalQuestions((currentQuestions) =>
          currentQuestions.map((question) =>
            question.id === questionId
              ? {
                  ...question,
                  hasAttachment: question.hasAttachment || values.images.length > 0,
                  title: values.title,
                }
              : question,
          ),
        );
      }
      if (controlledQuestionDetails === undefined) {
        setInternalQuestionDetails((currentDetails) => ({
          ...currentDetails,
          [questionId]: {
            ...currentDetails[questionId],
            content: values.content,
            hasAttachment: currentDetails[questionId].hasAttachment || values.images.length > 0,
            title: values.title,
          },
        }));
      }
      return;
    }

    await onQuestionCreate?.(values);

    const questionId = `question-${crypto.randomUUID()}`;
    const createdAt = new Date().toISOString().slice(0, 10);
    const question: QuestionSummary = {
      authorName: '김스토',
      createdAt,
      hasAttachment: values.images.length > 0,
      id: questionId,
      isMine: true,
      replyCount: 0,
      title: values.title,
    };

    if (controlledQuestions === undefined) {
      setInternalQuestions((currentQuestions) => [question, ...currentQuestions]);
    }
    if (controlledQuestionDetails === undefined) {
      setInternalQuestionDetails((currentDetails) => ({
        ...currentDetails,
        [questionId]: {
          ...question,
          content: values.content,
          replies: [],
        },
      }));
    }
    setRepliesByQuestion((currentReplies) => ({ ...currentReplies, [questionId]: [] }));
    if (page === undefined) setInternalPage(1);
  }

  const editingQuestion =
    questionForm?.mode === 'edit' ? questionDetails[questionForm.questionId] : undefined;

  const renderQuestionsContent = () => {
    if (isLoading) {
      return (
        <div aria-live="polite" className="min-h-[320px]" role="status">
          <Loading className="min-h-[320px]" label="질문 목록을 불러오는 중입니다" />
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4">
          <div className="w-full max-w-lg" role="alert">
            <ErrorMessage message={errorMessage} title="질문 목록을 불러오지 못했습니다" />
          </div>
          {onRetry ? (
            <Button
              leftIcon={<RotateCcw aria-hidden size={15} />}
              onClick={onRetry}
              variant="outline"
            >
              다시 시도
            </Button>
          ) : null}
        </div>
      );
    }

    return (
      <>
        <div className="mb-2.5 flex items-center justify-between gap-4">
          <p className="text-[11px] leading-[16.5px] text-stology-text-light">최신순 고정 정렬</p>
          {!isMutationDisabled ? (
            <Button
              className="bg-stology-deep-navy hover:bg-stology-royal-blue"
              leftIcon={<PenLine aria-hidden size={14} />}
              onClick={() => setQuestionForm({ mode: 'create' })}
            >
              질문 작성
            </Button>
          ) : null}
        </div>

        {questions.length === 0 ? (
          <EmptyState description="첫 질문을 작성해보세요!" title="아직 질문이 없습니다." />
        ) : (
          <>
            <ul className="space-y-2" aria-label="질문 목록">
              {visibleQuestions.map((question) => (
                <QuestionListItem
                  isExpanded={expandedQuestionIds.has(question.id)}
                  key={question.id}
                  onSelect={handleQuestionToggle}
                  question={question}
                  replyCount={
                    repliesByQuestion[question.id]?.length ??
                    questionDetails[question.id]?.replies.length ??
                    question.replyCount
                  }
                >
                  {questionDetails[question.id] ? (
                    <QuestionDetailPanel
                      detail={questionDetails[question.id]}
                      isReadOnly={isMutationDisabled}
                      onQuestionDelete={() =>
                        setDeleteTarget({ questionId: question.id, type: 'question' })
                      }
                      onQuestionEdit={() =>
                        setQuestionForm({ mode: 'edit', questionId: question.id })
                      }
                      onReplyCreate={(content, images) =>
                        handleReplyCreate(question.id, content, images)
                      }
                      onReplyDelete={(replyId) =>
                        setDeleteTarget({
                          questionId: question.id,
                          replyId,
                          type: 'reply',
                        })
                      }
                      onReplyUpdate={(replyId, content) =>
                        handleReplyUpdate(question.id, replyId, content)
                      }
                      replies={
                        repliesByQuestion[question.id] ?? questionDetails[question.id].replies
                      }
                    />
                  ) : questionDetailStates[question.id]?.isLoading ? (
                    <Loading className="min-h-36" label="질문 상세를 불러오는 중입니다" />
                  ) : questionDetailStates[question.id]?.errorMessage ? (
                    <div className="flex min-h-36 flex-col items-center justify-center gap-3 px-5 py-4">
                      <ErrorMessage
                        message={questionDetailStates[question.id].errorMessage ?? ''}
                        title="질문 상세를 불러오지 못했습니다"
                      />
                      {questionDetailStates[question.id].onRetry ? (
                        <Button
                          onClick={questionDetailStates[question.id].onRetry}
                          size="sm"
                          variant="outline"
                        >
                          다시 시도
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </QuestionListItem>
              ))}
            </ul>

            <QuestionPagination
              onPageChange={handlePageChange}
              page={activePage}
              totalPages={totalPages}
            />
          </>
        )}
      </>
    );
  };

  return (
    <>
      <section
        aria-label="질문함"
        aria-busy={isLoading}
        className="min-h-[520px] rounded-b-lg border border-stology-border-light bg-white px-4 py-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10"
      >
        <div className="w-full max-w-[1534px]">{renderQuestionsContent()}</div>
      </section>

      <QuestionFormModal
        initialValues={
          editingQuestion
            ? {
                content: stripQuestionImageTokens(editingQuestion.content),
                title: editingQuestion.title,
              }
            : undefined
        }
        isOpen={questionForm !== null}
        mode={questionForm?.mode}
        onClose={() => setQuestionForm(null)}
        onSubmit={handleQuestionSubmit}
      />

      <ConfirmDialog
        cancelText="취소"
        confirmText="삭제"
        description={
          deleteTarget?.type === 'question'
            ? '질문과 연결된 답글이 함께 삭제되며 복구할 수 없습니다.'
            : '삭제한 답글은 복구할 수 없습니다.'
        }
        isLoading={isDeleting}
        isOpen={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={
          deleteTarget?.type === 'question'
            ? '질문을 삭제하시겠습니까?'
            : '답글을 삭제하시겠습니까?'
        }
        variant="danger"
      />
    </>
  );
};
