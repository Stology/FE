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
  commonUi: '\uACF5\uD1B5 UI \uD655\uC778',
  modalDescription:
    '\uBC84\uD2BC\uC744 \uB20C\uB7EC \uC624\uBC84\uB808\uC774\uC640 \uBAA8\uB2EC \uC704\uCE58\uB97C \uD655\uC778\uD569\uB2C8\uB2E4.',
  openModal: '\uBAA8\uB2EC \uC5F4\uAE30',
  approve: '\uC2B9\uC778',
  reject: '\uBC18\uB824',
  createStudy: '\uC2A4\uD130\uB514 \uC0DD\uC131',
  emptyDescription:
    '\uB370\uC774\uD130\uAC00 \uC0DD\uAE30\uBA74 \uC774\uACF3\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.',
  emptyTitle: '\uC544\uC9C1 \uB4F1\uB85D\uB41C \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4',
  errorMessage: '\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.',
  errorTitle: '\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4',
  knowledge: '\uC9C0\uC2DD \uAD6C\uC870',
  upload: '\uC790\uB8CC \uC5C5\uB85C\uB4DC',
  records: '\uC8FC\uCC28\uBCC4 \uAE30\uB85D',
  week4: '4\uC8FC\uCC28',
  week3: '3\uC8FC\uCC28',
  inProgress: '\uC9C4\uD589 \uC911',
  approved: '\uC2B9\uC778\uB428',
  pendingReview: '\uAC80\uD1A0 \uB300\uAE30',
  modalTitle: '\uC2A4\uD130\uB514 \uC0DD\uC131',
  modalFormDescription:
    '\uC0C8\uB85C\uC6B4 \uC2A4\uD130\uB514 \uC815\uBCF4\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.',
  close: '\uB2EB\uAE30',
  submitCreate: '\uC0DD\uC131\uD558\uAE30',
  studyNameLabel: '\uC2A4\uD130\uB514 \uC774\uB984 *',
  studyNamePlaceholder: '\uC608: \uBC31\uC5D4\uB4DC \uB9C8\uC2A4\uD130',
  templateLabel: '\uC628\uD1A8\uB85C\uC9C0 \uD15C\uD50C\uB9BF \uAC80\uC0C9/\uC120\uD0DD *',
  templatePlaceholder: '\uD15C\uD50C\uB9BF\uC744 \uAC80\uC0C9\uD574\uC8FC\uC138\uC694',
  startDateLabel: '\uC2DC\uC791\uC77C *',
  descriptionLabel: '\uC124\uBA85 (\uC120\uD0DD)',
  descriptionPlaceholder:
    '\uC2A4\uD130\uB514\uC5D0 \uB300\uD55C \uC124\uBA85\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694',
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
