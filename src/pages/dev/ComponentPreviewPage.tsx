import { AlertTriangle, Check, FileText, Inbox, Plus, X } from 'lucide-react';
import { useState } from 'react';

import {
  Accordion,
  AppLayout,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  FileUploader,
  Input,
  Loading,
  Modal,
  Pagination,
  ProgressBar,
  SearchInput,
  SectionTitle,
  Select,
  Tabs,
  Textarea,
  Toast,
  WeeklyProgressList,
} from '@/shared/ui';

const previewTabs = [
  { id: 'knowledge', label: '지식 구조', to: '/dev/components' },
  { id: 'upload', label: '자료 업로드', to: '/dev/components/upload' },
  { id: 'records', label: '주차별 기록', to: '/dev/components/records' },
];

const avatarUsers = [
  { id: 'u1', name: '민지' },
  { id: 'u2', name: '서연' },
  { id: 'u3', name: '지훈' },
  { id: 'u4', name: '하린' },
  { id: 'u5', name: '도윤' },
];

const progressItems = [
  { id: 'week-1', label: '1주차', value: 100 },
  { id: 'week-2', label: '2주차', value: 77 },
  { id: 'week-3', label: '3주차', value: 30 },
];

const accordionItems = [
  {
    content: '사용자2가 작성한 JWT 정리 노트와 사용자3의 질문 2건이 포함되어 있습니다.',
    id: 'record-3',
    title: '3주차 · 인증 시스템 학습 기록',
  },
  {
    content: '인덱스 개념 정리, 실습 쿼리, 질문 답변 요약을 확인할 수 있습니다.',
    id: 'record-2',
    title: '2주차 · 데이터베이스 인덱싱',
  },
];

export const ComponentPreviewPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <AppLayout className="px-5 py-6 md:px-8 md:py-7">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-8">
        <header className="rounded-lg border border-stology-border-light bg-white px-6 py-5 shadow-sm md:px-8">
          <p className="text-label text-stology-electric-blue">DEV</p>
          <h1 className="mt-1 text-heading-1">공통 UI 컴포넌트 확인</h1>
          <p className="mt-2 text-body text-stology-text-light">
            기존 공통 컴포넌트와 새로 추가한 컴포넌트를 한 화면에서 확인합니다.
          </p>
        </header>

        <Card className="p-6 md:p-7">
          <SectionTitle>탭 / 검색 / 액션</SectionTitle>
          <Tabs className="mt-5" items={previewTabs} />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <SearchInput
              className="w-full max-w-xs"
              onChange={setQuery}
              onSearch={setQuery}
              placeholder="스터디 검색"
              value={query}
            />
            <Button leftIcon={<Plus size={16} aria-hidden />}>스터디 생성</Button>
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <SectionTitle>버튼 / 배지</SectionTitle>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Button>기본</Button>
            <Button variant="secondary">보조</Button>
            <Button variant="outline">외곽선</Button>
            <Button variant="ghost">텍스트</Button>
            <Button leftIcon={<Check size={16} aria-hidden />} variant="success">
              승인
            </Button>
            <Button leftIcon={<X size={16} aria-hidden />} variant="danger">
              반려
            </Button>
            <Button isLoading>저장 중</Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Button size="sm">작게</Button>
            <Button size="md">기본 크기</Button>
            <Button size="lg">크게</Button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>기본</Badge>
            <Badge variant="navy">Stology</Badge>
            <Badge variant="week">3주차</Badge>
            <Badge variant="neutral">진행 중</Badge>
            <Badge leftIcon={<Check size={14} strokeWidth={3} aria-hidden />} variant="success">
              승인됨
            </Badge>
            <Badge
              leftIcon={<AlertTriangle size={14} fill="currentColor" aria-hidden />}
              variant="warning"
            >
              검토 대기
            </Badge>
            <Badge variant="danger">반려</Badge>
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <SectionTitle>입력 컴포넌트</SectionTitle>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input label="스터디 이름" placeholder="백엔드 마스터" />
            <Input error="필수 입력 항목입니다." label="에러 상태" placeholder="값을 입력하세요" />
            <Select label="템플릿 선택" defaultValue="">
              <option value="" disabled>
                템플릿을 선택하세요
              </option>
              <option>CS 스터디</option>
              <option>면접 스터디</option>
            </Select>
            <Checkbox label="변경 사항을 멤버에게 알림" />
            <Textarea
              className="md:col-span-2"
              label="설명"
              placeholder="스터디 설명을 입력하세요"
            />
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <SectionTitle>모달 / 확인 / 피드백</SectionTitle>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={() => setIsModalOpen(true)}>모달 열기</Button>
            <Button onClick={() => setIsConfirmOpen(true)} variant="danger">
              확인 팝업 열기
            </Button>
            <Loading label="불러오는 중" />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Toast message="변경 사항이 저장되었습니다." title="저장 완료" type="success" />
            <ErrorMessage
              message="잠시 후 다시 시도해주세요."
              title="데이터를 불러오지 못했습니다"
            />
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <SectionTitle>빈 상태</SectionTitle>
          <EmptyState
            action={<Button leftIcon={<Plus size={16} aria-hidden />}>스터디 생성</Button>}
            className="mt-5"
            description="아직 등록된 내용이 없을 때 사용하는 공통 상태입니다."
            icon={<Inbox size={28} aria-hidden />}
            title="아직 등록된 내용이 없습니다"
          />
        </Card>

        <Card className="p-6 md:p-7">
          <SectionTitle>통계 막대 / 아바타</SectionTitle>
          <div className="mt-5 grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <ProgressBar label="전체" value={72} />
              <WeeklyProgressList items={progressItems} />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <Avatar name="민지" />
              <AvatarGroup users={avatarUsers} />
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <SectionTitle>파일 업로드 / 파일 목록</SectionTitle>
          <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1fr]">
            <FileUploader
              files={files}
              helperText="PDF, MD, TXT 파일을 업로드할 수 있습니다."
              label="자료 업로드"
              multiple
              onChange={setFiles}
              onRemove={(file) => setFiles((current) => current.filter((item) => item !== file))}
            />
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-stology-border-light bg-white px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="size-5 shrink-0 text-stology-electric-blue" aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate text-label text-stology-text-dark">1주차 학습 자료</p>
                    <p className="text-caption text-stology-text-light">3분 전에 업로드됨</p>
                  </div>
                </div>
                <Badge variant="success">확정</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-stology-border-light bg-white px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="size-5 shrink-0 text-stology-electric-blue" aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate text-label text-stology-text-dark">지식 후보</p>
                    <p className="text-caption text-stology-text-light">AI 추출이 완료되었습니다</p>
                  </div>
                </div>
                <Badge variant="warning">검토 필요</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <SectionTitle>토글 형식</SectionTitle>
          <Accordion
            allowMultiple
            className="mt-5"
            defaultOpenIds={['record-3']}
            items={accordionItems}
          />
        </Card>

        <Card className="p-6 md:p-7">
          <SectionTitle>페이지네이션</SectionTitle>
          <div className="mt-5">
            <Pagination page={1} totalPages={5} />
          </div>
        </Card>
      </div>

      <Modal
        description="공통 Modal 컴포넌트 예시입니다."
        footer={
          <>
            <Button onClick={() => setIsModalOpen(false)} variant="outline">
              취소
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>저장</Button>
          </>
        }
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showCloseButton
        title="스터디 생성"
      >
        <div className="flex flex-col gap-4">
          <Input label="이름" placeholder="스터디 이름" />
          <Textarea label="메모" placeholder="메모를 입력하세요" />
        </div>
      </Modal>

      <ConfirmDialog
        cancelText="취소"
        confirmText="삭제"
        description="삭제한 내용은 되돌릴 수 없습니다."
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => setIsConfirmOpen(false)}
        title="항목을 삭제할까요?"
        variant="danger"
      />
    </AppLayout>
  );
};
