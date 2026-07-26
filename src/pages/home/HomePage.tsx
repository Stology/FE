import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppLayout, ErrorMessage, Loading } from '@/shared/ui';

import { CreateStudyCard, MyTodoPanel, StudyCard, TeamActivityPanel } from './components';
import { useMyStudies, useMyTodo, useTeamActivity } from './hooks';

export const HomePage = () => {
  const navigate = useNavigate();
  const [selectedStudy, setSelectedStudy] = useState('all');

  const { error: studiesError, isLoading: isStudiesLoading, studies } = useMyStudies();
  const { error: todoError, isLoading: isTodoLoading, items: todoItems } = useMyTodo();
  const {
    error: activityError,
    isLoading: isActivityLoading,
    items: activityItems,
  } = useTeamActivity(selectedStudy);

  return (
    <AppLayout>
      {/* ── 페이지 헤더 ─────────────────────────────────────── */}
      <div className="flex items-baseline gap-3">
        <h1 className="text-display-1 text-stology-text-dark">홈</h1>
        <p className="text-body text-stology-text-light">스터디와 최근 활동</p>
      </div>

      {/* ── 진행 중인 스터디 ─────────────────────────────────── */}
      <section aria-busy={isStudiesLoading} className="mt-7">
        <h2 className="text-heading-1 text-stology-text-dark">진행 중인 스터디</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {isStudiesLoading ? (
            <div aria-live="polite" className="min-h-[145px] min-w-64" role="status">
              <Loading className="h-full" label="스터디 목록을 불러오는 중입니다" />
            </div>
          ) : studiesError ? (
            <div className="min-h-[145px] w-full max-w-md" role="alert">
              <ErrorMessage
                className="mt-4"
                message={studiesError.message}
                title="스터디 목록을 불러오지 못했습니다"
              />
            </div>
          ) : studies.length > 0 ? (
            studies.map((study) => <StudyCard key={study.id} study={study} />)
          ) : (
            <p className="flex min-h-[145px] items-center text-body text-stology-text-light">
              아직 진행 중인 스터디가 없습니다.
            </p>
          )}
          {/* + 스터디 생성 카드 */}
          <CreateStudyCard onClick={() => navigate('/studies/create')} />
        </div>
      </section>

      {/* ── 내 할 일 + 팀 활동 ──────────────────────────────── */}
      <section className="mt-8 grid grid-cols-2 gap-6">
        <MyTodoPanel error={todoError} isLoading={isTodoLoading} items={todoItems} />
        <TeamActivityPanel
          error={activityError}
          isLoading={isActivityLoading}
          items={activityItems}
          studies={studies}
          selectedStudy={selectedStudy}
          onStudyChange={setSelectedStudy}
        />
      </section>
    </AppLayout>
  );
};
