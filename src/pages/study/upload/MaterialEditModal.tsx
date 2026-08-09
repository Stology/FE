import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type { Material } from '@/shared/types/stology';
import { Button, Input, Modal, Textarea } from '@/shared/ui';

export interface MaterialEditPayload {
  content?: string;
  title: string;
}

interface MaterialEditModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  material: Material | null;
  onClose: () => void;
  onSubmit: (payload: MaterialEditPayload) => void;
}

interface MaterialEditFormValues {
  content: string;
  title: string;
}

export const MaterialEditModal = ({
  isOpen,
  isSubmitting = false,
  material,
  onClose,
  onSubmit,
}: MaterialEditModalProps) => {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<MaterialEditFormValues>({ defaultValues: { content: '', title: '' } });

  useEffect(() => {
    if (material) reset({ content: '', title: material.title });
  }, [material, reset]);

  if (!material) return null;

  const submitEdit = (values: MaterialEditFormValues) => {
    onSubmit({
      content: values.content.trim() || undefined,
      title: values.title.trim(),
    });
  };

  return (
    <Modal
      description="본문을 새로 입력하면 기존 내용을 대체해 AI가 다시 분석합니다. 비워두면 제목만 바뀝니다."
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      title="자료 수정"
    >
      <form aria-label="자료 수정" noValidate onSubmit={handleSubmit(submitEdit)}>
        <div className="flex flex-col gap-4">
          <Input
            disabled={isSubmitting}
            error={errors.title?.message}
            label="자료 제목 수정 *"
            {...register('title', { required: '자료 제목을 입력해 주세요.' })}
          />
          <Textarea
            className="min-h-32"
            disabled={isSubmitting}
            label="본문 수정 (선택)"
            placeholder="새 본문을 입력하면 기존 내용을 대체합니다."
            {...register('content')}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button disabled={isSubmitting} onClick={onClose} type="button" variant="outline">
            취소
          </Button>
          <Button isLoading={isSubmitting} type="submit">
            저장
          </Button>
        </div>
      </form>
    </Modal>
  );
};
