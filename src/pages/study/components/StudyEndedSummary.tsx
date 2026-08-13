import { CheckCircle2 } from 'lucide-react';

import type { CloseStudyRes } from '@/shared/api/study';
import { Button } from '@/shared/ui';

export interface StudyEndedSummaryProps {
  onGoHome: () => void;
  summary: CloseStudyRes;
}

export const StudyEndedSummary = ({ onGoHome, summary }: StudyEndedSummaryProps) => (
  <main className="flex min-h-screen items-center justify-center bg-stology-off-white px-5 py-12">
    <section className="w-full max-w-[560px] text-center" aria-labelledby="study-ended-title">
      <CheckCircle2 aria-hidden className="mx-auto size-16 text-stology-electric-blue" />
      <h1 className="mt-6 text-[28px] font-bold text-stology-text-dark" id="study-ended-title">
        스터디가 종료되었습니다
      </h1>
      <p className="mt-3 text-sm text-stology-text-light">이번 스터디에서 함께한 활동입니다.</p>

      <dl className="mt-8 grid grid-cols-3 divide-x divide-stology-border-light rounded border border-stology-border-light bg-white py-6">
        <SummaryItem label="총 활성 노드" value={summary.activeNodeCount} />
        <SummaryItem label="업로드된 자료" value={summary.uploadedMaterialCount} />
        <SummaryItem label="작성된 질문" value={summary.questionCount} />
      </dl>

      <Button className="mt-8 min-w-36" onClick={onGoHome}>
        홈으로 이동
      </Button>
    </section>
  </main>
);

interface SummaryItemProps {
  label: string;
  value: number;
}

const SummaryItem = ({ label, value }: SummaryItemProps) => (
  <div>
    <dt className="text-caption text-stology-text-light">{label}</dt>
    <dd className="mt-2 text-[24px] font-bold text-stology-text-dark">{value}개</dd>
  </div>
);
