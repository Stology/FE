import type { Study, StudyTab } from '@/shared/types/stology';

export const mockStudyContainer = {
  code: 'STD000',
  title: '스터디',
};

export const mockStudies: Study[] = [
  {
    id: 'spring-study',
    name: '백엔드 마스터',
    currentWeek: 3,
    memberCount: 4,
    startedAt: '2026-03-01',
    status: 'active',
  },
  {
    id: 'study-2',
    name: 'CS 스터디',
    currentWeek: 2,
    memberCount: 3,
    startedAt: '2026-03-08',
    status: 'active',
  },
  {
    id: 'algorithm',
    name: '알고리즘',
    currentWeek: 1,
    memberCount: 3,
    startedAt: '2026-03-15',
    status: 'active',
  },
  {
    id: 'ended-study',
    name: '종료된 스터디',
    currentWeek: 8,
    memberCount: 4,
    startedAt: '2026-01-05',
    status: 'ended',
  },
];

export const mockStudyTabs: StudyTab[] = [
  { id: 'knowledge', label: '지식 구조', code: 'STD001' },
  { id: 'upload', label: '자료 업로드', code: 'UPL001' },
  { id: 'records', label: '주차별 기록', code: 'REC001' },
  { id: 'reports', label: '주차별 리포트', code: 'RPT001' },
  { id: 'questions', label: '질문함', code: 'QNA001' },
];

export const getMockStudyById = (studyId: string) =>
  mockStudies.find((study) => study.id === studyId);

export const getMockStudyTabById = (tabId: string) => mockStudyTabs.find((tab) => tab.id === tabId);
