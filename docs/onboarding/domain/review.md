# AI 후보 검토

## 탐색 경로

- 화면: `src/pages/review/ReviewPage.tsx`
- 라우트: `/studies/:studyId/review/:materialId`
- 공유 모델: `src/shared/types/stology.ts`

## 제품 경계

`REV`는 업로드 자료에서 AI가 제안한 Concept 후보의 팀 검토를 담당합니다. AI 제안 자체가 활성 Concept가 아니며, 팀의 승인 결과만 지식 구조에 반영됩니다. 후보 상태를 연결할 때 loading, empty, error, permission, disabled 상태와 종료된 스터디의 읽기 전용 동작을 함께 확인합니다.
