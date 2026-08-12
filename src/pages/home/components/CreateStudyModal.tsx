import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search } from 'lucide-react';
import { z } from 'zod';

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

const WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

// 현지 날짜를 YYYY-MM-DD 형식으로 포맷팅하는 헬퍼 (toISOString 사용 시 UTC 시차로 인한 저녁 시간대 날짜 왜곡 방지)
const getLocalDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// YYYY-MM-DD 분해 및 Date.UTC() / getUTCDay() 기반 KST 요일 계산 (미국 등 UTC보다 느린 타임존 오프셋 영향 방지)
const getReportScheduleText = (startDateStr: string): string => {
  if (!startDateStr) {
    return '기본 리포트  매주 화요일 24:00 (KST)';
  }

  const parts = startDateStr.split('-');
  if (parts.length !== 3) {
    return '기본 리포트  매주 화요일 24:00 (KST)';
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return '기본 리포트  매주 화요일 24:00 (KST)';
  }

  // Date.UTC()로 파싱하여 타임존 오프셋 영향 방지
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  // 시작일 선택 시 전날 24:00을 기본 주차 종료/리포트 생성 시각으로 안내
  const prevDayIndex = (utcDate.getUTCDay() + 6) % 7;
  const prevWeekday = WEEKDAYS[prevDayIndex];

  return `기본 리포트  매주 ${prevWeekday} 24:00 (KST)`;
};

export const CreateStudyModal = ({ isOpen, onClose, onSuccess }: CreateStudyModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<OntologyTemplate | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // React Hook Form + Zod Resolver 폼 상태 관리
  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const startedAt = watch('startedAt');

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
      // Simulate API call for study creation (HOME-CRT-01)
      await new Promise((resolve) => setTimeout(resolve, 400));

      const mockInviteToken = `inv_${Math.random().toString(36).substring(2, 9)}`;
      const createdStudy = {
        id: `study-${Date.now()}`,
        name: data.name.trim(),
        inviteToken: mockInviteToken,
      };

      reset();
      setSelectedTemplate(null);
      onClose();

      if (onSuccess) {
        onSuccess(createdStudy);
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
        description="HOM001-0100 · 스터디 생성 및 기본 리포트 일정 확정"
        showCloseButton
        className="max-w-[460px]"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 스터디 이름 * */}
          <div>
            <Input
              id="study-name"
              label="스터디 이름 *"
              placeholder="예: 백엔드 마스터, CS 스터디"
              disabled={isSubmitting}
              maxLength={20}
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          {/* ── HOM001-0101: 온톨로지 템플릿 검색/선택 트리거 ── */}
          <div>
            <label className="block text-caption font-bold mb-1.5 text-stology-text-dark">
              온톨로지 템플릿 검색/선택 *
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

          {/* 시작일 YYYY-MM-DD * */}
          <div>
            <Input
              id="study-started-at"
              type="date"
              label="시작일 YYYY-MM-DD *"
              disabled={isSubmitting}
              error={errors.startedAt?.message}
              {...register('startedAt')}
            />
            {/* 기본 리포트 일정 안내 */}
            <p className="mt-1.5 text-caption font-medium text-stology-text-light">
              {getReportScheduleText(startedAt)}
            </p>
          </div>

          {/* 설명 (선택) */}
          <div>
            <Textarea
              id="study-description"
              label="설명 (선택)"
              placeholder="스터디 목표나 전달사항을 입력해주세요."
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
