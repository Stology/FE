import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/shared/lib/cn';

import { Button } from './Button';

const focusableSelector =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
  description?: string;
  footer?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  overlayClassName?: string;
  showCloseButton?: boolean;
  title: string;
  titleClassName?: string;
}

export const Modal = ({
  bodyClassName,
  children,
  className,
  description,
  footer,
  isOpen,
  onClose,
  overlayClassName,
  showCloseButton = false,
  title,
  titleClassName,
}: ModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const getFocusableElements = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);

    const initialFocusableElement = getFocusableElements()[0];
    (initialFocusableElement ?? dialog)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,25,47,0.28)] px-4 py-8',
        overlayClassName,
      )}
    >
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          'w-full max-w-[440px] rounded-[7.5px] bg-white p-6 shadow-[0_20px_60px_rgba(10,25,47,0.28)]',
          className,
        )}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className={cn('text-heading-2 text-stology-text-dark', titleClassName)}
              id={titleId}
            >
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
        <div className={cn('mt-5', bodyClassName)}>{children}</div>
        {footer ? <div className="mt-5 flex justify-end gap-2">{footer}</div> : null}
      </section>
    </div>,
    document.body,
  );
};
