import type { WeeklyReport } from '@/shared/types/stology';

interface WeeklyReportSummaryProps {
  report: WeeklyReport;
}

const statusLabel = {
  newly_activated: '신규',
  reinforced: '보강',
} as const;

export const WeeklyReportSummary = ({ report }: WeeklyReportSummaryProps) => {
  const totalCount = report.newlyActivatedCount + report.reinforcedCount;
  const newlyActivatedRate =
    totalCount === 0 ? 0 : Math.round((report.newlyActivatedCount / totalCount) * 100);
  const reinforcedRate = 100 - newlyActivatedRate;

  return (
    <section aria-labelledby="weekly-report-summary-title" className="px-5 py-5 sm:px-7">
      <h2
        className="text-[17px] font-bold leading-[22px] text-[#141414]"
        id="weekly-report-summary-title"
      >
        1. 진행 상황 요약
      </h2>
      <p className="mt-1 text-[11px] leading-4 text-[#6d6d6d]">
        도넛 그래프, 신규/보강 리스트, 핵심 노드를 한눈에 확인합니다.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[130px_1fr_1.2fr] lg:items-center">
        <div className="flex justify-center lg:justify-start">
          <div
            aria-label={`전체 활성 및 보강 노드 ${totalCount}개, 신규 ${newlyActivatedRate}%, 보강 ${reinforcedRate}%`}
            className="relative flex size-[120px] items-center justify-center rounded-full"
            role="img"
            style={{
              background: `conic-gradient(#2a2a2a 0 ${newlyActivatedRate}%, #d9d9d9 ${newlyActivatedRate}% 100%)`,
            }}
          >
            <div className="flex size-[76px] flex-col items-center justify-center rounded-full bg-white">
              <strong className="text-[18px] leading-[22px] text-[#141414]">{totalCount}개</strong>
              <span className="mt-0.5 text-[10px] leading-[14px] text-[#6d6d6d]">활성/보강</span>
            </div>
          </div>
        </div>

        <dl className="grid gap-3">
          <div className="flex min-h-[50px] items-center gap-3 rounded-lg border border-[#d1d1d1] px-4">
            <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-[#2a2a2a]" />
            <dt className="text-[13px] font-bold text-[#141414]">신규 활성화 노드</dt>
            <dd className="ml-auto text-[13px] font-bold text-[#141414]">
              {report.newlyActivatedCount}개 · {newlyActivatedRate}%
            </dd>
          </div>
          <div className="flex min-h-[50px] items-center gap-3 rounded-lg border border-[#d1d1d1] px-4">
            <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-[#d9d9d9]" />
            <dt className="text-[13px] font-bold text-[#141414]">기존 노드 보강</dt>
            <dd className="ml-auto text-[13px] font-bold text-[#141414]">
              {report.reinforcedCount}개 · {reinforcedRate}%
            </dd>
          </div>
        </dl>

        <div className="overflow-hidden rounded-lg border border-[#d1d1d1]">
          <table className="w-full table-fixed border-collapse text-left">
            <caption className="sr-only">이번 주 핵심 노드</caption>
            <thead className="bg-[#fafafa] text-[10px] font-medium text-[#6d6d6d]">
              <tr>
                <th className="px-3 py-2 font-medium" scope="col">
                  노드
                </th>
                <th className="w-20 px-3 py-2 font-medium" scope="col">
                  상태
                </th>
                <th className="w-16 px-3 py-2 text-right font-medium" scope="col">
                  자료
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5] text-[11px] text-[#141414]">
              {report.coreConcepts.map((concept) => (
                <tr key={concept.id}>
                  <th className="truncate px-3 py-2 font-medium" scope="row">
                    {concept.name}
                  </th>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-[#f0f0f0] px-2 py-1 text-[10px] font-semibold">
                      {statusLabel[concept.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">{concept.materialCount}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-5 rounded-lg border border-[#d1d1d1] bg-[#f9f9f9] px-5 py-3 text-[12px] leading-5 text-[#141414]">
        <strong>AI 리뷰:</strong> {report.aiReview}
      </p>
    </section>
  );
};
