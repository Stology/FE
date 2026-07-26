export type StudyStatus = 'active' | 'ended';

export type MaterialStatus =
  'extracting' | 'extract_failed' | 'needs_review' | 'editable' | 'confirmed';

export type ReviewAction = 'approved' | 'rejected';

export type ConceptRelationType = 'base' | 'context' | 'extension' | 'contrast';

export type UploadMode = 'file' | 'text';

export interface Material {
  description?: string;
  id: string;
  isOwn: boolean;
  status: MaterialStatus;
  title: string;
  uploadedAt: string;
  uploaderName: string;
  week: number;
}

export interface MaterialDraft {
  content?: string;
  description?: string;
  fileName?: string;
  mode: UploadMode;
  title: string;
}

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

export type WeeklyReportConceptStatus = WeeklyRecordStatus;

export type WeeklyReportRecommendationType = 'missed' | 'deepening' | 'related';

export interface WeeklyReportCoreConcept {
  id: string;
  materialCount: number;
  name: string;
  status: WeeklyReportConceptStatus;
}

export interface WeeklyReportRecommendation {
  id: string;
  name: string;
  reason: string;
  type: WeeklyReportRecommendationType;
}

export interface WeeklyReportMemberActivity {
  comment: string;
  memberId: string;
  memberName: string;
  questionCount: number;
  uploadCount: number;
}

export interface WeeklyReport {
  aiReview: string;
  coreConcepts: WeeklyReportCoreConcept[];
  newlyActivatedCount: number;
  recommendations: WeeklyReportRecommendation[];
  reinforcedCount: number;
  teamActivities: WeeklyReportMemberActivity[];
  week: number;
}

export interface QuestionSummary {
  authorName: string;
  createdAt: string;
  hasAttachment: boolean;
  id: string;
  isMine: boolean;
  replyCount: number;
  title: string;
}

export interface QuestionReply {
  authorName: string;
  content: string;
  createdAt: string;
  id: string;
  isMine: boolean;
}

export interface QuestionDetail extends QuestionSummary {
  content: string;
  replies: QuestionReply[];
}
