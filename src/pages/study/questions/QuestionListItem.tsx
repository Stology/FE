import type { ReactNode } from 'react';
import { ChevronDown, ImageIcon } from 'lucide-react';

import type { QuestionSummary } from '@/shared/types/stology';
import { cn } from '@/shared/lib/cn';

interface QuestionListItemProps {
  children?: ReactNode;
  isExpanded: boolean;
  onSelect?: (questionId: string) => void;
  question: QuestionSummary;
  replyCount?: number;
}

export const QuestionListItem = ({
  children,
  isExpanded,
  onSelect,
  question,
  replyCount = question.replyCount,
}: QuestionListItemProps) => {
  const detailId = `question-detail-${question.id}`;

  return (
    <li
      className={cn(
        'overflow-hidden rounded-[5.5px] border bg-white transition',
        isExpanded ? 'border-stology-light-blue' : 'border-stology-border-light',
      )}
    >
      <button
        aria-controls={detailId}
        aria-expanded={isExpanded}
        className="flex min-h-[58px] w-full flex-col justify-center gap-1.5 bg-white px-[18px] py-3 text-left transition hover:bg-stology-off-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-stology-electric-blue sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        onClick={() => onSelect?.(question.id)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          <ChevronDown
            aria-hidden
            className={cn(
              'size-4 shrink-0 text-stology-text-light transition-transform',
              isExpanded && 'rotate-180',
            )}
          />
          <span className="break-words text-[16px] font-semibold leading-6 text-stology-text-dark">
            {question.title}
          </span>
        </span>
        <span className="flex shrink-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] leading-[16.5px] text-stology-text-light">
          <span>{question.authorName}</span>
          <span aria-hidden>·</span>
          <time dateTime={question.createdAt}>{question.createdAt}</time>
          <span aria-hidden>·</span>
          <span>답글 {replyCount}</span>
          {question.hasAttachment ? (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <ImageIcon aria-hidden className="size-3.5" />
                첨부 있음
              </span>
            </>
          ) : null}
        </span>
      </button>
      <div hidden={!isExpanded} id={detailId}>
        {children}
      </div>
    </li>
  );
};
