import { useEffect, useState } from 'react';
import { PenLine } from 'lucide-react';

import { mockQuestions } from '@/shared/mocks/questions';
import type { QuestionSummary } from '@/shared/types/stology';
import { Button } from '@/shared/ui';

import { QuestionListItem } from './QuestionListItem';
import { QuestionPagination } from './QuestionPagination';

interface QuestionsPageProps {
  onPageChange?: (page: number) => void;
  onQuestionCreate?: () => void;
  onQuestionSelect?: (questionId: string) => void;
  page?: number;
  pageSize?: number;
  questions?: QuestionSummary[];
}

export const QuestionsPage = ({
  onPageChange,
  onQuestionCreate,
  onQuestionSelect,
  page,
  pageSize = 3,
  questions = mockQuestions,
}: QuestionsPageProps) => {
  const totalPages = Math.max(1, Math.ceil(questions.length / pageSize));
  const [internalPage, setInternalPage] = useState(1);
  const requestedPage = page ?? internalPage;
  const activePage = Math.min(Math.max(requestedPage, 1), totalPages);
  const visibleQuestions = questions.slice((activePage - 1) * pageSize, activePage * pageSize);

  useEffect(() => {
    if (page !== undefined) return;
    setInternalPage((currentPage) => Math.min(Math.max(currentPage, 1), totalPages));
  }, [page, totalPages]);

  const handlePageChange = (nextPage: number) => {
    if (page === undefined) setInternalPage(nextPage);
    onPageChange?.(nextPage);
  };

  return (
    <section
      aria-label="질문함"
      className="min-h-[520px] rounded-b-lg border border-stology-border-light bg-white px-4 py-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10"
    >
      <div className="w-full max-w-[1534px]">
        <div className="mb-2.5 flex items-center justify-between gap-4">
          <p className="text-[11px] leading-[16.5px] text-stology-text-light">최신순 고정 정렬</p>
          <Button
            className="bg-stology-deep-navy hover:bg-stology-royal-blue"
            leftIcon={<PenLine aria-hidden size={14} />}
            onClick={onQuestionCreate}
          >
            질문 작성
          </Button>
        </div>

        <ul className="space-y-2" aria-label="질문 목록">
          {visibleQuestions.map((question) => (
            <QuestionListItem key={question.id} onSelect={onQuestionSelect} question={question} />
          ))}
        </ul>

        <QuestionPagination
          onPageChange={handlePageChange}
          page={activePage}
          totalPages={totalPages}
        />
      </div>
    </section>
  );
};
