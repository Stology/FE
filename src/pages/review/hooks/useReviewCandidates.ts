import { useQueries, useQuery } from '@tanstack/react-query';

import { getKnowledgeGraphNode } from '@/shared/api/knowledge';
import { getExaminationInfo, type NodeCandidateVoteInfoRes } from '@/shared/api/review';
import type { NodeCandidate } from '@/shared/types/stology';

// PM 지시: AI 매칭 근거는 API로 안 받고 프론트에서 고정 문구 중 하나를 후보별로 배치한다.
const MATCH_REASONS = [
  '자료 본문에서 이 개념과 관련된 핵심 문장이 반복적으로 등장합니다.',
  '업로드된 자료의 제목과 개념명이 높은 연관성을 보입니다.',
  '이 개념과 관련된 용어가 자료 내 여러 문단에서 발견되었습니다.',
  '자료의 문맥상 이 개념이 핵심 주제로 다뤄지고 있습니다.',
  '유사 개념과의 연결 관계가 자료 내용과 일치합니다.',
];

const pickMatchReason = (candidateId: number) => MATCH_REASONS[candidateId % MATCH_REASONS.length];

const toNodeCandidate = (
  candidateInfo: NodeCandidateVoteInfoRes,
  title: string | undefined,
): NodeCandidate => ({
  approverNames: candidateInfo.memberVoteInfos
    .filter((vote) => vote.voteType === 'ACCEPT')
    .map((vote) => vote.name),
  id: String(candidateInfo.nodeCandidateId),
  matchReason: pickMatchReason(candidateInfo.nodeCandidateId),
  name: title ?? `노드 후보 #${candidateInfo.nodeCandidateId}`,
  rejecterNames: candidateInfo.memberVoteInfos
    .filter((vote) => vote.voteType === 'DENY')
    .map((vote) => vote.name),
  reviewerCount: candidateInfo.numberOfStudyMembers,
});

interface UseReviewCandidatesOptions {
  enabled: boolean;
}

/**
 * studyNodeId는 스터디에 이미 존재하는 개념 노드를 가리키므로(서정춘 확인),
 * 노드 상세 API로 title을 조회해 후보 이름으로 쓴다. get-examination-info 자체엔
 * 후보 이름이 없음(2-1 질문, 백엔드 답변 대기 중) — 이 방식이 틀렸다면 답변 오는 대로 교체.
 */
export const useReviewCandidates = (
  studyId: string | undefined,
  options: UseReviewCandidatesOptions,
) => {
  const { enabled } = options;

  const examinationQuery = useQuery({
    enabled: enabled && Boolean(studyId),
    queryFn: () => getExaminationInfo(studyId as string),
    queryKey: ['review', 'examination-info', studyId],
  });

  const candidateInfos = examinationQuery.data?.nodeCandidates ?? [];

  const nodeDetailQueries = useQueries({
    queries: candidateInfos.map((candidateInfo) => ({
      enabled: enabled && examinationQuery.isSuccess && Boolean(studyId),
      queryFn: () => getKnowledgeGraphNode(studyId as string, candidateInfo.studyNodeId),
      queryKey: ['knowledge-graph', 'node', studyId, candidateInfo.studyNodeId],
    })),
  });

  const areNodeDetailsSettled = nodeDetailQueries.every((query) => !query.isLoading);
  const isLoading =
    examinationQuery.isLoading || (candidateInfos.length > 0 && !areNodeDetailsSettled);
  const error =
    examinationQuery.error ?? nodeDetailQueries.find((query) => query.error)?.error ?? null;

  const candidates: NodeCandidate[] = candidateInfos.map((candidateInfo, index) =>
    toNodeCandidate(candidateInfo, nodeDetailQueries[index]?.data?.title),
  );

  const studyNodeIdByCandidateId = new Map<string, number>(
    candidateInfos.map((candidateInfo) => [
      String(candidateInfo.nodeCandidateId),
      candidateInfo.studyNodeId,
    ]),
  );

  return {
    candidates,
    error,
    isLoading,
    // examination-info뿐 아니라 후보별 노드 상세(이름) 조회까지 끝나야 완전히 준비된 것으로 본다.
    isReady: examinationQuery.isSuccess && areNodeDetailsSettled,
    studyNodeIdByCandidateId,
  };
};
