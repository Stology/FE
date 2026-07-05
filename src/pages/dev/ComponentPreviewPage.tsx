import { AlertTriangle, Check, Inbox, Plus } from 'lucide-react';
import { useState } from 'react';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorMessage,
  Input,
  Modal,
  Select,
  Tabs,
  Textarea,
} from '@/shared/ui';

const text = {
  commonUi: '공통 UI 확인',
  modalDescription: '버튼을 눌러 오버레이와 모달 위치를 확인합니다.',
  openModal: '모달 열기',
  approve: '승인',
  reject: '반려',
  createStudy: '스터디 생성',
  emptyDescription: '데이터가 생기면 이곳에 표시됩니다.',
  emptyTitle: '아직 등록된 내용이 없습니다',
  errorMessage: '잠시 후 다시 시도해주세요.',
  errorTitle: '데이터를 불러오지 못했습니다',
  knowledge: '지식 구조',
  upload: '자료 업로드',
  records: '주차별 기록',
  week4: '4주차',
  week3: '3주차',
  inProgress: '진행 중',
  approved: '승인됨',
  pendingReview: '검토 대기',
  modalTitle: '스터디 생성',
  modalFormDescription: '새로운 스터디 정보를 입력해주세요.',
  close: '닫기',
  submitCreate: '생성하기',
  studyNameLabel: '스터디 이름 *',
  studyNamePlaceholder: '예: 백엔드 마스터',
  templateLabel: '온톨로지 템플릿 검색/선택 *',
  templatePlaceholder: '템플릿을 검색해주세요',
  startDateLabel: '시작일 *',
  descriptionLabel: '설명 (선택)',
  descriptionPlaceholder: '스터디에 대한 설명을 입력해주세요',
};

const previewTabs = [
  { id: 'knowledge', label: text.knowledge, to: '/dev/components' },
  { id: 'upload', label: text.upload, to: '/dev/components/upload' },
  { id: 'records', label: text.records, to: '/dev/components/records' },
];

export const ComponentPreviewPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-stology-off-white px-8 py-8 text-stology-text-dark">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <p className="text-label text-stology-electric-blue">DEV</p>
          <h1 className="mt-1 text-heading-1">{text.commonUi}</h1>
        </header>

        <Card className="p-6">
          <h2 className="text-heading-2">Modal</h2>
          <p className="mt-2 text-body text-stology-text-light">{text.modalDescription}</p>
          <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
            {text.openModal}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-heading-2">Button</h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Text Link</Button>
            <Button leftIcon={<Check size={16} aria-hidden />} variant="success">
              {text.approve}
            </Button>
            <Button
              leftIcon={<Plus className="rotate-45" size={16} aria-hidden />}
              variant="danger"
            >
              {text.reject}
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-heading-2">EmptyState</h2>
          <EmptyState
            action={<Button leftIcon={<Plus size={16} aria-hidden />}>{text.createStudy}</Button>}
            className="mt-4"
            description={text.emptyDescription}
            icon={<Inbox size={28} aria-hidden />}
            title={text.emptyTitle}
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-heading-2">ErrorMessage</h2>
          <ErrorMessage className="mt-4" message={text.errorMessage} title={text.errorTitle} />
        </Card>

        <Card className="p-6">
          <h2 className="text-heading-2">Tabs / Badge</h2>
          <Tabs className="mt-4" items={previewTabs} />
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>{text.week4}</Badge>
            <Badge variant="navy">Stology</Badge>
            <Badge variant="week">{text.week3}</Badge>
            <Badge variant="neutral">{text.inProgress}</Badge>
            <Badge leftIcon={<Check size={14} strokeWidth={3} aria-hidden />} variant="success">
              {text.approved}
            </Badge>
            <Badge
              leftIcon={<AlertTriangle size={14} fill="currentColor" aria-hidden />}
              variant="warning"
            >
              {text.pendingReview}
            </Badge>
          </div>
        </Card>
      </div>

      <Modal
        description={text.modalFormDescription}
        footer={
          <>
            <Button onClick={() => setIsModalOpen(false)} variant="outline">
              {text.close}
            </Button>
            <Button disabled>{text.submitCreate}</Button>
          </>
        }
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={text.modalTitle}
      >
        <div className="flex flex-col gap-4">
          <Input label={text.studyNameLabel} placeholder={text.studyNamePlaceholder} />
          <Select label={text.templateLabel}>
            <option>{text.templatePlaceholder}</option>
          </Select>
          <Input label={text.startDateLabel} placeholder="YYYY-MM-DD" />
          <Textarea label={text.descriptionLabel} placeholder={text.descriptionPlaceholder} />
        </div>
      </Modal>
    </main>
  );
};
