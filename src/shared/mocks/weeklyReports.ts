import type { WeeklyReport } from '@/shared/types/stology';

export const mockWeeklyReports: WeeklyReport[] = [
  {
    week: 4,
    newlyActivatedCount: 5,
    reinforcedCount: 7,
    aiReview:
      '인증 흐름과 JWT 기반 세션 관리가 집중적으로 다뤄졌습니다. 다음 학습은 토큰 재발급·폐기 정책으로 이어가면 좋습니다.',
    coreConcepts: [
      {
        id: 'spring-security',
        name: 'Spring Security',
        status: 'newly_activated',
        materialCount: 3,
      },
      {
        id: 'jwt',
        name: 'JWT',
        status: 'reinforced',
        materialCount: 2,
      },
    ],
    recommendations: [
      {
        id: 'refresh-token',
        name: 'Refresh Token',
        reason: '재발급·만료 정책 자료가 부족합니다.',
        type: 'missed',
      },
      {
        id: 'token-rotation',
        name: 'Token Rotation',
        reason: '탈취 대응 이해를 보강하면 좋습니다.',
        type: 'deepening',
      },
      {
        id: 'session-revocation',
        name: 'Session Revocation',
        reason: '로그아웃·강제 만료 흐름과 연결됩니다.',
        type: 'related',
      },
    ],
    teamActivities: [
      {
        memberId: 'kim-cheolsu',
        memberName: '김철수',
        uploadCount: 5,
        questionCount: 3,
        comment: '핵심 개념 정리 자료를 꾸준히 올려 그래프 확장에 크게 기여했습니다.',
      },
      {
        memberId: 'lee-yeonghui',
        memberName: '이영희',
        uploadCount: 4,
        questionCount: 2,
        comment: '질문이 구체적이어서 부족 개념 발견에 도움이 됐습니다.',
      },
      {
        memberId: 'park-minsu',
        memberName: '박민수',
        uploadCount: 2,
        questionCount: 2,
        comment: '보강 노드 중심으로 참여했습니다. 다음 주 신규 개념 자료를 권장합니다.',
      },
      {
        memberId: 'choi-yujin',
        memberName: '최유진',
        uploadCount: 1,
        questionCount: 0,
        comment: '이번 주 활동량이 낮아 다음 주 질문 1개 이상 작성을 유도하면 좋습니다.',
      },
    ],
  },
];

export const mockWeeklyReportWeeks = mockWeeklyReports.map(({ week }) => week);

export const getMockWeeklyReport = (week: number) =>
  mockWeeklyReports.find((report) => report.week === week);
