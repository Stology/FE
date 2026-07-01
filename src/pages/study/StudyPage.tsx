import { Navigate, NavLink, useParams } from 'react-router-dom';

const tabs = [
  { id: 'knowledge', label: '지식 구조' },
  { id: 'upload', label: '자료 업로드' },
  { id: 'records', label: '주차별 기록' },
  { id: 'reports', label: '주차별 리포트' },
  { id: 'questions', label: '질문함' },
];

const tabDescriptions: Record<string, string> = {
  knowledge: '온톨로지 기반 Concept 그래프와 노드 상세를 표시합니다.',
  upload: '마크다운 업로드, 텍스트 입력, AI 후보 추출 대기 자료를 관리합니다.',
  records: '주차별 활성/보강 노드와 연결 자료를 확인합니다.',
  reports: '커버리지, 부족 개념, 팀원 활동 통계를 확인합니다.',
  questions: '질문 게시글, 답글, 이미지 첨부를 관리합니다.',
};

interface StudyRouteParams extends Record<string, string | undefined> {
  studyId: string;
  tab?: string;
}

export const StudyPage = () => {
  const { studyId, tab = 'knowledge' } = useParams<StudyRouteParams>();

  if (!studyId) {
    return <Navigate to="/" replace />;
  }

  const activeTab = tabs.some((item) => item.id === tab) ? tab : 'knowledge';

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-stology-600">STD000</p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Spring Boot 백엔드 스터디</h1>
              <p className="mt-2 text-sm text-slate-500">
                현재 3주차 · 멤버 4명 · 시작일 2026-06-22
              </p>
            </div>
            <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              설정
            </button>
          </div>

          <nav className="mt-6 flex flex-wrap gap-2">
            {tabs.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  [
                    'rounded-md px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-stology-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  ].join(' ')
                }
                key={item.id}
                to={`/studies/${studyId}/${item.id}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-stology-600">
            {tabs.find((item) => item.id === activeTab)?.label}
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">초기 UI 구현 영역</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{tabDescriptions[activeTab]}</p>
        </section>
      </div>
    </main>
  );
};
