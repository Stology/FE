import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Search } from 'lucide-react';
import { z } from 'zod';

import { httpClient } from '@/shared/api/http_client';
import type { ApiResponse } from '@/shared/api/types';
import { Button, Input, Modal, Textarea } from '@/shared/ui';

import { OntologySearchModal, type OntologyTemplate } from './OntologySearchModal';

export interface CreateStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdStudy: { id: string; name: string; inviteToken: string }) => void;
}

// Zod 검증 스키마 정의 (React Hook Form 연동)
const createStudySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '스터디 이름을 입력해 주세요.')
    .max(20, '스터디 이름은 20자 이내여야 합니다.'),
  templateId: z.string().min(1, '온톨로지 템플릿을 선택해 주세요.'),
  startedAt: z.string().min(1, '시작일을 선택해 주세요.'),
  description: z.string().max(100, '설명은 100자 이내여야 합니다.').optional(),
});

export type CreateStudyFormValues = z.infer<typeof createStudySchema>;

// 현지 날짜를 YYYY-MM-DD 형식으로 포맷팅하는 헬퍼 (toISOString 사용 시 UTC 시차로 인한 저녁 시간대 날짜 왜곡 방지)
const getLocalDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const CreateStudyModal = ({ isOpen, onClose, onSuccess }: CreateStudyModalProps) => {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<OntologyTemplate | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // React Hook Form + Zod Resolver 폼 상태 관리
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateStudyFormValues>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      templateId: '',
      startedAt: getLocalDateString(),
      description: '',
    },
    resolver: (values) => {
      const result = createStudySchema.safeParse(values);
      if (result.success) {
        return { values: result.data, errors: {} };
      }
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

  // 제출 중(isSubmitting)에는 모달 닫기 차단
  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setSelectedTemplate(null);
      onClose();
    }
  };

  const onSubmit = async (data: CreateStudyFormValues) => {
    try {
      // 1단계: 스터디 생성 (POST /api/study)
      const createRes = await httpClient.post<ApiResponse<number>>('/api/study', {
        name: data.name.trim(),
        templateId: Number(data.templateId),
        startDate: data.startedAt,
        description: data.description?.trim() || undefined,
      });

      const studyId = createRes.data.result;

      await queryClient.invalidateQueries({ queryKey: ['myStudies'] });

      // 2단계: 초대 토큰 발급 (POST /api/study/{studyId}/invitation)
      const inviteRes = await httpClient.post<ApiResponse<string>>(
        `/api/study/${studyId}/invitation`,
      );
      const inviteToken = inviteRes.data.result;

      reset();
      setSelectedTemplate(null);
      onClose();

      if (onSuccess) {
        onSuccess({ id: String(studyId), name: data.name.trim(), inviteToken });
      }
    } catch {
      alert('스터디 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="스터디 생성"
        description="새로운 스터디 정보를 입력해주세요."
        showCloseButton
        className="max-w-[440px]"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 스터디 이름 */}
          <div>
            <Input
              id="study-name"
              label="스터디 이름"
              placeholder="예: 백엔드 마스터, CS 스터디"
              disabled={isSubmitting}
              maxLength={20}
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          {/* ── HOM001-0101: 온톨로지 템플릿 검색/선택 트리거 ── */}
          <div>
            <label
              className="mb-2 block text-label text-stology-text-dark"
              htmlFor="study-template-trigger"
            >
              온톨로지 템플릿 검색/선택
            </label>
            <div>
              <button
                type="button"
                id="study-template-trigger"
                disabled={isSubmitting}
                onClick={() => {
                  if (!isSubmitting) setIsSearchModalOpen(true);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-lg text-sm text-left transition-all ${
                  isSubmitting
                    ? 'cursor-not-allowed opacity-70 bg-stology-off-white'
                    : 'cursor-pointer'
                } ${
                  errors.templateId
                    ? 'border-red-500 ring-1 ring-red-500'
                    : 'border-stology-border hover:border-stology-border-dark'
                }`}
              >
                <span
                  className={
                    selectedTemplate
                      ? 'text-stology-text-dark font-medium'
                      : 'text-stology-text-light'
                  }
                >
                  {selectedTemplate ? selectedTemplate.name : '온톨로지 템플릿 검색 및 선택'}
                </span>
                <Search className="w-4 h-4 text-stology-text-light" />
              </button>

              {errors.templateId?.message && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.templateId.message}</p>
              )}
            </div>
          </div>

          {/* 시작일 */}
          <div>
            <Input
              id="study-started-at"
              type="date"
              label="시작일"
              disabled={isSubmitting}
              error={errors.startedAt?.message}
              {...register('startedAt')}
            />
          </div>

          {/* 설명 (선택) */}
          <div>
            <Textarea
              id="study-description"
              label="설명 (선택)"
              placeholder="스터디에 대한 설명을 입력해주세요"
              disabled={isSubmitting}
              maxLength={100}
              {...register('description')}
              className="min-h-20"
              error={errors.description?.message}
            />
          </div>

          {/* 액션 버튼 그룹 (생성하기, 닫기) */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              닫기
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting || !isValid}
            >
              생성하기
            </Button>
          </div>
        </form>
      </Modal>

      {/* 🔍 HOM001-0101: 온톨로지 템플릿 검색 모달 */}
      <OntologySearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelect={(template) => {
          setSelectedTemplate(template);
          setValue('templateId', template.id, { shouldValidate: true });
        }}
        initialSelectedId={selectedTemplate?.id}
      />
    </>
  );
};
