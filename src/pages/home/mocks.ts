/** 내 할 일 섹션 유형 */
export type MyTodoSection = '자료' | '질문함' | '리포트';

export interface MyTodoItem {
  section: MyTodoSection;
  summary: string;
  /** 상세 보기 이동 경로 */
  to: string;
}

/** 팀 활동 유형 */
export type TeamActivityType = '구조' | '답글' | '업로드';

export interface TeamActivityItem {
  id: string;
  type: TeamActivityType;
  /** 이벤트 요약 */
  summary: string;
  /** 이벤트 부연설명 */
  detail: string;
  /** 대상 (연관 개념 / 질문 등) */
  target: string;
  /** 시간 표시 (예: "8분", "23분") */
  timeAgo: string;
  /** 클릭 시 이동 경로 */
  to: string;
}

/** 내 할 일 - 자료/질문함/리포트 섹션 */
export const mockMyTodo: MyTodoItem[] = [
  {
    section: '자료',
    summary: '검토 5 · 재업로드 2',
    to: '/studies/spring-study/upload',
  },
  {
    section: '질문함',
    summary: '질문 7 · 답글 2',
    to: '/studies/spring-study/questions',
  },
  {
    section: '리포트',
    summary: '2개 스터디의 최신 리포트',
    to: '/studies/spring-study/reports',
  },
];

/** 팀 활동 - 최신순 */
export const mockTeamActivity: TeamActivityItem[] = [
  {
    id: 'spring-study-act-1',
    type: '구조',
    summary: '새 개념 5개 반영',
    detail: '지식 구조 탭 이동',
    target: '연관 개념',
    timeAgo: '8분',
    to: '/studies/spring-study/knowledge',
  },
  {
    id: 'spring-study-act-2',
    type: '답글',
    summary: '박서연님이 답글 등록',
    detail: '해당 질문 펼침',
    target: 'JPA 질문',
    timeAgo: '23분',
    to: '/studies/spring-study/questions',
  },
];
