import { describe, expect, it } from 'vitest';

import type { RecentFileRes } from '@/shared/api/upload';

import { mapRecentFileToMaterial } from './upload_api_mapper';

const baseFile: RecentFileRes = {
  createdAt: '2026-03-15T10:30:00',
  dataState: 'NEEDREVIEW',
  dataTitle: 'JWT 정리',
  materialId: 8,
  studyId: 4,
  uploaderMemberId: 7,
  uploaderName: '김철수',
};

describe('upload API mapper', () => {
  it('marks isOwn true when the uploader matches my memberId', () => {
    expect(mapRecentFileToMaterial(baseFile, 3, 7)).toEqual({
      id: '8',
      isOwn: true,
      status: 'needs_review',
      title: 'JWT 정리',
      uploadedAt: '2026-03-15',
      uploaderName: '김철수',
      week: 3,
    });
  });

  it('marks isOwn false when the uploader does not match my memberId', () => {
    expect(mapRecentFileToMaterial(baseFile, 3, 99).isOwn).toBe(false);
  });

  it('marks isOwn false when memberId is unknown (e.g. mock auth)', () => {
    expect(mapRecentFileToMaterial(baseFile, 3, null).isOwn).toBe(false);
  });

  it('maps every dataState to the matching Material status', () => {
    expect(mapRecentFileToMaterial({ ...baseFile, dataState: 'READY' }, 1, null).status).toBe(
      'confirmed',
    );
    expect(mapRecentFileToMaterial({ ...baseFile, dataState: 'EXTRACTING' }, 1, null).status).toBe(
      'extracting',
    );
    expect(
      mapRecentFileToMaterial({ ...baseFile, dataState: 'EXTRACTIONFAILED' }, 1, null).status,
    ).toBe('extract_failed');
  });
});
