# Stology Frontend

Stology는 스터디에서 생성되는 학습자료를 서비스 제공 온톨로지 Concept와 연결하고, 팀 검토를 거쳐 지식 구조와 커버리지 리포트로 정리하는 스터디 운영 보조 서비스입니다.

## 팀원 및 프론트엔드 역할 분담

| 팀원   | 역할 | 담당 범위                             |
| ------ | ---- | ------------------------------------- |
| 정민지 | A    | 라우터, 공통 레이아웃, 사이드바, 헤더 |
| 고원준 | B    | `AUTH` / `HOME`                       |
| 유제아 | C    | `STD-KNW` / `STD-UP` / `REV`          |
| 이상혁 | D    | `REC` / `RPT` / `QNA` / `COMMON`      |

- A: 라우팅 구조, 공통 레이아웃, 스터디 공통 헤더, 좌측 사이드바
- B: 로그인 화면, 홈, 스터디 카드, 스터디 생성 모달, 초대 링크 모달
- C: 지식 구조, 자료 업로드, AI 후보 검토
- D: 주차별 기록, 리포트, 질문함, 빈 상태/토스트/에러 상태

## 기술 스택

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Tailwind CSS
- ESLint
- Prettier
- Husky
- lint-staged

## 폴더 구조

```txt
src/
  app/
    providers/
    router/
  pages/
    home/
    invite/
    login/
    review/
    study/
  shared/
    api/
    config/
    lib/
    mocks/
    types/
    ui/
```

## 브랜치, 커밋, PR 컨벤션

### 브랜치 전략

```txt
main
└─ dev
   └─ feature/*
```

- `main`: 배포/최종 안정 브랜치
- `dev`: 개발 통합 브랜치
- `feature/*`, `chore/*`, `fix/*`: 작업 브랜치

- 작업 브랜치는 반드시 `dev`에서 생성합니다.
- PR의 base 브랜치는 `dev`로 설정합니다.
- `main`, `dev`에는 직접 push하지 않습니다.

### 브랜치 네이밍

```txt
타입/이슈번호-작업명
```

예시:

```txt
feat/6-login-ui
chore/1-project-setting
fix/12-ci-pnpm-version
docs/15-update-readme
```

### 타입

| 타입       | 설명                                |
| ---------- | ----------------------------------- |
| `feat`     | 새로운 기능 개발                    |
| `fix`      | 버그 수정                           |
| `chore`    | 프로젝트 설정, 패키지 설정, CI 설정 |
| `docs`     | 문서 수정                           |
| `style`    | UI 스타일 수정                      |
| `refactor` | 기능 변화 없는 코드 구조 개선       |
| `test`     | 테스트 코드 작성                    |
| `revert`   | PR 복구 또는 변경 되돌리기          |

### 커밋 메시지

```txt
타입: 작업 내용 (#이슈번호)
```

예시:

```bash
git commit -m "feat: 로그인 UI 구현 (#6)"
git commit -m "chore: 프로젝트 초기 설정 (#1)"
git commit -m "fix: CI pnpm 버전 충돌 수정 (#12)"
```

### PR 제목

```txt
타입(#이슈번호): 작업 내용
```

예시:

```txt
Feat(#6): 로그인 UI 구현
Chore(#1): 프로젝트 초기 설정
Fix(#12): CI pnpm 버전 충돌 수정
```

PR에는 관련 이슈, 기능 ID, 화면 ID, 우선순위, 작업 내용, 확인 방법, UI 변경 스크린샷을 작성합니다.

## 실행 방법

### 설치

```bash
pnpm install
```

Windows PowerShell에서 `pnpm` 실행 정책 오류가 발생하면 `pnpm.cmd`를 사용합니다.

```bash
pnpm.cmd install
```

### 개발 서버 실행

```bash
pnpm dev
```

또는 Windows PowerShell:

```bash
pnpm.cmd dev
```

## 주요 스크립트

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm format
pnpm format:check
```

PR 생성 전에는 아래 명령어를 확인합니다.

```bash
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd build
```

## 화면 목록 및 플로우

- `LGN001`: 로그인
- `INV001`: 초대 수락
- `HOM001`: 홈
- `STD000`: 스터디 컨테이너
- `STD001`: 지식 구조
- `UPL001`: 자료 업로드
- `REV001`: AI 후보 검토
- `REC001`: 주차별 기록
- `RPT001`: 주차별 리포트
- `QNA001`: 질문함

### 주요 플로우

```txt
로그인
→ 홈
→ 스터디 생성 또는 스터디 선택
→ 스터디 컨테이너
→ 자료 업로드
→ AI 후보 추출
→ AI 후보 검토
→ 승인된 Concept 지식 구조 반영
→ 주차별 기록/리포트 확인
```

```txt
초대 링크 진입
→ 로그인 필요 시 로그인
→ 초대 수락
→ 스터디 지식 구조 탭 진입
```

## 기능 Prefix

- `AUTH`: 인증/가입
- `HOME`: 홈
- `STD-COM`, `STD-MGT`, `STD-END`: 스터디 공통/관리/종료
- `STD-KNW`: 지식 구조
- `STD-UP`: 자료 업로드/AI 추출
- `REV`: AI 후보 검토
- `REC`, `RPT`: 주차별 기록/리포트
- `SRC`: 원본 자료 조회
- `QNA`: 질문함
- `COMMON`: 공통 상태
