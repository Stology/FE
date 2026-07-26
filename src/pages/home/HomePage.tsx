import { useState } from 'react';

import { AppLayout } from '@/shared/ui';

import {
  CreateStudyCard,
  CreateStudyModal,
  InviteLinkModal,
  MyTodoPanel,
  StudyCard,
  TeamActivityPanel,
} from './components';
import { useMyStudies, useMyTodo, useTeamActivity } from './hooks';

export const HomePage = () => {
  const [selectedStudy, setSelectedStudy] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createdStudyInfo, setCreatedStudyInfo] = useState<{
    name: string;
    inviteToken: string;
  } | null>(null);

  const { studies } = useMyStudies();
  const { items: todoItems } = useMyTodo();
  const { items: activityItems } = useTeamActivity(selectedStudy);

  const handleStudyCreated = (createdStudy: { id: string; name: string; inviteToken: string }) => {
    setCreatedStudyInfo({
      name: createdStudy.name,
      inviteToken: createdStudy.inviteToken,
    });
  };

  return (
    <AppLayout>
      {/* ── 페이지 헤더 ─────────────────────────────────────── */}
      <div className="flex items-baseline gap-3">
        <h1 className="text-display-1 text-stology-text-dark">홈</h1>
        <p className="text-body text-stology-text-light">스터디와 최근 활동</p>
      </div>

      {/* ── 진행 중인 스터디 ─────────────────────────────────── */}
      <section className="mt-7">
        <h2 className="text-heading-1 text-stology-text-dark">진행 중인 스터디</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {studies.map((study) => (
            <StudyCard key={study.id} study={study} />
          ))}
          {/* + 스터디 생성 카드 (HOM001-0100 트리거) */}
          <CreateStudyCard onClick={() => setIsCreateModalOpen(true)} />
        </div>
      </section>

      {/* ── 내 할 일 + 팀 활동 ──────────────────────────────── */}
      <section className="mt-8 grid grid-cols-2 gap-6">
        <MyTodoPanel items={todoItems} />
        <TeamActivityPanel
          items={activityItems}
          studies={studies}
          selectedStudy={selectedStudy}
          onStudyChange={setSelectedStudy}
        />
      </section>

      {/* 스터디 생성 모달 (HOM001-0100) */}
      <CreateStudyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleStudyCreated}
      />

      {/* 초대 링크 모달 (HOM001-0110 연계) */}
      <InviteLinkModal
        isOpen={Boolean(createdStudyInfo)}
        onClose={() => setCreatedStudyInfo(null)}
        studyName={createdStudyInfo?.name}
        inviteToken={createdStudyInfo?.inviteToken}
      />
    </AppLayout>
  );
};
