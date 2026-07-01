import { useParams } from 'react-router-dom';

const mockCandidates = ['DI', 'Bean', 'Controller'];

export const ReviewPage = () => {
  const { materialId } = useParams();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <section className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-stology-600">REV001</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">AI 후보 검토</h1>
        <p className="mt-2 text-sm text-slate-500">materialId: {materialId}</p>

        <div className="mt-6 space-y-3">
          {mockCandidates.map((candidate) => (
            <article
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
              key={candidate}
            >
              <div>
                <h2 className="font-semibold text-slate-950">{candidate}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Evidence와 온톨로지 매칭 정보를 표시할 후보 카드입니다.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md bg-stology-600 px-3 py-2 text-sm font-medium text-white">
                  승인
                </button>
                <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                  반려
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};
