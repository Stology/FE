# 스터디

## 탐색 경로

- 화면: `src/pages/study/StudyPage.tsx`
- 기본 진입: `/studies/:studyId`에서 `knowledge` 탭으로 이동
- 탭 라우트: `/studies/:studyId/:tab`
- 공유 모델: `src/shared/types/stology.ts`

## 제품 경계

`STD-COM`, `STD-MGT`, `STD-END`는 컨테이너·관리·종료 상태를, `STD-KNW`는 온톨로지 지식 구조를, `STD-UP`은 자료 업로드와 AI 추출을 담당합니다. 질문은 `QNA`에서 별도로 관리하며 Concept 노드로 자동 변환하지 않습니다. 종료된 스터디는 읽기 전용이고, 탭 추가나 변경 시 라우터와 화면의 허용 탭 처리를 함께 확인합니다.
