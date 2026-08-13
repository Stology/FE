// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createAnswer,
  createQuestion,
  deleteAnswer,
  deleteQuestion,
  updateAnswer,
  updateQuestion,
} from './questions';
import { httpClient } from './http_client';

vi.mock('./http_client', () => ({
  httpClient: { delete: vi.fn(), patch: vi.fn(), post: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('question mutation API', () => {
  it('질문 작성과 수정 요청을 multipart FormData로 전송한다', async () => {
    const image = new File(['question'], 'question.png', { type: 'image/png' });
    const request = { content: '질문 본문\n[[img:new:0]]', images: [image], title: '질문 제목' };
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { code: 'QUESTION200_2', message: '', result: { questionId: 11 }, success: true },
    });
    vi.mocked(httpClient.patch).mockResolvedValue({
      data: { code: 'QUESTION200_3', message: '', result: { questionId: 11 }, success: true },
    });

    await createQuestion('1', request);
    await updateQuestion('1', '11', request);

    const createBody = vi.mocked(httpClient.post).mock.calls[0][1] as FormData;
    const updateBody = vi.mocked(httpClient.patch).mock.calls[0][1] as FormData;
    expect(httpClient.post).toHaveBeenCalledWith('/api/study/1/question', expect.any(FormData));
    expect(httpClient.patch).toHaveBeenCalledWith('/api/study/1/question/11', expect.any(FormData));
    expect(createBody.get('title')).toBe('질문 제목');
    expect(createBody.get('content')).toBe('질문 본문\n[[img:new:0]]');
    expect(createBody.getAll('images')).toEqual([image]);
    expect(updateBody.get('title')).toBe('질문 제목');
  });

  it('답글 작성과 수정 요청을 multipart FormData로 전송한다', async () => {
    const image = new File(['answer'], 'answer.png', { type: 'image/png' });
    const request = { content: '답글 본문\n[[img:new:0]]', images: [image] };
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { code: 'ANSWER200_1', message: '', result: { answerId: 21 }, success: true },
    });
    vi.mocked(httpClient.patch).mockResolvedValue({
      data: { code: 'ANSWER200_2', message: '', result: { answerId: 21 }, success: true },
    });

    await createAnswer('1', '11', request);
    await updateAnswer('1', '11', '21', request);

    const createBody = vi.mocked(httpClient.post).mock.calls[0][1] as FormData;
    expect(httpClient.post).toHaveBeenCalledWith(
      '/api/study/1/question/11/answer',
      expect.any(FormData),
    );
    expect(httpClient.patch).toHaveBeenCalledWith(
      '/api/study/1/question/11/answer/21',
      expect.any(FormData),
    );
    expect(createBody.get('content')).toBe('답글 본문\n[[img:new:0]]');
    expect(createBody.getAll('images')).toEqual([image]);
    expect(createBody.has('title')).toBe(false);
  });

  it('질문과 답글 삭제 엔드포인트를 호출한다', async () => {
    vi.mocked(httpClient.delete).mockResolvedValue({
      data: { code: 'OK', message: '', result: undefined, success: true },
    });

    await deleteQuestion('1', '11');
    await deleteAnswer('1', '11', '21');

    expect(httpClient.delete).toHaveBeenNthCalledWith(1, '/api/study/1/question/11');
    expect(httpClient.delete).toHaveBeenNthCalledWith(2, '/api/study/1/question/11/answer/21');
  });
});
