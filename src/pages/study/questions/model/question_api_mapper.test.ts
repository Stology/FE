import { describe, expect, it } from 'vitest';

import { mapQuestionDetail, mapQuestionList } from './question_api_mapper';

describe('question API mapper', () => {
  it('서버의 0-based 페이지와 질문 요약을 화면 모델로 변환한다', () => {
    expect(
      mapQuestionList({
        currentPage: 0,
        isFirst: true,
        isLast: true,
        listSize: 1,
        questionList: [
          {
            answerCount: 2,
            authorName: '김스토',
            createdAt: '2026-03-15T10:30:00.000',
            hasImage: true,
            isMine: true,
            questionId: 10,
            title: 'Refresh Token 질문',
          },
        ],
        studyEnded: false,
        totalElements: 1,
        totalPage: 1,
      }),
    ).toMatchObject({
      currentPage: 1,
      questions: [
        {
          createdAt: '2026-03-15',
          hasAttachment: true,
          id: '10',
          replyCount: 2,
        },
      ],
      studyEnded: false,
      totalPages: 1,
    });
  });

  it('질문 상세의 이미지와 답글을 화면 모델로 변환한다', () => {
    expect(
      mapQuestionDetail({
        answerList: [
          {
            answerId: 31,
            authorName: '이영희',
            content: '답글입니다.',
            createdAt: '2026-03-15T11:00:00.000',
            images: [{ imageId: 41, imageUrl: 'https://example.com/reply.png' }],
            isMine: false,
          },
        ],
        authorName: '김스토',
        content: '질문입니다. [[img:21]]',
        createdAt: '2026-03-15T10:30:00.000',
        images: [{ imageId: 21, imageUrl: 'https://example.com/question.png' }],
        isMine: true,
        questionId: 10,
        studyEnded: false,
        title: '질문 제목',
      }),
    ).toMatchObject({
      id: '10',
      images: [{ id: '21', url: 'https://example.com/question.png' }],
      replies: [
        {
          id: '31',
          images: [{ id: '41', url: 'https://example.com/reply.png' }],
        },
      ],
    });
  });
});
