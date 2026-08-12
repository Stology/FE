import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export const Pagination = ({ onPageChange, page, totalPages }: PaginationProps) => (
  <div className="flex items-center justify-center gap-2">
    <Button
      aria-label="이전 페이지"
      disabled={page <= 1}
      onClick={() => onPageChange?.(page - 1)}
      size="icon"
      variant="outline"
    >
      <ChevronLeft size={16} aria-hidden />
    </Button>
    <span className="min-w-16 text-center text-label text-stology-text-light">
      {page} / {totalPages}
    </span>
    <Button
      aria-label="다음 페이지"
      disabled={page >= totalPages}
      onClick={() => onPageChange?.(page + 1)}
      size="icon"
      variant="outline"
    >
      <ChevronRight size={16} aria-hidden />
    </Button>
  </div>
);
