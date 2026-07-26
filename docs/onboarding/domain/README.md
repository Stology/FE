# 기능 온보딩

`src`의 현재 탐색 지도입니다. 상세 동작은 문서보다 대상 소스를 우선해 확인합니다.

## 애플리케이션

- `src/main.tsx`: React 진입점
- `src/app/App.tsx`: 애플리케이션 루트
- `src/app/providers/AppProvider.tsx`: 전역 provider 조립
- `src/app/router/router.tsx`: 공개 라우트 정의

## 기능 화면

- [인증·초대](auth.md): `src/pages/login`, `src/pages/invite`
- [홈](home.md): `src/pages/home`
- [스터디](study.md): `src/pages/study`
- [AI 후보 검토](review.md): `src/pages/review`
- `src/pages/dev`: 공용 컴포넌트 확인용 개발 화면

## 공용 코드

- `src/shared/ui`: 공용 UI 컴포넌트와 barrel export
- `src/shared/api`: HTTP client
- `src/shared/types`: 공유 타입
- `src/shared/mocks`: 개발용 mock 데이터
- `src/shared/lib`: 공용 유틸리티
- `src/shared/assets`: 정적 asset

기능 코드는 먼저 해당 `pages` 경로에 두고, 여러 기능에서 실제로 재사용될 때 `shared` 이동을 검토합니다.
