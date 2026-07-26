import type { WeeklyReport, WeeklyReportConceptStatus } from '@/shared/types/stology';

interface WeeklyReportSummaryProps {
  report: WeeklyReport;
}

const statusLabel: Record<WeeklyReportConceptStatus, string> = {
  newly_activated: '신규',
  reinforced: '보강',
};

export const WeeklyReportSummary = ({ report }: WeeklyReportSummaryProps) => {
  const totalCount = report.newlyActivatedCount + report.reinforcedCount;
  const newlyActivatedRate =
    totalCount === 0 ? 0 : Math.round((report.newlyActivatedCount / totalCount) * 100);
  const reinforcedRate = 100 - newlyActivatedRate;

  return (
    <section aria-labelledby="weekly-report-summary-title" className="py-5">
      <h2
        className="text-[17px] font-bold leading-[22px] text-stology-text-dark"
        id="weekly-report-summary-title"
      >
        1. 진행 상황 요약
      </h2>
      <p className="mt-1 text-[11px] leading-4 text-stology-text-light">
        도넛 그래프, 신규/보강 리스트, 핵심 노드를 한눈에 확인합니다.
      </p>

      <div className="mt-4 grid gap-6 2xl:grid-cols-[390px_minmax(0,1fr)] 2xl:items-center">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center 2xl:justify-start">
          <div
            aria-label={`전체 활성 및 보강 노드 ${totalCount}개, 신규 ${newlyActivatedRate}%, 보강 ${reinforcedRate}%`}
            className="relative flex size-[130px] shrink-0 items-center justify-center rounded-full"
            role="img"
            style={{
              background: `conic-gradient(#3B82F6 0 ${newlyActivatedRate}%, #DBEAFE ${newlyActivatedRate}% 100%)`,
            }}
          >
            <div className="flex size-[84px] flex-col items-center justify-center rounded-full bg-white">
              <strong className="text-[20px] leading-[24px] text-stology-text-dark">
                {totalCount}개
              </strong>
              <span className="mt-0.5 text-[10px] leading-[14px] text-stology-text-light">
                활성/보강
              </span>
            </div>
          </div>

          <dl className="grid gap-2">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full bg-stology-electric-blue"
              />
              <dt className="text-[13px] text-stology-text-dark">신규 활성화 노드</dt>
              <dd className="text-[13px] text-stology-text-dark">
                {report.newlyActivatedCount}개 · {newlyActivatedRate}%
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-stology-light-blue" />
              <dt className="text-[13px] text-stology-text-dark">기존 노드 보강</dt>
              <dd className="text-[13px] text-stology-text-dark">
                {report.reinforcedCount}개 · {reinforcedRate}%
              </dd>
            </div>
          </dl>
        </div>

        <div className="overflow-hidden rounded-[5.5px] border border-stology-border-light">
          <table className="w-full table-fixed border-collapse text-left">
            <caption className="sr-only">이번 주 핵심 노드</caption>
            <thead className="bg-stology-off-white text-[11px] font-medium text-stology-text-light">
              <tr>
                <th className="px-3.5 py-2.5 font-medium" scope="col">
                  노드
                </th>
                <th className="w-[30%] px-3.5 py-2.5 font-medium" scope="col">
                  상태
                </th>
                <th className="w-[30%] px-3.5 py-2.5 font-medium" scope="col">
                  자료
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stology-border-light text-[11px] text-stology-text-dark">
              {report.coreConcepts.map((concept) => (
                <tr key={concept.id}>
                  <th className="truncate px-3.5 py-2.5 font-medium" scope="row">
                    {concept.name}
                  </th>
                  <td className="px-3.5 py-2.5">
                    <span className="text-[11px] font-medium text-stology-royal-blue">
                      {statusLabel[concept.status]}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5">{concept.materialCount}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-1 rounded-[5.5px] border border-stology-light-blue/40 bg-blue-50 px-5 py-3.5 text-[12px] leading-5 text-stology-royal-blue">
        <strong>AI 리뷰:</strong> {report.aiReview}
      </p>
    </section>
  );
};
