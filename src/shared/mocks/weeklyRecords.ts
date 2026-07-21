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
