import type {
  WeeklyReportRecommendation,
  WeeklyReportRecommendationType,
} from '@/shared/types/stology';
import { EmptyState } from '@/shared/ui';

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
}: WeeklyReportRecommendationsProps) => {
  const learningPath = recommendations.map(({ name }) => name).join(' → ');

  return (
    <section aria-labelledby="weekly-report-recommendations-title" className="pb-0 pt-7">
      <h2
        className="text-[17px] font-bold leading-[22px] text-stology-text-dark"
        id="weekly-report-recommendations-title"
      >
        2. 노드 추천 · 이어서 해보기
      </h2>
      <p className="mt-1 text-[11px] leading-4 text-stology-text-light">
        놓친 노드, 더 공부하면 좋을 노드를 이유와 함께 제시합니다.
      </p>

      <div className="mt-4 grid gap-3 2xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)] 2xl:gap-0">
        {recommendations.length === 0 ? (
          <EmptyState
            className="min-h-[205px] 2xl:col-span-2"
            description="이번 주차에는 추가로 추천할 학습 노드가 없습니다."
            title="추천 노드가 없습니다."
          />
        ) : (
          <>
            <ul className="grid gap-2">
              {recommendations.map((recommendation) => (
                <li
                  className="min-h-[63px] rounded-[5.5px] border border-stology-border-light bg-white px-4 py-2.5"
                  key={recommendation.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-[13px] leading-5 text-stology-text-dark">
                      {recommendation.name}
                    </strong>
                    <span className="rounded-full border border-stology-border-light bg-stology-off-white px-2.5 py-0.5 text-[10px] font-bold text-stology-text-light">
                      {recommendationLabel[recommendation.type]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-4 text-stology-text-light">
                    {recommendation.reason}
                  </p>
                </li>
              ))}
            </ul>

            <aside className="min-h-[205px] rounded-[5.5px] bg-stology-off-white p-4 2xl:rounded-l-none">
              <h3 className="text-[13px] font-bold leading-5 text-stology-text-dark">
                이어서 해보기
              </h3>
              <p className="mt-2 text-[13px] leading-[23px] text-stology-text-dark">
                <strong className="font-semibold text-stology-royal-blue">{learningPath}</strong>
                {' 순서로 보면 인증 흐름이 운영 정책으로 이어집니다.'}
              </p>
            </aside>
          </>
        )}
      </div>
    </section>
  );
};
