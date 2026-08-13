export type StudyStatus = 'active' | 'ended';

export type MaterialStatus =
  'extracting' | 'extract_failed' | 'needs_review' | 'editable' | 'confirmed';

export type ReviewAction = 'approved' | 'rejected';

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

export type ConceptRelationKind =
  'based-on' | 'associated-with' | 'advanced-from' | 'contrasted-with';

export type KnowledgeEdgeKind = ConceptRelationKind | 'evidence';

export type KnowledgeClusterAccent =
  'accent-1' | 'accent-2' | 'accent-3' | 'accent-4' | 'accent-5' | 'accent-6';

export interface KnowledgeCluster {
  accent: KnowledgeClusterAccent;
  id: string;
  label: string;
}

interface KnowledgeNodeBase {
  clusterId: string;
  degree: number;
  id: string;
  importance: 1 | 2 | 3 | 4 | 5;
  isRoot: boolean;
  label: string;
  week: number;
}

export interface KnowledgeConceptNode extends KnowledgeNodeBase {
  activatedWeek?: number;
  aliases: string[];
  definition: string;
  materialCount: number;
  reinforcedWeeks: number[];
  state: 'active' | 'inactive';
  type: 'concept';
}

export interface KnowledgeMaterialNode extends KnowledgeNodeBase {
  material: WeeklyRecordMaterial;
  type: 'material';
}

export type KnowledgeNode = KnowledgeConceptNode | KnowledgeMaterialNode;

export interface KnowledgeEdge {
  kind: KnowledgeEdgeKind;
  source: string;
  target: string;
}

export interface KnowledgeGraph {
  clusters: KnowledgeCluster[];
  edges: KnowledgeEdge[];
  nodes: KnowledgeNode[];
}

export interface NodeCandidate {
  approverNames: string[];
  id: string;
  matchReason: string;
  myAction?: ReviewAction;
  name: string;
  rejecterNames: string[];
  reviewerCount: number;
}

export interface MaterialDraft {
  content?: string;
  description?: string;
  file?: File;
  fileName?: string;
  mode: UploadMode;
  title: string;
  week: number;
}

export interface Study {
  id: string;
  name: string;
  currentWeek: number;
  isNew: boolean;
  memberCount: number;
  members: string[];
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

export interface QuestionImage {
  id: string;
  url: string;
}

export interface QuestionReply {
  authorName: string;
  content: string;
  createdAt: string;
  id: string;
  images?: QuestionImage[];
  isMine: boolean;
}

export interface QuestionDetail extends QuestionSummary {
  content: string;
  images?: QuestionImage[];
  replies: QuestionReply[];
}
