import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppLayout } from '@/shared/ui';

import {
  CreateStudyCard,
  CreateStudyModal,
  InviteLinkModal,
  MyTodoPanel,
  StudyCard,
  TeamActivityPanel,
  QuestionDetailModal,
} from './components';
import { useMyStudies, useMyTodo, useTeamActivity } from './hooks';

interface CreatedStudyInvitation {
  inviteToken: string;
  name: string;
}

export const HomePage = () => {
  const navigate = useNavigate();
  const [selectedStudy, setSelectedStudy] = useState('all');
  const [isCreateStudyOpen, setIsCreateStudyOpen] = useState(false);
  const [isQuestionDetailModalOpen, setIsQuestionDetailModalOpen] = useState(false);
  const [createdStudyInvitation, setCreatedStudyInvitation] =
    useState<CreatedStudyInvitation | null>(null);

  const { studies } = useMyStudies();
  const { items: todoItems } = useMyTodo();
  const { items: activityItems } = useTeamActivity(selectedStudy);

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
          {/* + 스터디 생성 카드 */}
          <CreateStudyCard onClick={() => setIsCreateStudyOpen(true)} />
        </div>
      </section>

      {/* ── 내 할 일 + 팀 활동 ──────────────────────────────── */}
      <section className="mt-8 grid grid-cols-2 gap-6">
        <MyTodoPanel
          items={todoItems}
          onClickItem={(item) => {
            if (item.section === '질문함') {
              setIsQuestionDetailModalOpen(true);
            } else {
              navigate(item.to);
            }
          }}
        />
        <TeamActivityPanel
          items={activityItems}
          studies={studies}
          selectedStudy={selectedStudy}
          onStudyChange={setSelectedStudy}
        />
      </section>

      <CreateStudyModal
        isOpen={isCreateStudyOpen}
        onClose={() => setIsCreateStudyOpen(false)}
        onSuccess={({ inviteToken, name }) => setCreatedStudyInvitation({ inviteToken, name })}
      />
      <InviteLinkModal
        inviteToken={createdStudyInvitation?.inviteToken ?? ''}
        isOpen={createdStudyInvitation !== null}
        onClose={() => setCreatedStudyInvitation(null)}
        studyName={createdStudyInvitation?.name ?? ''}
      />
      <QuestionDetailModal
        isOpen={isQuestionDetailModalOpen}
        onClose={() => setIsQuestionDetailModalOpen(false)}
      />
    </AppLayout>
  );
};
