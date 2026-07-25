import { ImageIcon } from 'lucide-react';

import type { QuestionSummary } from '@/shared/types/stology';

interface QuestionListItemProps {
  onSelect?: (questionId: string) => void;
  question: QuestionSummary;
}

export const QuestionListItem = ({ onSelect, question }: QuestionListItemProps) => (
  <li>
    <button
      className="flex min-h-[58px] w-full flex-col justify-center gap-1.5 rounded-[5.5px] border border-stology-border-light bg-white px-[18px] py-3 text-left transition hover:border-stology-light-blue hover:bg-stology-off-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stology-electric-blue sm:flex-row sm:items-center sm:justify-between sm:gap-6"
      onClick={() => onSelect?.(question.id)}
      type="button"
    >
      <span className="min-w-0 break-words text-[16px] font-semibold leading-6 text-stology-text-dark">
        {question.title}
      </span>
      <span className="flex shrink-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] leading-[16.5px] text-stology-text-light">
        <span>{question.authorName}</span>
        <span aria-hidden>·</span>
        <time dateTime={question.createdAt}>{question.createdAt}</time>
        <span aria-hidden>·</span>
        <span>답글 {question.replyCount}</span>
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
  </li>
);
