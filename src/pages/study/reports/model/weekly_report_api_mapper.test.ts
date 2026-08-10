import { describe, expect, it } from 'vitest';

import type { WeeklyReportRes } from '@/shared/api/weekly_reports';

import { mapWeeklyReport } from './weekly_report_api_mapper';

const reportResponse: WeeklyReportRes = {
  aiReviewContent: '인증 흐름을 고르게 학습했습니다.',
  currentWeek: 3,
  memberActivityStatisticsList: [
    {
      aiFeedback: '자료를 꾸준히 업로드했습니다.',
      materialUploadCount: 5,
      memberName: '김철수',
      questionCount: 3,
    },
  ],
  newActiveNodeCount: 2,
  newActiveNodePercentage: 67,
  recommendedNodeList: [
    { badge: '놓친', nodeName: 'Refresh Token', reason: '관련 자료가 부족합니다.' },
    { badge: '심화', nodeName: 'Token Rotation', reason: '추가 학습이 필요합니다.' },
    { badge: '연결', nodeName: 'Session', reason: '함께 학습하면 좋습니다.' },
  ],
  reinforcedNodeCount: 1,
  reinforcedNodePercentage: 33,
  reportId: 10,
  totalNodeCount: 3,
  totalWeeks: 4,
  weeklyCoreNodeList: [
    { materialCount: 3, nodeName: 'Spring Security', state: '신규 활성화' },
    { materialCount: 2, nodeName: 'JWT', state: '보강' },
    { materialCount: 0, nodeName: 'OAuth', state: '비활성' },
  ],
};

describe('mapWeeklyReport', () => {
  it('전체 리포트 응답을 화면 모델로 변환한다', () => {
    const result = mapWeeklyReport(reportResponse);

    expect(result.totalWeeks).toBe(4);
    expect(result.report).toMatchObject({
      aiReview: '인증 흐름을 고르게 학습했습니다.',
      coreConcepts: [
        {
          materialCount: 3,
          name: 'Spring Security',
          status: 'newly_activated',
        },
        { materialCount: 2, name: 'JWT', status: 'reinforced' },
      ],
      newlyActivatedCount: 2,
      recommendations: [
        { name: 'Refresh Token', type: 'missed' },
        { name: 'Token Rotation', type: 'deepening' },
        { name: 'Session', type: 'related' },
      ],
      reinforcedCount: 1,
      teamActivities: [
        {
          comment: '자료를 꾸준히 업로드했습니다.',
          memberName: '김철수',
          questionCount: 3,
          uploadCount: 5,
        },
      ],
      week: 3,
    });
  });
});
