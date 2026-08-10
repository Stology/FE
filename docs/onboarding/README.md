# 온보딩

이 문서는 현재 빌드와 설정의 사실을 요약합니다. 환경 변수의 실제 비밀값은 문서나 저장소에 기록하지 않습니다.

## 실행 기반

- React 19, TypeScript 5.7, Vite 6 기반이며 패키지 매니저는 `pnpm@9.15.9`입니다.
- `pnpm install` 후 `pnpm dev`로 개발 서버를 실행합니다.
- 주요 검증 명령은 `pnpm format:check`, `pnpm lint`, `pnpm build`입니다.
- 주요 런타임 의존성은 React Router, TanStack Query, Axios, Zustand, React Hook Form, Zod입니다.
- 스타일은 Tailwind CSS 3와 전역 `src/styles.css`를 사용합니다.

## 설정과 환경 변수

- Vite 설정은 `vite.config.ts`, TypeScript 설정은 `tsconfig*.json`, Tailwind 설정은 `tailwind.config.ts`에서 확인합니다.
- `.env.example`을 `.env.local`로 복사한 뒤 로컬 환경에 필요한 값을 설정합니다. `.env.local`은 커밋하지 않습니다.
- `VITE_API_BASE_URL`은 공용 개발 API 주소를 지정합니다.
- `VITE_KAKAO_AUTH_URL`은 카카오 OAuth 시작 주소를 지정합니다.
- `VITE_ENABLE_MOCK_AUTH`는 로컬 목 인증 사용 여부를 지정합니다.
- 환경 변수를 변경한 뒤에는 `pnpm dev`를 다시 실행해야 합니다.
- `@` 경로 별칭은 실제 Vite 및 TypeScript 설정을 함께 확인한 뒤 사용합니다.

## 다음 읽기

화면과 공용 구성요소는 [기능 온보딩](domain/README.md)에서, 구현·검토 기준은 [가이드](../guides/README.md)에서 확인합니다.
