import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockStudies = [
  {
    id: 'spring-study',
    name: 'Spring Boot 백엔드 스터디',
    week: '3주차',
    hasNew: true,
  },
];

export const HomePage = () => (
  <main className="min-h-screen bg-slate-50">
    <div className="mx-auto flex w-full max-w-6xl gap-8 px-6 py-10">
      <aside className="w-64 shrink-0 rounded-lg border border-slate-200 bg-white p-5">
        <h1 className="text-xl font-bold text-slate-950">Stology</h1>
        <nav className="mt-8 space-y-2 text-sm text-slate-600">
          <Link className="block rounded-md bg-stology-50 px-3 py-2 text-stology-700" to="/">
            홈
          </Link>
          <p className="px-3 pt-4 text-xs font-semibold uppercase text-slate-400">스터디</p>
          {mockStudies.map((study) => (
            <Link
              className="block rounded-md px-3 py-2 hover:bg-slate-100"
              key={study.id}
              to={`/studies/${study.id}/knowledge`}
            >
              {study.name}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 flex-1">
        <div className="mb-8">
          <p className="text-sm font-medium text-stology-600">HOM001</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-950">홈</h2>
          <p className="mt-2 text-slate-600">참여 중인 스터디와 내 할 일을 확인합니다.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {mockStudies.map((study) => (
            <Link
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-stology-200 hover:shadow-md"
              key={study.id}
              to={`/studies/${study.id}/knowledge`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-950">{study.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{study.week}</p>
                </div>
                {study.hasNew ? (
                  <span className="rounded-full bg-stology-50 px-2 py-1 text-xs font-semibold text-stology-700">
                    NEW
                  </span>
                ) : null}
              </div>
            </Link>
          ))}

          <button className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-5 text-slate-500 transition hover:border-stology-300 hover:text-stology-700">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Plus size={18} aria-hidden />새 스터디 생성
            </span>
          </button>
        </div>
      </section>
    </div>
  </main>
);
