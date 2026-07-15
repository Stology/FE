import type { ReactNode } from 'react';

import { Button } from './Button';
import { Modal } from './Modal';

type ConfirmDialogVariant = 'default' | 'danger';

interface ConfirmDialogProps {
  cancelText?: string;
  children?: ReactNode;
  confirmText?: string;
  description?: string;
  isLoading?: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  variant?: ConfirmDialogVariant;
}

export const ConfirmDialog = ({
  cancelText = 'Cancel',
  children,
  confirmText = 'Confirm',
  description,
  isLoading = false,
  isOpen,
  onCancel,
  onConfirm,
  title,
  variant = 'default',
}: ConfirmDialogProps) => (
  <Modal
    className="max-w-[360px]"
    description={description}
    footer={
      <>
        <Button disabled={isLoading} onClick={onCancel} variant="outline">
          {cancelText}
        </Button>
        <Button
          isLoading={isLoading}
          onClick={onConfirm}
          variant={variant === 'danger' ? 'danger' : 'primary'}
        >
          {confirmText}
        </Button>
      </>
    }
    isOpen={isOpen}
    onClose={onCancel}
    title={title}
  >
    {children}
  </Modal>
);
