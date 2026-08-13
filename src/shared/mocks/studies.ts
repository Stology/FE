import type { StudyTab } from '@/shared/types/stology';

export const mockStudyContainer = {
  code: 'STD000',
  title: '스터디',
};

export const mockStudyTabs: StudyTab[] = [
  { id: 'knowledge', label: '지식 구조', code: 'STD001' },
  { id: 'upload', label: '자료 업로드', code: 'UPL001' },
  { id: 'records', label: '주차별 기록', code: 'REC001' },
  { id: 'reports', label: '주차별 리포트', code: 'RPT001' },
  { id: 'questions', label: '질문함', code: 'QNA001' },
];

export const getMockStudyTabById = (tabId: string) => mockStudyTabs.find((tab) => tab.id === tabId);
