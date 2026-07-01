import { useParams } from 'react-router-dom';

export const InvitePage = () => {
  const { token } = useParams();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-2 text-sm font-medium text-stology-600">INV001</p>
        <h1 className="text-2xl font-bold text-slate-950">스터디 초대 수락</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          초대 토큰 검증 후 스터디명, 스터디장, 현재 멤버 수를 표시할 화면입니다.
        </p>
        <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-500">
          token: {token}
        </p>
        <button className="mt-6 w-full rounded-md bg-stology-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stology-700">
          참여하기
        </button>
      </section>
    </main>
  );
};
