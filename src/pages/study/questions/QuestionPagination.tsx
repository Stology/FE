import { cn } from '@/shared/lib/cn';

interface QuestionPaginationProps {
  onPageChange: (page: number) => void;
  page: number;
  totalPages: number;
}

export const QuestionPagination = ({ onPageChange, page, totalPages }: QuestionPaginationProps) => (
  <nav aria-label="질문 목록 페이지" className="flex h-10 items-end justify-center gap-1.5">
    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => {
      const isCurrent = pageNumber === page;

      return (
        <button
          aria-current={isCurrent ? 'page' : undefined}
          aria-label={`${pageNumber}페이지`}
          className={cn(
            'size-8 rounded-[4.5px] border text-[13px] font-semibold leading-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stology-electric-blue',
            isCurrent
              ? 'border-stology-electric-blue bg-stology-electric-blue text-white'
              : 'border-stology-border-light bg-white text-stology-text-dark hover:bg-stology-off-white',
          )}
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          type="button"
        >
          {pageNumber}
        </button>
      );
    })}
  </nav>
);
