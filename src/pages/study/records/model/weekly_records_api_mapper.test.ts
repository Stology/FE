import { describe, expect, it } from 'vitest';

import { mapWeeklyRecordConcepts, mapWeeklyRecordMaterials } from './weekly_records_api_mapper';

describe('weekly records API mapper', () => {
  it('maps active levels to weekly record statuses', () => {
    expect(
      mapWeeklyRecordConcepts({
        nodes: [
          { activationWeek: 3, activeLevel: 1, studyNodeId: 10, title: 'JWT' },
          { activationWeek: 3, activeLevel: 2, studyNodeId: 11, title: 'Session' },
        ],
      }),
    ).toEqual([
      { id: '10', materials: [], name: 'JWT', status: 'newly_activated' },
      { id: '11', materials: [], name: 'Session', status: 'reinforced' },
    ]);
  });

  it('maps node materials and keeps the presigned download URL', () => {
    expect(
      mapWeeklyRecordMaterials({
        materials: [
          {
            createdAt: '2026-03-15T10:30:00',
            dataTitle: 'JWT 정리 노트',
            presignedUrl: 'https://example.com/jwt.md',
            studyMaterialId: 20,
            updatedAt: '2026-03-15T10:30:00',
            uploaderName: '김철수',
          },
        ],
        studyNodeId: 10,
      }),
    ).toEqual([
      {
        downloadUrl: 'https://example.com/jwt.md',
        id: '20',
        title: 'JWT 정리 노트',
        uploadedAt: '2026-03-15',
        uploaderName: '김철수',
      },
    ]);
  });
});
