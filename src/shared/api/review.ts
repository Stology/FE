import { httpClient } from './http_client';
import type { ApiResponse } from './response';

export type VoteType = 'ACCEPT' | 'DENY';

export interface MemberVoteInfoRes {
  memberId: number;
  name: string;
  voteType: VoteType;
}

export interface NodeCandidateVoteInfoRes {
  memberVoteInfos: MemberVoteInfoRes[];
  nodeCandidateId: number;
  numberOfAcceptedStudyMembers: number;
  numberOfStudyMembers: number;
  studyNodeId: number;
}

export interface ExaminationInfoRes {
  nodeCandidates: NodeCandidateVoteInfoRes[];
}

export interface NodeVoteReq {
  nodeCandidateId: number;
  studyNodeId: number;
  voteType: VoteType;
}

export interface AcceptInfoRes {
  nodeCandidateId: number;
  studyNodeId: number;
  success: boolean;
}

export interface AcceptNodeRes {
  acceptInfos: AcceptInfoRes[];
}

export const getExaminationInfo = async (studyId: string): Promise<ExaminationInfoRes> => {
  const { data } = await httpClient.get<ApiResponse<ExaminationInfoRes>>(
    `/api/study/${studyId}/node/get-examination-info`,
  );
  return data.result;
};

export const acceptNodes = async (
  studyId: string,
  votes: NodeVoteReq[],
): Promise<AcceptNodeRes> => {
  const { data } = await httpClient.patch<ApiResponse<AcceptNodeRes>>(
    `/api/study/${studyId}/accept-node`,
    { votes },
  );
  return data.result;
};
