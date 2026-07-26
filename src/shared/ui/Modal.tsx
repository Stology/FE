import { X } from 'lucide-react';
import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/shared/lib/cn';

import { Button } from './Button';

interface ModalProps {
  children: ReactNode;
  className?: string;
  description?: string;
  footer?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  title: string;
}

export const Modal = ({
  children,
  className,
  description,
  footer,
  isOpen,
  onClose,
  showCloseButton = false,
  title,
}: ModalProps) => {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,25,47,0.28)] px-4 py-8">
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          'w-full max-w-[440px] rounded-[7.5px] bg-white p-6 shadow-[0_20px_60px_rgba(10,25,47,0.28)]',
          className,
        )}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-heading-2 text-stology-text-dark" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-caption text-stology-text-light" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          {showCloseButton ? (
            <Button
              aria-label="Close"
              className="-mr-2 -mt-2"
              onClick={onClose}
              size="icon"
              variant="ghost"
            >
              <X size={18} aria-hidden />
            </Button>
          ) : null}
        </div>
        <div className="mt-5">{children}</div>
        {footer ? <div className="mt-5 flex justify-end gap-2">{footer}</div> : null}
      </section>
    </div>,
    document.body,
  );
};
