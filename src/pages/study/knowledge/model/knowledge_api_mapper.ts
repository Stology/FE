import { computeDegree } from '@/shared/lib/knowledge_activation';
import type {
  KnowledgeGraphEdgeRes,
  KnowledgeGraphRes,
  NodeDetailRes,
} from '@/shared/api/knowledge';
import type {
  KnowledgeConceptNode,
  KnowledgeEdge,
  KnowledgeEdgeKind,
  KnowledgeGraph,
  WeeklyRecordMaterial,
} from '@/shared/types/stology';

const DEFAULT_CLUSTER_ID = 'default';

// 실서버 확인 결과(2026-08-07, 테스트 스터디 조회): EdgeDto.relation은 영어 슬러그가 아니라
// 한글 라벨("기반"/"맥락"/"확장"/"대조")로 내려온다. 일부 템플릿(예: 떡볶이 데모)엔 "양념",
// "주재료"처럼 4종에 안 속하는 자유 문자열도 섞여 있어 완전한 열거형은 아님.
const RELATION_KIND_BY_RAW: Record<string, KnowledgeEdgeKind> = {
  기반: 'based-on',
  대조: 'contrasted-with',
  맥락: 'associated-with',
  확장: 'advanced-from',
};

/**
 * 알려진 4종 한글 라벨로 매칭되면 그대로 쓰고, 아니면(자유 문자열 relation) 'associated-with'로
 * 완화해서 화면이 깨지지 않게 하되 콘솔에 남겨 실제 값을 확인할 수 있게 한다.
 */
const mapRelationKind = (raw: string): KnowledgeEdgeKind => {
  const mapped = RELATION_KIND_BY_RAW[raw.trim()];
  if (mapped) return mapped;

  console.warn(`[knowledge] 알 수 없는 relation 값: "${raw}" — associated-with으로 대체함`);
  return 'associated-with';
};

const mapEdge = (edge: KnowledgeGraphEdgeRes): KnowledgeEdge => ({
  kind: mapRelationKind(edge.relation),
  source: String(edge.source),
  target: String(edge.target),
});

const clampImportance = (activeLevel: number): KnowledgeConceptNode['importance'] => {
  const clamped = Math.min(5, Math.max(1, Math.round(activeLevel)));
  return clamped as KnowledgeConceptNode['importance'];
};

/**
 * 실 API 그래프 목록을 3D 엔진이 쓰는 내부 KnowledgeGraph 형태로 변환한다.
 *
 * 백엔드에 없는 필드는 다음과 같이 근사한다(제품 결정/추측 — 데이터 생기면 교체):
 * - clusterId: 백엔드에 클러스터 개념이 없어 모든 노드를 단일 클러스터로 묶음
 * - isRoot: 판단 근거 없어 항상 false
 * - importance: activeLevel을 1~5로 clamp
 * - materialCount(내부 필드, "활성 강도" 색상용): 실제 자료 개수가 아니라 activeLevel을 그대로 씀
 *   (기용님 가이드: 활성도 표현에는 activeLevel 사용)
 * - reinforcedWeeks: 목록 API엔 주차별 이력이 없어 항상 빈 배열
 */
export const mapKnowledgeGraphRes = (res: KnowledgeGraphRes): KnowledgeGraph => {
  const edges = res.edges.map(mapEdge);

  const nodes: KnowledgeConceptNode[] = res.nodes.map((dto) => {
    const id = String(dto.id);
    const isActive = dto.activeLevel > 0;

    return {
      activatedWeek: isActive ? dto.activationWeek : undefined,
      aliases: [],
      clusterId: DEFAULT_CLUSTER_ID,
      definition: dto.description ?? '',
      degree: computeDegree(id, edges),
      id,
      importance: clampImportance(dto.activeLevel),
      isRoot: false,
      label: dto.title,
      materialCount: dto.activeLevel,
      reinforcedWeeks: [],
      state: isActive ? 'active' : 'inactive',
      type: 'concept',
      week: dto.activationWeek || dto.recommendWeek || 1,
    };
  });

  return {
    clusters: [{ accent: 'accent-1', id: DEFAULT_CLUSTER_ID, label: '전체' }],
    edges,
    nodes,
  };
};

/** 노드 상세 응답의 최근 자료 목록을 인스펙터가 쓰는 형태로 변환한다. */
export const mapNodeDetailMaterials = (detail: NodeDetailRes): WeeklyRecordMaterial[] =>
  detail.recentMaterials.map((material) => ({
    id: String(material.id),
    title: material.title,
    uploadedAt: material.createdAt,
    uploaderName: material.memberName,
  }));
