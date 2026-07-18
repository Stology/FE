# 홈

## 탐색 경로

- 화면: `src/pages/home/HomePage.tsx`
- 라우트: `/`
- 현재 mock 스터디 데이터: `src/shared/mocks/studies.ts`
- 공유 모델: `src/shared/types/stology.ts`

## 제품 경계

`HOME`은 스터디 카드, 생성, 선택과 초대 링크 진입 전후의 홈 경험을 담당합니다. 목록을 서버 상태로 연결할 때 TanStack Query를 사용하고 loading, empty, error 상태를 함께 다룹니다. 종료된 스터디는 수정 가능한 화면으로 취급하지 않습니다.
