# Stology Frontend 작업 안내

이 문서는 AI 작업 정책의 정본입니다. 상세 기술·환경·기능 사실은 여기서 복제하지 않고 [문서 인덱스](docs/README.md)에 둡니다.

## 작업 전 읽기 순서

1. [문서 인덱스](docs/README.md)와 변경 대상의 온보딩/기능 문서를 읽습니다.
2. 변경 대상 소스와 설정을 다시 확인합니다. 문서보다 현재 코드·설정이 사실의 기준입니다.
3. 변경 범위에 맞는 [코드 관례](docs/guides/code-conventions.md)와 [PR 검토](docs/guides/pr-review.md)를 확인합니다.

## 현재 구조 지도

- 애플리케이션 조립과 라우팅은 `src/app`, 화면은 `src/pages`, 공용 코드와 UI는 `src/shared`에 있습니다.
- 기능별 상세와 탐색 경로는 [기능 온보딩](docs/onboarding/domain/README.md)을 기준으로 합니다.
- React 함수 컴포넌트와 hooks를 사용하고, 스타일은 Tailwind CSS를 우선합니다.
- 서버 상태는 TanStack Query, 클라이언트/UI 상태는 Zustand, 검증이 필요한 폼은 React Hook Form과 Zod를 사용합니다.

## 작업 규칙

- 화면·컴포넌트는 PascalCase, hook은 camelCase, 유틸리티와 기타 파일은 snake_case를 사용합니다.
- 일반 함수는 function 선언을, 컴포넌트는 화살표 함수를 사용하고 메인 컴포넌트를 파일 상단에 둡니다. Props interface를 명시합니다.
- 공용화 전 기능 로컬 컴포넌트를 우선하며, 합의 없이 CSS-in-JS를 도입하지 않습니다.
- 화면 변경 시 loading, empty, error, permission, disabled, 종료된 스터디의 읽기 전용 상태를 검토합니다.
- AI는 Concept 후보만 제안하며 팀 검토를 거쳐 활성화됩니다. 질문은 Q&A에서 별도로 관리하며 Concept로 자동 변환하지 않습니다.
- 코드·설정 변경 시 영향을 받는 온보딩·기능·가이드 문서도 함께 갱신합니다.
- 되돌리기 어려운 실제 결정만 [ADR](docs/adr/README.md)로 기록합니다.
