import { httpClient } from './http_client';
import type { ApiResponse } from './types';

export interface ReissueRes {
  accessToken: string;
}

export const authApi = {
  reissue: async (): Promise<ReissueRes> => {
    const res = await httpClient.post<ApiResponse<ReissueRes>>('/api/auth/reissue');
    return res.data.result;
  },

  logout: async (): Promise<void> => {
    await httpClient.post<ApiResponse<void>>('/api/auth/logout');
  },
};
