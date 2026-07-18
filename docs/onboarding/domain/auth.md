# 인증·초대

## 탐색 경로

- 로그인 화면: `src/pages/login/LoginPage.tsx`
- 초대 수락 화면: `src/pages/invite/InvitePage.tsx`
- 라우트: `/login`, `/invite/:token`
- HTTP 기반: `src/shared/api/http_client.ts`

## 제품 경계

`AUTH`는 인증과 라우팅, `HOME`은 스터디 진입, 초대는 초대 토큰을 통한 스터디 참여 흐름을 담당합니다. 인증 여부 판정, redirect, token 저장 방식을 변경할 때는 현재 라우터·provider·HTTP client 구현을 함께 확인하며 문서만으로 계약을 추정하지 않습니다.
