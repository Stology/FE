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
