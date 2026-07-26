import type { WeeklyRecord } from '@/shared/types/stology';

export const mockWeeklyRecords: WeeklyRecord[] = [
  {
    week: 1,
    concepts: [],
  },
  {
    week: 2,
    concepts: [],
  },
  {
    week: 3,
    concepts: [
      {
        id: 'api-gateway',
        name: 'API Gateway',
        status: 'newly_activated',
        materials: [],
      },
      {
        id: 'jwt',
        name: 'JWT',
        status: 'reinforced',
        materials: [
          {
            id: 'jwt-note',
            title: 'JWT 정리 노트',
            uploaderName: '김철수',
            uploadedAt: '2026-03-15',
            downloadUrl:
              'data:text/markdown;charset=utf-8,%23%20JWT%20%EC%A0%95%EB%A6%AC%20%EB%85%B8%ED%8A%B8',
          },
        ],
      },
      {
        id: 'refresh-token',
        name: 'Refresh Token',
        status: 'newly_activated',
        materials: [
          {
            id: 'auth-flow-summary',
            title: '인증 흐름 요약',
            uploaderName: '이영희',
            uploadedAt: '2026-03-14',
            downloadUrl:
              'data:text/markdown;charset=utf-8,%23%20%EC%9D%B8%EC%A6%9D%20%ED%9D%90%EB%A6%84%20%EC%9A%94%EC%95%BD',
          },
        ],
      },
      {
        id: 'session',
        name: 'Session',
        status: 'reinforced',
        materials: [],
      },
    ],
  },
  {
    week: 4,
    concepts: [],
  },
];

export const mockWeeklyRecordWeeks = mockWeeklyRecords.map(({ week }) => week);

export const getMockWeeklyRecord = (week: number) =>
  mockWeeklyRecords.find((record) => record.week === week);
