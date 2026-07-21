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

export interface StudyTab {
  id: string;
  label: string;
  code: string;
}

export interface Concept {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export type WeeklyRecordStatus = 'newly_activated' | 'reinforced';

export interface WeeklyRecordMaterial {
  id: string;
  title: string;
  uploaderName: string;
  uploadedAt: string;
  downloadUrl?: string;
}

export interface WeeklyRecordConcept {
  id: string;
  name: string;
  status: WeeklyRecordStatus;
  materials: WeeklyRecordMaterial[];
}

export interface WeeklyRecord {
  week: number;
  concepts: WeeklyRecordConcept[];
}
