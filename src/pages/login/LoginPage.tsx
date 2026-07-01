import { BookOpen } from 'lucide-react';

export const LoginPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-md bg-stology-600 text-white">
          <BookOpen size={22} aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Stology</h1>
          <p className="text-sm text-slate-500">스터디 활동이 지식 구조가 되도록</p>
        </div>
      </div>

      <button className="w-full rounded-md bg-[#FEE500] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#f5dc00]">
        카카오로 로그인
      </button>
    </section>
  </main>
);
