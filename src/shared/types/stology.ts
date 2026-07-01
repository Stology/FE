export type StudyStatus = 'active' | 'ended';

export type MaterialStatus =
  'extracting' | 'extract_failed' | 'needs_review' | 'editable' | 'confirmed';

export type ReviewAction = 'approved' | 'rejected';

export type ConceptRelationType = 'base' | 'context' | 'extension' | 'contrast';

export interface Study {
  id: string;
  name: string;
  currentWeek: number;
  memberCount: number;
  startedAt: string;
  status: StudyStatus;
}

export interface Concept {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}
