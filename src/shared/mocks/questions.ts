import type { QuestionDetail, QuestionReply, QuestionSummary } from '@/shared/types/stology';

export const mockQuestions: QuestionSummary[] = [
  {
    id: 'refresh-token-storage',
    title: 'Refresh Token 저장 위치가 궁금합니다',
    authorName: '민지',
    createdAt: '2026-03-15',
    isMine: false,
    replyCount: 3,
    hasAttachment: true,
  },
  {
    id: 'authentication-authorization',
    title: '인가와 인증의 차이',
    authorName: '현우',
    createdAt: '2026-03-14',
    isMine: false,
    replyCount: 0,
    hasAttachment: false,
  },
  {
    id: 'jwt-expiration',
    title: 'JWT 만료 시간 기준',
    authorName: '김철수',
    createdAt: '2026-03-13',
    isMine: true,
    replyCount: 2,
    hasAttachment: false,
  },
  {
    id: 'access-token-renewal',
    title: 'Access Token 재발급 시점이 궁금합니다',
    authorName: '이영희',
    createdAt: '2026-03-12',
    isMine: false,
    replyCount: 1,
    hasAttachment: false,
  },
  {
    id: 'session-cookie',
    title: '세션 쿠키의 SameSite 설정 기준',
    authorName: '박민수',
    createdAt: '2026-03-11',
    isMine: false,
    replyCount: 4,
    hasAttachment: true,
  },
  {
    id: 'oauth-scope',
    title: 'OAuth Scope는 어떻게 나누면 좋을까요?',
    authorName: '최유진',
    createdAt: '2026-03-10',
    isMine: false,
    replyCount: 1,
    hasAttachment: false,
  },
  {
    id: 'password-encoding',
    title: 'PasswordEncoder 비교 자료가 있나요?',
    authorName: '민지',
    createdAt: '2026-03-09',
    isMine: false,
    replyCount: 2,
    hasAttachment: true,
  },
  {
    id: 'csrf-token',
    title: 'CSRF 토큰이 필요한 요청 범위',
    authorName: '현우',
    createdAt: '2026-03-08',
    isMine: false,
    replyCount: 0,
    hasAttachment: false,
  },
  {
    id: 'security-filter',
    title: 'Security Filter 순서를 확인하고 싶습니다',
    authorName: '김철수',
    createdAt: '2026-03-07',
    isMine: false,
    replyCount: 3,
    hasAttachment: false,
  },
];

function createMockReplies(questionId: string, count: number): QuestionReply[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${questionId}-reply-${index + 1}`,
    authorName: index === count - 1 ? '김스토' : ['김철수', '이영희', '현우'][index % 3],
    content: `${index + 1}번째 답글입니다. 관련 내용을 확인해보겠습니다.`,
    createdAt: '2026-03-15',
    isMine: index === count - 1,
  }));
}

export const mockQuestionDetails: Record<string, QuestionDetail> = {
  'refresh-token-storage': {
    ...mockQuestions[0],
    content:
      'Refresh Token은 httpOnly 쿠키에 저장하는 게 안전할까요, 아니면 별도 저장소가 좋을까요?',
    replies: [
      {
        id: 'refresh-reply-1',
        authorName: '김철수',
        content: 'httpOnly + Secure 쿠키 권장이에요. XSS 노출을 막을 수 있습니다.',
        createdAt: '2026-03-15',
        isMine: false,
      },
      {
        id: 'refresh-reply-2',
        authorName: '이영희',
        content: 'CSRF 방어를 위해 SameSite 설정도 함께 확인해보세요.',
        createdAt: '2026-03-15',
        isMine: false,
      },
      {
        id: 'refresh-reply-3',
        authorName: '김스토',
        content: '서버의 토큰 재발급 정책도 같이 정리해볼게요.',
        createdAt: '2026-03-15',
        isMine: true,
      },
    ],
  },
  'authentication-authorization': {
    ...mockQuestions[1],
    content: '인증과 인가가 실제 요청 흐름에서 어떤 순서로 동작하는지 궁금합니다.',
    replies: [],
  },
  'jwt-expiration': {
    ...mockQuestions[2],
    content: 'Access Token과 Refresh Token의 만료 시간을 정하는 기준이 있나요?',
    replies: [
      {
        id: 'expiration-reply-1',
        authorName: '현우',
        content: '보안 수준과 사용자 경험을 함께 고려해서 정하는 것이 좋아요.',
        createdAt: '2026-03-14',
        isMine: false,
      },
      {
        id: 'expiration-reply-2',
        authorName: '김스토',
        content: '서비스 위험도에 따른 권장 시간을 더 찾아보겠습니다.',
        createdAt: '2026-03-14',
        isMine: true,
      },
    ],
  },
  'access-token-renewal': {
    ...mockQuestions[3],
    content: 'Access Token 만료 전에 재발급해야 하는지, 만료 응답 이후 처리해야 하는지 궁금합니다.',
    replies: createMockReplies('access-token-renewal', mockQuestions[3].replyCount),
  },
  'session-cookie': {
    ...mockQuestions[4],
    content: '세션 쿠키의 SameSite 속성을 서비스 환경별로 어떻게 설정하면 좋을까요?',
    replies: createMockReplies('session-cookie', mockQuestions[4].replyCount),
  },
  'oauth-scope': {
    ...mockQuestions[5],
    content: 'OAuth Scope를 기능 단위와 리소스 단위 중 어떤 기준으로 나누는지 궁금합니다.',
    replies: createMockReplies('oauth-scope', mockQuestions[5].replyCount),
  },
  'password-encoding': {
    ...mockQuestions[6],
    content: 'PasswordEncoder 구현체별 특징과 선택 기준을 비교한 자료가 있을까요?',
    replies: createMockReplies('password-encoding', mockQuestions[6].replyCount),
  },
  'csrf-token': {
    ...mockQuestions[7],
    content: 'CSRF 토큰 검증이 필요한 요청과 제외 가능한 요청의 기준이 궁금합니다.',
    replies: [],
  },
  'security-filter': {
    ...mockQuestions[8],
    content: 'Spring Security Filter의 실행 순서와 커스텀 필터 위치를 확인하고 싶습니다.',
    replies: createMockReplies('security-filter', mockQuestions[8].replyCount),
  },
};
