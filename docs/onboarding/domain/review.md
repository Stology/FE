# AI 후보 검토

## 탐색 경로

- 화면: `src/pages/review/ReviewPage.tsx`
- 라우트: `/studies/:studyId/review/:materialId`
- 공유 모델: `src/shared/types/stology.ts`

## 제품 경계

`REV`는 업로드 자료에서 AI가 제안한 Concept 후보의 팀 검토를 담당합니다. AI 제안 자체가 활성 Concept가 아니며, 팀의 승인 결과만 지식 구조에 반영됩니다. 후보 상태를 연결할 때 loading, empty, error, permission, disabled 상태와 종료된 스터디의 읽기 전용 동작을 함께 확인합니다.

## 검토 규칙

진입 경로는 자료 업로드 탭의 `검토 필요` 자료 선택입니다. 진행률은 팀 전체가 아니라 **본인이 검토한 후보 수**를 기준으로 계산합니다. 후보별 액션은 승인과 반려만 제공하며, 하단 액션 바는 선택된 후보 수와 함께 전체 승인·선택 승인·선택 반려를 노출합니다. `검토 마치기`는 모든 후보를 검토한 뒤에만 활성화합니다. 원본 자료 분할, 후보 수정, 코멘트 작성은 제공하지 않습니다.
