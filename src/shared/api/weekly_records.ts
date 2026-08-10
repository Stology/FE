import { httpClient } from './http_client';
import type { ApiResponse } from './types';

export interface WeeklyRecordNodeRes {
  activationWeek: number;
  activeLevel: number;
  studyNodeId: number;
  title: string;
}

export interface WeeklyRecordNodesRes {
  nodes: WeeklyRecordNodeRes[];
}

export interface WeeklyRecordMaterialRes {
  createdAt: string;
  dataTitle: string;
  presignedUrl: string;
  studyMaterialId: number;
  updatedAt: string;
  uploaderName: string;
}

export interface WeeklyRecordNodeInfoRes {
  materials: WeeklyRecordMaterialRes[];
  studyNodeId: number;
}

export async function getWeeklyRecordNodes(
  studyId: string,
  week: number,
): Promise<WeeklyRecordNodesRes> {
  const { data } = await httpClient.get<ApiResponse<WeeklyRecordNodesRes>>(
    `/api/study/${studyId}/active-nodes`,
    { params: { week } },
  );

  return data.result;
}

export async function getWeeklyRecordNodeInfo(
  studyId: string,
  nodeId: string,
): Promise<WeeklyRecordNodeInfoRes> {
  const { data } = await httpClient.get<ApiResponse<WeeklyRecordNodeInfoRes>>(
    `/api/study/${studyId}/node/${nodeId}/info`,
  );

  return data.result;
}
