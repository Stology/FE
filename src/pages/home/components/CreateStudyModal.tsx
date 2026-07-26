import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';

import { Button, Input, Modal, Textarea } from '@/shared/ui';

import { OntologySearchModal, type OntologyTemplate } from './OntologySearchModal';

export interface CreateStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdStudy: { id: string; name: string; inviteToken: string }) => void;
}

const WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const getReportScheduleText = (startDateStr: string): string => {
  if (!startDateStr) {
    return '기본 리포트  매주 화요일 24:00 (KST)';
  }

  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) {
    return '기본 리포트  매주 화요일 24:00 (KST)';
  }

  // 전날 요일 계산 (시작일 선택 시 전날 24:00을 기본 주차 종료/리포트 생성 시각으로 안내)
  const prevDayIndex = (date.getDay() + 6) % 7;
  const prevWeekday = WEEKDAYS[prevDayIndex];

  return `기본 리포트  매주 ${prevWeekday} 24:00 (KST)`;
};

export const CreateStudyModal = ({ isOpen, onClose, onSuccess }: CreateStudyModalProps) => {
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<OntologyTemplate | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [startedAt, setStartedAt] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; templateId?: string; startedAt?: string }>(
    {},
  );

  const validate = () => {
    const newErrors: { name?: string; templateId?: string; startedAt?: string } = {};

    if (!name.trim()) {
      newErrors.name = '스터디 이름을 입력해 주세요.';
    }
    if (!selectedTemplate) {
      newErrors.templateId = '온톨로지 템플릿을 선택해 주세요.';
    }
    if (!startedAt) {
      newErrors.startedAt = '시작일을 선택해 주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      // Simulate API call for study creation (HOME-CRT-01)
      await new Promise((resolve) => setTimeout(resolve, 400));

      const mockInviteToken = `inv_${Math.random().toString(36).substring(2, 9)}`;
      const createdStudy = {
        id: `study-${Date.now()}`,
        name: name.trim(),
        inviteToken: mockInviteToken,
      };

      // Reset form
      setName('');
      setSelectedTemplate(null);
      setDescription('');
      setErrors({});
      onClose();

      if (onSuccess) {
        onSuccess(createdStudy);
      }
    } catch {
      alert('스터디 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="스터디 생성"
        description="HOM001-0100 · 스터디 생성 및 기본 리포트 일정 확정"
        showCloseButton
        className="max-w-[460px]"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 스터디 이름 * */}
          <div>
            <Input
              id="study-name"
              label="스터디 이름 *"
              placeholder="예: 백엔드 마스터, CS 스터디"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
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
                onClick={() => setIsSearchModalOpen(true)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-lg text-sm text-left transition-all cursor-pointer ${
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

              {errors.templateId && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.templateId}</p>
              )}
            </div>
          </div>

          {/* 시작일 YYYY-MM-DD * */}
          <div>
            <Input
              id="study-started-at"
              type="date"
              label="시작일 YYYY-MM-DD *"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              error={errors.startedAt}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20"
            />
          </div>

          {/* 액션 버튼 그룹 (생성하기, 닫기) */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              닫기
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
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
          setErrors((prev) => ({ ...prev, templateId: undefined }));
        }}
        initialSelectedId={selectedTemplate?.id}
      />
    </>
  );
};
