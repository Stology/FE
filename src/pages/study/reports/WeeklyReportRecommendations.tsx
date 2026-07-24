import type {
  WeeklyReportRecommendation,
  WeeklyReportRecommendationType,
} from '@/shared/types/stology';

interface WeeklyReportRecommendationsProps {
  recommendations: WeeklyReportRecommendation[];
}

const recommendationLabel: Record<WeeklyReportRecommendationType, string> = {
  missed: '놓친',
  deepening: '심화',
  related: '연결',
};

export const WeeklyReportRecommendations = ({
  recommendations,
}: WeeklyReportRecommendationsProps) => (
  <section
    aria-labelledby="weekly-report-recommendations-title"
    className="border-t border-[#d1d1d1] px-5 py-5 sm:px-7"
  >
    <h2
      className="text-[17px] font-bold leading-[22px] text-[#141414]"
      id="weekly-report-recommendations-title"
    >
      2. 노드 추천
    </h2>
    <p className="mt-1 text-[11px] leading-4 text-[#6d6d6d]">
      추천 유형, 노드명, 개별 사유를 확인합니다.
    </p>

    <ul className="mt-4 overflow-hidden rounded-lg border border-[#d1d1d1] border-l-[6px] border-l-[#1f1f1f]">
      {recommendations.map((recommendation) => (
        <li
          className="grid gap-1 border-b border-[#e5e5e5] px-4 py-2 last:border-b-0 sm:grid-cols-[145px_1fr_auto] sm:items-center sm:gap-3"
          key={recommendation.id}
        >
          <strong className="text-[11px] leading-4 text-[#141414]">{recommendation.name}</strong>
          <span className="text-[10px] leading-4 text-[#6d6d6d]">{recommendation.reason}</span>
          <span className="w-fit rounded-full border border-[#d1d1d1] bg-[#f0f0f0] px-2.5 py-0.5 text-[10px] font-bold text-[#1f1f1f]">
            {recommendationLabel[recommendation.type]}
          </span>
        </li>
      ))}
    </ul>
  </section>
);
