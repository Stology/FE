import { useState } from 'react';

import { AppLayout, ErrorMessage, Loading } from '@/shared/ui';

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

  const { error: studiesError, isLoading: isStudiesLoading, studies } = useMyStudies();
  const { items: todoItems, removeItem: removeTodoItem } = useMyTodo();
  const { items: activityItems, removeItem: removeActivityItem } = useTeamActivity(selectedStudy);

  const isStudiesEmpty = !isStudiesLoading && !studiesError && studies.length === 0;

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
          {isStudiesLoading ? (
            <Loading className="w-full py-8" label="스터디 목록을 불러오는 중입니다..." />
          ) : studiesError ? (
            <ErrorMessage className="w-full max-w-md" message={studiesError.message} />
          ) : (
            <>
              {isStudiesEmpty && (
                <div className="flex items-center justify-center rounded-[8px] border border-dashed border-stology-border-light bg-stology-off-white px-6 py-4 text-body text-stology-text-light">
                  참여 중인 스터디가 없습니다.
                </div>
              )}
              {studies.map((study) => (
                <StudyCard key={study.id} study={study} />
              ))}
              {/* + 스터디 생성 카드 */}
              <CreateStudyCard onClick={() => setIsCreateModalOpen(true)} />
            </>
          )}
        </div>
      </section>

      {/* ── 내 할 일 + 팀 활동 ──────────────────────────────── */}
      <section className="mt-8 grid grid-cols-2 gap-6">
        <MyTodoPanel items={todoItems} onRemove={removeTodoItem} />
        <TeamActivityPanel
          items={activityItems}
          studies={studies}
          selectedStudy={selectedStudy}
          onStudyChange={setSelectedStudy}
          onRemove={removeActivityItem}
        />
      </section>

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
