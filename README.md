# Stology Frontend

Stology는 스터디에서 생성되는 학습자료를 서비스 제공 온톨로지 Concept와 연결하고, 팀 검토를 거쳐 지식 구조와 커버리지 리포트로 정리하는 스터디 운영 보조 서비스입니다.

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

## 브랜치 전략

```txt
main
└─ dev
   └─ feature/*
```

- `main`: 배포/최종 안정 브랜치
- `dev`: 개발 통합 브랜치
- `feature/*`, `chore/*`, `fix/*`: 작업 브랜치

## 실행 방법

```bash
pnpm install
pnpm dev
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

PowerShell에서 `pnpm` 실행 정책 오류가 발생하면 `pnpm.cmd`를 사용합니다.

```bash
pnpm.cmd install
pnpm.cmd dev
```

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

## 화면 목록

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
