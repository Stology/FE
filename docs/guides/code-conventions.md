# 코드 관례

아래는 현재 프로젝트의 규칙과 관찰된 배치입니다. 변경 전에는 대상 소스를 다시 확인합니다. 작업 정책은 [AGENTS.md](../../AGENTS.md), 기능 지도는 [기능 온보딩](../onboarding/domain/README.md)을 따릅니다.

## 배치와 이름

- 애플리케이션 조립은 `src/app`, 기능 화면은 `src/pages`, 공용 코드는 `src/shared`에 둡니다.
- 페이지와 컴포넌트 파일은 PascalCase, hook은 camelCase, 유틸리티와 기타 파일은 snake_case를 사용합니다.
- 변수는 camelCase, 함수는 동사로 시작하는 camelCase, boolean은 `is`, `has`, `should` 접두사, 배열은 복수형이나 `List` 접미사를 사용합니다.
- 컴포넌트는 화살표 함수, 일반 함수는 function 선언을 사용하며 Props interface를 명시합니다.

## 구현 원칙

- 기능 로컬 컴포넌트를 우선하고 실제 재사용 근거가 생긴 뒤 `shared/ui`로 옮깁니다.
- Tailwind CSS와 기존 `shared/ui` 조합을 우선하며 합의 없이 CSS-in-JS를 도입하지 않습니다.
- 서버 상태는 TanStack Query, 클라이언트/UI 상태는 Zustand, 검증 폼은 React Hook Form과 Zod를 사용합니다.
- API base URL과 공통 Axios 설정은 `src/shared/api/http_client.ts`에서 확인합니다.
- 화면에는 변경 범위에 맞는 loading, empty, error, permission, disabled, 읽기 전용 상태를 고려합니다.
