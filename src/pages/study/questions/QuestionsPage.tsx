import { useEffect, useState } from 'react';
import { PenLine } from 'lucide-react';

import { mockQuestionDetails, mockQuestions } from '@/shared/mocks/questions';
import type { QuestionDetail, QuestionReply, QuestionSummary } from '@/shared/types/stology';
import { Button, EmptyState } from '@/shared/ui';

import { QuestionDetailPanel } from './QuestionDetailPanel';
import { QuestionFormModal, type QuestionFormValues } from './QuestionFormModal';
import { QuestionListItem } from './QuestionListItem';
import { QuestionPagination } from './QuestionPagination';

interface QuestionsPageProps {
  isReadOnly?: boolean;
  onPageChange?: (page: number) => void;
  onQuestionCreate?: (values: QuestionFormValues) => void;
  onQuestionSelect?: (questionId: string) => void;
  onQuestionUpdate?: (questionId: string, values: QuestionFormValues) => void;
  page?: number;
  pageSize?: number;
  questionDetails?: Record<string, QuestionDetail>;
  questions?: QuestionSummary[];
}

const DEFAULT_PAGE_SIZE = 3;

export const QuestionsPage = ({
  isReadOnly = false,
  onPageChange,
  onQuestionCreate,
  onQuestionSelect,
  onQuestionUpdate,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  questionDetails: controlledQuestionDetails,
  questions: controlledQuestions,
}: QuestionsPageProps) => {
  const validPageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  const [internalQuestions, setInternalQuestions] = useState(mockQuestions);
  const [internalQuestionDetails, setInternalQuestionDetails] = useState(mockQuestionDetails);
  const [questionForm, setQuestionForm] = useState<
    { mode: 'create' } | { mode: 'edit'; questionId: string } | null
  >(null);
  const questions = controlledQuestions ?? internalQuestions;
  const questionDetails = controlledQuestionDetails ?? internalQuestionDetails;
  const totalPages = Math.ceil(questions.length / validPageSize);
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
  const visibleQuestions = questions.slice(
    (activePage - 1) * validPageSize,
    activePage * validPageSize,
  );

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

  const handleReplyCreate = (questionId: string, content: string) => {
    setRepliesByQuestion((currentReplies) => ({
      ...currentReplies,
      [questionId]: [
        ...(currentReplies[questionId] ?? []),
        {
          id: `${questionId}-reply-${crypto.randomUUID()}`,
          authorName: '김스토',
          content,
          createdAt: new Date().toISOString().slice(0, 10),
          isMine: true,
        },
      ],
    }));
  };

  const handleReplyUpdate = (questionId: string, replyId: string, content: string) => {
    setRepliesByQuestion((currentReplies) => ({
      ...currentReplies,
      [questionId]: (currentReplies[questionId] ?? []).map((reply) =>
        reply.id === replyId ? { ...reply, content } : reply,
      ),
    }));
  };

  const handleQuestionSubmit = (values: QuestionFormValues) => {
    if (questionForm?.mode === 'edit') {
      const { questionId } = questionForm;

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
      onQuestionUpdate?.(questionId, values);
      return;
    }

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
    onQuestionCreate?.(values);
  };

  const editingQuestion =
    questionForm?.mode === 'edit' ? questionDetails[questionForm.questionId] : undefined;

  return (
    <>
      <section
        aria-label="질문함"
        className="min-h-[520px] rounded-b-lg border border-stology-border-light bg-white px-4 py-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10"
      >
        <div className="w-full max-w-[1534px]">
          <div className="mb-2.5 flex items-center justify-between gap-4">
            <p className="text-[11px] leading-[16.5px] text-stology-text-light">최신순 고정 정렬</p>
            {!isReadOnly ? (
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
                    replyCount={(repliesByQuestion[question.id] ?? []).length}
                  >
                    {questionDetails[question.id] ? (
                      <QuestionDetailPanel
                        detail={questionDetails[question.id]}
                        isReadOnly={isReadOnly}
                        onQuestionEdit={() =>
                          setQuestionForm({ mode: 'edit', questionId: question.id })
                        }
                        onReplyCreate={(content) => handleReplyCreate(question.id, content)}
                        onReplyUpdate={(replyId, content) =>
                          handleReplyUpdate(question.id, replyId, content)
                        }
                        replies={repliesByQuestion[question.id] ?? []}
                      />
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
        </div>
      </section>

      <QuestionFormModal
        initialValues={
          editingQuestion
            ? { content: editingQuestion.content, title: editingQuestion.title }
            : undefined
        }
        isOpen={questionForm !== null}
        mode={questionForm?.mode}
        onClose={() => setQuestionForm(null)}
        onSubmit={handleQuestionSubmit}
      />
    </>
  );
};
