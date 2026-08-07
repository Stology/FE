import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { MaterialDraft, UploadMode } from '@/shared/types/stology';
import { Button, FileUploader, Input, Textarea } from '@/shared/ui';

interface MaterialUploadFormProps {
  currentWeek?: number;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  onSubmit?: (draft: MaterialDraft) => void;
}

interface MaterialFormValues {
  content: string;
  description: string;
  title: string;
}

const uploadModes: { id: UploadMode; label: string }[] = [
  { id: 'file', label: '파일 업로드 선택' },
  { id: 'text', label: '텍스트 직접 입력' },
];

const modeButtonClass = (isSelected: boolean) =>
  isSelected
    ? 'h-9 rounded-full border border-stology-deep-navy bg-stology-deep-navy px-5 text-[13px] font-semibold leading-none text-white'
    : 'h-9 rounded-full border border-stology-border-light bg-white px-5 text-[13px] font-semibold leading-none text-stology-text-dark';

export const MaterialUploadForm = ({
  currentWeek,
  isDisabled = false,
  isSubmitting = false,
  onSubmit,
}: MaterialUploadFormProps) => {
  const [mode, setMode] = useState<UploadMode>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<MaterialFormValues>({
    defaultValues: { content: '', description: '', title: '' },
  });

  const handleModeChange = (nextMode: UploadMode) => {
    setMode(nextMode);
    setFileError(null);
  };

  const handleFileChange = (nextFiles: File[]) => {
    setFiles(nextFiles);
    if (nextFiles.length > 0) setFileError(null);
  };

  const submitDraft = (values: MaterialFormValues) => {
    if (mode === 'file' && files.length === 0) {
      setFileError('마크다운 파일을 선택해 주세요.');
      return;
    }

    onSubmit?.({
      content: mode === 'text' ? values.content : undefined,
      description: values.description.trim() || undefined,
      file: mode === 'file' ? files[0] : undefined,
      fileName: mode === 'file' ? files[0]?.name : undefined,
      mode,
      title: values.title.trim(),
    });

    reset();
    setFiles([]);
    setFileError(null);
  };

  return (
    <form
      aria-label="자료 업로드"
      className="rounded-lg border border-stology-border-light bg-white p-6"
      noValidate
      onSubmit={handleSubmit(submitDraft)}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-heading-2 text-stology-text-dark">자료 업로드</h3>
        {currentWeek === undefined ? null : (
          <p className="text-caption text-stology-text-light">
            {currentWeek}주차에 자동 귀속됩니다
          </p>
        )}
      </div>

      <div aria-label="업로드 방식 선택" className="mb-5 flex flex-wrap gap-2.5" role="group">
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

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          {mode === 'file' ? (
            <>
              <FileUploader
                accept=".md,.markdown"
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
              className="min-h-40"
              disabled={isDisabled}
              error={errors.content?.message}
              label="자료 본문 *"
              placeholder="마크다운 형식으로 자료를 입력하세요"
              {...register('content', {
                required: mode === 'text' ? '자료 본문을 입력해 주세요.' : false,
              })}
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Input
            disabled={isDisabled}
            error={errors.title?.message}
            label="자료 제목 *"
            placeholder="자료 제목을 입력하세요"
            {...register('title', {
              required: '자료 제목을 입력해 주세요.',
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
          <div className="flex justify-end">
            <Button
              className="bg-stology-deep-navy hover:bg-stology-royal-blue"
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
