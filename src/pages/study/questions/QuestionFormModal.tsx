import { ImageIcon, X } from 'lucide-react';
import { useEffect, useId, useState, type ClipboardEvent, type FormEvent } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';

import { Button, Input, Modal, Textarea } from '@/shared/ui';

const questionFormSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력해주세요.').max(50, '제목은 50자 이내입니다.'),
  content: z.string().trim().min(1, '본문을 입력해주세요.').max(1000, '본문은 1000자 이내입니다.'),
});

export interface QuestionFormValues {
  content: string;
  images: File[];
  title: string;
}

interface QuestionFormModalProps {
  initialValues?: Pick<QuestionFormValues, 'content' | 'title'>;
  isOpen: boolean;
  mode?: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (values: QuestionFormValues) => Promise<void> | void;
}

const emptyValues: Pick<QuestionFormValues, 'content' | 'title'> = {
  content: '',
  title: '',
};

const questionFormResolver: Resolver<Pick<QuestionFormValues, 'content' | 'title'>> = async (
  values,
) => {
  const result = questionFormSchema.safeParse(values);

  if (result.success) {
    return { errors: {}, values: result.data };
  }

  return {
    errors: Object.fromEntries(
      result.error.issues.map((issue) => [
        issue.path[0],
        { message: issue.message, type: 'validation' },
      ]),
    ),
    values: {},
  };
};

export const QuestionFormModal = ({
  initialValues = emptyValues,
  isOpen,
  mode = 'create',
  onClose,
  onSubmit,
}: QuestionFormModalProps) => {
  const formId = useId();
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialContent = initialValues.content;
  const initialTitle = initialValues.title;
  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
    reset,
    trigger,
  } = useForm<Pick<QuestionFormValues, 'content' | 'title'>>({
    defaultValues: { content: initialContent, title: initialTitle },
    mode: 'onChange',
    resolver: questionFormResolver,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({ content: initialContent, title: initialTitle });
    setImages([]);
    if (initialContent.trim() && initialTitle.trim()) void trigger();
  }, [initialContent, initialTitle, isOpen, reset, trigger]);

  const closeModal = () => {
    reset({ content: initialContent, title: initialTitle });
    setImages([]);
    onClose();
  };

  async function submitValues(values: Pick<QuestionFormValues, 'content' | 'title'>) {
    setIsSubmitting(true);
    try {
      await onSubmit({
        content: values.content.trim(),
        images,
        title: values.title.trim(),
      });
      closeModal();
    } catch {
      // The mutation layer reports the error. Keep the form open for retry.
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    await handleSubmit(submitValues)(event);
  }

  const handleImagePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedImages = Array.from(event.clipboardData.items)
      .filter((item) => item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (pastedImages.length > 0) {
      event.preventDefault();
      setImages((currentImages) => [...currentImages, ...pastedImages]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== indexToRemove),
    );
  };

  const isEditing = mode === 'edit';

  return (
    <Modal
      footer={
        <>
          <Button disabled={isSubmitting} onClick={closeModal} variant="outline">
            닫기
          </Button>
          <Button disabled={!isValid} form={formId} isLoading={isSubmitting} type="submit">
            {isEditing ? '수정하기' : '질문하기'}
          </Button>
        </>
      }
      isOpen={isOpen}
      onClose={isSubmitting ? () => undefined : closeModal}
      title={isEditing ? '질문 수정' : '질문 작성'}
    >
      <form className="space-y-4" id={formId} onSubmit={submitQuestion}>
        <Input
          aria-label="질문 제목"
          error={errors.title?.message}
          maxLength={50}
          placeholder="제목 * (최대 50자)"
          {...register('title')}
        />
        <Textarea
          aria-label="질문 본문"
          className="h-[150px] min-h-[150px] resize-none"
          error={errors.content?.message}
          maxLength={1000}
          onPaste={handleImagePaste}
          placeholder="본문 * (최대 1000자, 텍스트 + 이미지 인라인 붙여넣기, 마크다운 미지원)"
          {...register('content')}
        />

        {images.length > 0 ? (
          <ul aria-label="첨부 이미지" className="flex flex-wrap gap-2">
            {images.map((image, imageIndex) => {
              const displayName = image.name || `붙여넣은 이미지 ${imageIndex + 1}`;

              return (
                <li
                  className="flex max-w-full items-center gap-2 rounded-[4.5px] bg-stology-off-white px-2.5 py-1.5 text-[11px] text-stology-text-dark"
                  key={`${image.name}-${image.lastModified}-${imageIndex}`}
                >
                  <ImageIcon aria-hidden className="size-3.5 shrink-0 text-stology-royal-blue" />
                  <span className="max-w-64 truncate">{displayName}</span>
                  <button
                    aria-label={`${displayName} 제거`}
                    className="text-stology-text-light transition hover:text-stology-text-dark"
                    onClick={() => removeImage(imageIndex)}
                    type="button"
                  >
                    <X aria-hidden className="size-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </form>
    </Modal>
  );
};
