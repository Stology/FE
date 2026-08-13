import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { MaterialDraft, UploadMode } from '@/shared/types/stology';
import { Button, FileUploader, Input, Select, Textarea } from '@/shared/ui';

interface MaterialUploadFormProps {
  currentWeek?: number;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  onSubmit?: (draft: MaterialDraft) => void | Promise<void>;
}

function createMaterialFormSchema(latestWeek: number) {
  return z.object({
    content: z.string(),
    description: z.string(),
    title: z.string().trim().min(1, '자료 제목을 입력해 주세요.'),
    week: z
      .number({ invalid_type_error: '주차를 선택해 주세요.' })
      .int('주차는 정수여야 합니다.')
      .min(1, '1주차 이상을 선택해 주세요.')
      .max(latestWeek, `현재 주차인 ${latestWeek}주차 이하를 선택해 주세요.`),
  });
}

type MaterialFormValues = z.infer<ReturnType<typeof createMaterialFormSchema>>;

const uploadModes: { id: UploadMode; label: string }[] = [
  { id: 'file', label: '파일 업로드 선택' },
  { id: 'text', label: '텍스트 직접 입력' },
];

function modeButtonClass(isSelected: boolean) {
  return isSelected
    ? 'h-10 rounded border border-stology-deep-navy bg-stology-deep-navy px-5 text-[13px] font-semibold leading-none text-white'
    : 'h-10 rounded border border-stology-border-light bg-white px-5 text-[13px] font-semibold leading-none text-stology-text-dark';
}

export const MaterialUploadForm = ({
  currentWeek,
  isDisabled = false,
  isSubmitting = false,
  onSubmit,
}: MaterialUploadFormProps) => {
  const latestWeek = Math.max(1, currentWeek ?? 1);
  const availableWeeks = Array.from({ length: latestWeek }, (_, index) => index + 1);
  const [mode, setMode] = useState<UploadMode>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<MaterialFormValues>({
    defaultValues: { content: '', description: '', title: '', week: latestWeek },
    resolver: (values) => {
      const result = createMaterialFormSchema(latestWeek).safeParse(values);
      if (result.success) return { values: result.data, errors: {} };

      const fieldErrors: Record<string, { type: string; message: string }> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = { type: 'validation', message: issue.message };
        }
      });
      return { values: {}, errors: fieldErrors };
    },
  });

  useEffect(() => {
    setValue('week', latestWeek);
  }, [latestWeek, setValue]);

  function handleModeChange(nextMode: UploadMode) {
    setMode(nextMode);
    setFileError(null);
  }

  function handleFileChange(nextFiles: File[]) {
    setFiles(nextFiles);
    if (nextFiles.length > 0) setFileError(null);
  }

  async function submitDraft(values: MaterialFormValues) {
    if (mode === 'text' && !values.content.trim()) {
      setError('content', { type: 'validation', message: '자료 본문을 입력해 주세요.' });
      return;
    }

    if (mode === 'file' && files.length === 0) {
      setFileError('마크다운 파일을 선택해 주세요.');
      return;
    }

    try {
      await onSubmit?.({
        content: mode === 'text' ? values.content : undefined,
        description: values.description.trim() || undefined,
        file: mode === 'file' ? files[0] : undefined,
        fileName: mode === 'file' ? files[0]?.name : undefined,
        mode,
        title: values.title.trim(),
        week: values.week,
      });

      reset({ content: '', description: '', title: '', week: latestWeek });
      setFiles([]);
      setFileError(null);
    } catch {
      // 업로드 실패 시 입력값을 유지해 재시도할 수 있게 한다. 실패 안내는 mutation 쪽 토스트로 표시.
    }
  }

  return (
    <form
      aria-label="자료 업로드"
      className="rounded-lg border border-stology-border-light bg-white p-5 sm:p-6"
      noValidate
      onSubmit={handleSubmit(submitDraft)}
    >
      <div aria-label="업로드 방식 선택" className="mb-4 flex flex-wrap" role="group">
        {uploadModes.map((uploadMode) => (
          <button
            aria-pressed={mode === uploadMode.id}
            className={modeButtonClass(mode === uploadMode.id)}
            disabled={isDisabled}
            key={uploadMode.id}
            onClick={() => handleModeChange(uploadMode.id)}
            type="button"
          >
            {uploadMode.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6">
        <div>
          {mode === 'file' ? (
            <>
              <FileUploader
                accept=".md,.markdown"
                className="[&>label]:min-h-[230px]"
                disabled={isDisabled}
                files={files}
                helperText="마크다운 파일만 가능"
                label="드롭존 / 파일 선택"
                onChange={handleFileChange}
                onRemove={(file) => setFiles(files.filter((item) => item !== file))}
              />
              {fileError ? (
                <p className="mt-1 text-caption text-stology-reject" role="alert">
                  {fileError}
                </p>
              ) : null}
            </>
          ) : (
            <Textarea
              aria-label="자료 본문 *"
              className="min-h-[230px]"
              disabled={isDisabled}
              error={errors.content?.message}
              placeholder="마크다운 형식으로 자료를 입력하세요"
              {...register('content', {
                required: mode === 'text' ? '자료 본문을 입력해 주세요.' : false,
              })}
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Select
            disabled={isDisabled}
            error={errors.week?.message}
            label="주차 선택"
            {...register('week', { valueAsNumber: true })}
          >
            {availableWeeks.map((week) => (
              <option key={week} value={week}>
                {week}주차
              </option>
            ))}
          </Select>
          <Input
            disabled={isDisabled}
            error={errors.title?.message}
            label="자료 제목 *"
            placeholder="자료 제목을 입력하세요"
            {...register('title', {
              setValueAs: (value: string) => value.trimStart(),
            })}
          />
          <Textarea
            className="min-h-20"
            disabled={isDisabled}
            label="자료 설명 (선택)"
            placeholder="자료에 대한 설명을 입력하세요"
            {...register('description')}
          />
          <div className="flex justify-start">
            <Button
              className="bg-stology-electric-blue hover:bg-stology-royal-blue"
              disabled={isDisabled}
              isLoading={isSubmitting}
              type="submit"
            >
              등록
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
