import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, Copy } from 'lucide-react';

import { Button, Input, Modal, Textarea } from '@/shared/ui';
import { useStudySettings } from '../hooks/useStudySettings';
import { useToast } from '@/shared/hooks';

export interface StudySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyId: string;
  studyName: string;
  startDate?: string;
  description?: string;
  reviewerCount?: number;
}

const updateStudySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '스터디 이름을 입력해 주세요.')
    .max(20, '스터디 이름은 20자 이내여야 합니다.'),
  startDate: z.string().min(1, '시작일을 선택해 주세요.'),
  description: z.string().max(100, '설명은 100자 이내여야 합니다.').optional(),
});

type UpdateStudyFormValues = z.infer<typeof updateStudySchema>;

const updateReviewerSchema = z.object({
  reviewerCount: z
    .number({ invalid_type_error: '숫자를 입력해 주세요.' })
    .min(1, '최소 1명 이상이어야 합니다.')
    .max(10, '최대 10명까지 가능합니다.'),
});

type UpdateReviewerFormValues = z.infer<typeof updateReviewerSchema>;

const getLocalDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const StudySettingsModal = ({
  isOpen,
  onClose,
  studyId,
  studyName,
  startDate,
  description,
  reviewerCount,
}: StudySettingsModalProps) => {
  const { showToast } = useToast();
  const {
    updateStudyMutation,
    updateReviewerCountMutation,
    closeStudyMutation,
    getInvitationTokenMutation,
  } = useStudySettings(studyId);

  const [activeTab, setActiveTab] = useState<'info' | 'reviewer' | 'invite' | 'close'>('info');
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  // 정보 수정 폼
  const {
    register: registerInfo,
    handleSubmit: handleInfoSubmit,
    reset: resetInfo,
    formState: { errors: infoErrors, isSubmitting: isInfoSubmitting },
  } = useForm<UpdateStudyFormValues>({
    defaultValues: {
      name: studyName,
      startDate: startDate ?? getLocalDateString(),
      description: description ?? '',
    },
    resolver: (values) => {
      const result = updateStudySchema.safeParse(values);
      if (result.success) return { values: result.data, errors: {} };
      const fieldErrors: Record<string, { type: string; message: string }> = {};
      result.error.issues.forEach((issue) => {
        const path = String(issue.path[0]);
        if (path) fieldErrors[path] = { type: 'validation', message: issue.message };
      });
      return { values: {}, errors: fieldErrors };
    },
  });

  // 리뷰어 설정 폼
  const {
    register: registerReviewer,
    handleSubmit: handleReviewerSubmit,
    reset: resetReviewer,
    formState: { errors: reviewerErrors, isSubmitting: isReviewerSubmitting },
  } = useForm<UpdateReviewerFormValues>({
    defaultValues: { reviewerCount: reviewerCount ?? 2 },
    resolver: (values) => {
      const result = updateReviewerSchema.safeParse(values);
      if (result.success) return { values: result.data, errors: {} };
      const fieldErrors: Record<string, { type: string; message: string }> = {};
      result.error.issues.forEach((issue) => {
        const path = String(issue.path[0]);
        if (path) fieldErrors[path] = { type: 'validation', message: issue.message };
      });
      return { values: {}, errors: fieldErrors };
    },
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab('info');
      setInviteToken(null);
      resetInfo({
        name: studyName,
        startDate: startDate ?? getLocalDateString(),
        description: description ?? '',
      });
      resetReviewer({ reviewerCount: reviewerCount ?? 2 });
    }
  }, [isOpen, studyName, startDate, description, reviewerCount, resetInfo, resetReviewer]);

  const onInfoSubmit = async (data: UpdateStudyFormValues) => {
    try {
      await updateStudyMutation.mutateAsync({
        ...data,
        description: data.description ?? '',
      });
      showToast({ message: '스터디 정보가 수정되었습니다.', type: 'success' });
    } catch {
      showToast({ message: '스터디 정보 수정에 실패했습니다.', type: 'error' });
    }
  };

  const onReviewerSubmit = async (data: UpdateReviewerFormValues) => {
    try {
      await updateReviewerCountMutation.mutateAsync({ reviewerCount: Number(data.reviewerCount) });
      showToast({ message: '검토 인원이 변경되었습니다.', type: 'success' });
    } catch {
      showToast({ message: '검토 인원 변경에 실패했습니다.', type: 'error' });
    }
  };

  const fetchInviteToken = async () => {
    try {
      const res = await getInvitationTokenMutation.mutateAsync();
      setInviteToken(res);
    } catch {
      showToast({ message: '초대 링크를 가져오는 데 실패했습니다.', type: 'error' });
    }
  };

  const copyInviteLink = async () => {
    if (!inviteToken) return;
    const link = `${window.location.origin}/invite/${inviteToken}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast({ message: '초대 링크가 클립보드에 복사되었습니다.', type: 'success' });
    } catch {
      showToast({ message: '초대 링크 복사에 실패했습니다.', type: 'error' });
    }
  };

  const handleCloseStudy = async () => {
    if (!window.confirm('정말 스터디를 종료하시겠습니까? 한 번 종료하면 되돌릴 수 없습니다.'))
      return;
    try {
      await closeStudyMutation.mutateAsync();
      showToast({ message: '스터디가 종료되었습니다.', type: 'success' });
      onClose();
    } catch {
      showToast({ message: '스터디 종료에 실패했습니다.', type: 'error' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="스터디 설정"
      showCloseButton
      className="max-w-[500px]"
    >
      <div className="flex border-b border-stology-border-light mb-5 mt-2">
        {(['info', 'reviewer', 'invite', 'close'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === tab
                ? 'border-b-2 border-stology-deep-navy text-stology-deep-navy'
                : 'text-stology-text-light hover:text-stology-text-dark'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'info' && '정보 수정'}
            {tab === 'reviewer' && '리뷰어 설정'}
            {tab === 'invite' && '팀원 초대'}
            {tab === 'close' && '스터디 종료'}
          </button>
        ))}
      </div>

      <div className="min-h-[220px]">
        {activeTab === 'info' && (
          <form onSubmit={handleInfoSubmit(onInfoSubmit)} className="space-y-4">
            <Input
              id="update-name"
              label="스터디 이름"
              maxLength={20}
              error={infoErrors.name?.message}
              {...registerInfo('name')}
            />
            <Input
              id="update-started-at"
              type="date"
              label="시작일"
              error={infoErrors.startDate?.message}
              {...registerInfo('startDate')}
            />
            <Textarea
              id="update-description"
              label="설명"
              className="min-h-20"
              maxLength={100}
              error={infoErrors.description?.message}
              {...registerInfo('description')}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isInfoSubmitting}>
                정보 저장
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'reviewer' && (
          <form onSubmit={handleReviewerSubmit(onReviewerSubmit)} className="space-y-4">
            <Input
              id="update-reviewer-count"
              type="number"
              label="상호 검토 인원 수"
              min={1}
              max={10}
              error={reviewerErrors.reviewerCount?.message}
              {...registerReviewer('reviewerCount', { valueAsNumber: true })}
            />
            <p className="text-xs text-stology-text-light leading-relaxed">
              스터디원들이 매주 작성한 Q&A나 자료를 검토할 인원 수를 설정합니다. 최소 1명부터 최대
              10명까지 설정할 수 있습니다.
            </p>
            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isReviewerSubmitting}>
                인원 변경
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'invite' && (
          <div className="space-y-4">
            <p className="text-sm text-stology-text-dark">새로운 팀원을 스터디에 초대하세요.</p>
            {!inviteToken ? (
              <Button
                type="button"
                onClick={fetchInviteToken}
                isLoading={getInvitationTokenMutation.isPending}
              >
                초대 링크 생성/조회
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-stology-off-white border border-stology-border-light rounded-lg">
                  <Link className="w-5 h-5 text-stology-text-light shrink-0" />
                  <span className="text-sm truncate flex-1 font-mono text-stology-text-dark">
                    {window.location.origin}/invite/{inviteToken}
                  </span>
                  <button
                    type="button"
                    onClick={copyInviteLink}
                    className="p-1.5 hover:bg-white rounded border border-transparent hover:border-stology-border-light transition-all text-stology-deep-navy"
                    title="복사하기"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-stology-text-light">
                  위 링크를 복사하여 스터디원에게 전달하세요. 링크를 통해 접속하면 자동으로 스터디에
                  참여됩니다.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'close' && (
          <div className="space-y-4 p-4 border border-red-100 bg-red-50 rounded-lg">
            <h3 className="text-red-700 font-bold text-sm">스터디 종료 경고</h3>
            <p className="text-sm text-red-600 leading-relaxed">
              스터디를 종료하면{' '}
              <strong>
                더 이상 새로운 자료나 질문을 등록할 수 없게 되며, 읽기 전용 상태로 전환
              </strong>
              됩니다. 종료된 스터디는 다시 활성화할 수 없으니 신중하게 결정해 주세요.
            </p>
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full border-red-200 text-red-700 hover:bg-red-100"
                isLoading={closeStudyMutation.isPending}
                onClick={handleCloseStudy}
              >
                스터디 종료하기
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
