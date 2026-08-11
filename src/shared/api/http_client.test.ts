// @vitest-environment jsdom

import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useAuthStore } from '../stores/useAuthStore';
import { httpClient } from './http_client';

const originalAdapter = httpClient.defaults.adapter;

beforeEach(() => {
  useAuthStore.setState({
    accessToken: 'expired-token',
    isAuthenticated: true,
    isInitialized: true,
  });
});

afterEach(() => {
  httpClient.defaults.adapter = originalAdapter;
  useAuthStore.setState({ accessToken: null, isAuthenticated: false, isInitialized: false });
});

describe('httpClient authentication recovery', () => {
  it('401 응답이면 토큰을 한 번 재발급하고 원 요청을 재시도한다', async () => {
    let protectedRequestCount = 0;
    let reissueRequestCount = 0;

    httpClient.defaults.adapter = createAdapter(async (config) => {
      if (config.url === '/api/auth/reissue') {
        reissueRequestCount += 1;
        return createResponse(config, {
          code: 'AUTH200_2',
          errorDetail: null,
          message: '토큰이 재발급되었습니다.',
          result: { accessToken: 'reissued-token' },
          success: true,
        });
      }

      protectedRequestCount += 1;
      if (protectedRequestCount === 1) throw createHttpError(config, 401);

      expect(config.headers.Authorization).toBe('Bearer reissued-token');
      return createResponse(config, { result: 'ok' });
    });

    const response = await httpClient.get('/api/study/1/active-nodes');

    expect(response.data).toEqual({ result: 'ok' });
    expect(reissueRequestCount).toBe(1);
    expect(protectedRequestCount).toBe(2);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'reissued-token',
      isAuthenticated: true,
    });
  });

  it('동시에 발생한 401 응답은 하나의 재발급 요청을 공유한다', async () => {
    const requestCounts = new Map<string, number>();
    let reissueRequestCount = 0;

    httpClient.defaults.adapter = createAdapter(async (config) => {
      if (config.url === '/api/auth/reissue') {
        reissueRequestCount += 1;
        return createResponse(config, {
          code: 'AUTH200_2',
          errorDetail: null,
          message: '토큰이 재발급되었습니다.',
          result: { accessToken: 'shared-token' },
          success: true,
        });
      }

      const requestCount = (requestCounts.get(config.url ?? '') ?? 0) + 1;
      requestCounts.set(config.url ?? '', requestCount);
      if (requestCount === 1) throw createHttpError(config, 401);
      return createResponse(config, { result: config.url });
    });

    await Promise.all([
      httpClient.get('/api/study/1/question'),
      httpClient.get('/api/study/1/report/all'),
    ]);

    expect(reissueRequestCount).toBe(1);
  });

  it('재발급도 실패하면 인증 상태를 해제하고 오류를 전달한다', async () => {
    httpClient.defaults.adapter = createAdapter(async (config) => {
      throw createHttpError(config, 401);
    });

    await expect(httpClient.get('/api/study/1/question')).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  });
});

function createAdapter(
  handler: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>,
): AxiosAdapter {
  return (config) => handler(config);
}

function createResponse(config: InternalAxiosRequestConfig, data: unknown): AxiosResponse {
  return {
    config,
    data,
    headers: {},
    status: 200,
    statusText: 'OK',
  };
}

function createHttpError(config: InternalAxiosRequestConfig, status: number) {
  return {
    config,
    isAxiosError: true,
    message: `Request failed with status code ${status}`,
    response: {
      config,
      data: null,
      headers: {},
      status,
      statusText: 'Error',
    },
  };
}
