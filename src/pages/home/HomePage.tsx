import { useState } from 'react';

import { AppLayout, Button, EmptyState } from '@/shared/ui';

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

  const isEmpty = studies.length === 0;

  return (
    <AppLayout>
      {/* ── 페이지 헤더 ─────────────────────────────────────── */}
      <div className="flex items-baseline gap-3">
        <h1 className="text-display-1 text-stology-text-dark">홈</h1>
        <p className="text-body text-stology-text-light">스터디와 최근 활동</p>
      </div>

      {isEmpty ? (
        <div className="mt-7 flex h-[400px] items-center justify-center">
          <EmptyState
            title="진행 중인 스터디가 없습니다"
            description="새로운 스터디를 생성하고 팀원들과 함께 지식을 관리해보세요."
            action={
              <Button onClick={() => setIsCreateModalOpen(true)}>
                + 스터디 생성
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* ── 진행 중인 스터디 ─────────────────────────────────── */}
          <section className="mt-7">
            <h2 className="text-heading-1 text-stology-text-dark">진행 중인 스터디</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              {studies.map((study) => (
                <StudyCard key={study.id} study={study} />
              ))}
              {/* + 스터디 생성 카드 */}
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
        </>
      )}

      {/* ── 스터디 생성 모달 ─────────────────────────────────── */}
      <CreateStudyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(createdStudy) => {
          setCreatedStudyInfo({ name: createdStudy.name, inviteToken: createdStudy.inviteToken });
        }}
      />

      {/* ── 초대 링크 모달 ───────────────────────────────────── */}
      {createdStudyInfo && (
        <InviteLinkModal
          isOpen={!!createdStudyInfo}
          onClose={() => setCreatedStudyInfo(null)}
          studyName={createdStudyInfo.name}
          inviteToken={createdStudyInfo.inviteToken}
        />
      )}
    </AppLayout>
  );
};
