# PR 검토

현재 코드 배치는 [코드 관례](code-conventions.md), 작업 정책은 [AGENTS.md](../../AGENTS.md), 문서 위치는 [문서 인덱스](../README.md)에서 확인합니다.

## 자동으로 확인할 항목

코드·설정 변경은 범위에 맞게 `pnpm format:check`, `pnpm lint`, `pnpm build`를 실행합니다. 실패를 숨기거나 검사를 사람의 판단으로 대체하지 않습니다. Markdown 전용 변경은 링크와 포맷을 확인하고 제품 빌드가 필요하지 않은 이유를 PR에 명시할 수 있습니다.

## 사람이 판단할 항목

### 문서

- 수정한 Markdown 링크와 heading anchor가 유효하고 문서 인덱스의 탐색 경로가 유지되는지 확인합니다.
- 현재 소스·설정과 API, 라우트, 환경 변수 설명이 동기화되었는지 확인합니다.
- 되돌리기 어려운 결정이면 [ADR](../adr/README.md) 조건을 검토합니다.

### 화면·상태·제품 규칙

- 기능 코드가 `app`, `pages`, `shared`의 현재 책임을 흐리지 않는지 확인합니다.
- loading, empty, error, permission, disabled와 종료된 스터디의 읽기 전용 상태를 확인합니다.
- AI 후보가 검토 없이 활성 Concept가 되거나 질문이 Concept로 자동 변환되지 않는지 확인합니다.
- UI 변경 PR에는 feature ID, screen ID, priority, 테스트 결과와 필요한 스크린샷이 포함되는지 확인합니다.
