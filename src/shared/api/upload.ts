import { httpClient } from './http_client';
import type { ApiResponse } from './response';

export type DataState = 'READY' | 'NEEDREVIEW' | 'EXTRACTIONFAILED' | 'EXTRACTING';

export interface RecentFileRes {
  createdAt: string;
  dataState: DataState;
  dataTitle: string;
  materialId: number;
  studyId: number;
  uploaderMemberId: number;
  uploaderName: string;
}

export const getStudyUploadFiles = async (studyId: string): Promise<RecentFileRes[]> => {
  const { data } = await httpClient.get<ApiResponse<{ files: RecentFileRes[] }>>(
    `/api/study/${studyId}/upload`,
  );
  return data.result.files ?? [];
};

export interface UploadMaterialReq {
  description?: string;
  file: File;
  title: string;
  week: number;
}

export const uploadMaterial = async (studyId: string, req: UploadMaterialReq): Promise<void> => {
  const formData = new FormData();
  formData.append('title', req.title);
  formData.append('week', String(req.week));
  if (req.description) formData.append('description', req.description);
  formData.append('file', req.file);

  await httpClient.post<ApiResponse<unknown>>(`/api/study/${studyId}/upload`, formData);
};

export interface UpdateMaterialReq {
  content?: string;
  dataTitle: string;
}

export const updateMaterial = async (
  studyId: string,
  materialId: number,
  req: UpdateMaterialReq,
): Promise<void> => {
  await httpClient.patch<ApiResponse<unknown>>(
    `/api/study/${studyId}/studyMaterial/${materialId}/upload`,
    req,
  );
};

export const analyzeMaterial = async (studyId: string, materialId: number): Promise<void> => {
  await httpClient.post<ApiResponse<unknown>>(
    `/api/study/${studyId}/studyMaterial/${materialId}/analyze`,
  );
};
