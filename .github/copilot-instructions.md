# GitHub Copilot Instructions

Copilot must follow these instructions when generating code or performing code reviews for Stology frontend.

## 1. Language & Tone

- Language: Korean.
- Tone: concise, professional, and solution-oriented.

## 2. Product Context

- Stology is a study operation assistant service.
- Study materials are matched to service-provided ontology concept templates.
- AI only proposes concept candidates. The team review flow decides what becomes active.
- Questions are managed in a separate Q&A board and are not automatically converted into concept nodes.
- Ended studies are read-only archives.

## 3. Tech Stack

- Framework: React with TypeScript and Vite.
- Styling: Tailwind CSS.
- Server State: TanStack Query.
- Client/UI State: Zustand.
- Forms: React Hook Form and Zod when validation is needed.

## 4. Feature Prefixes

- AUTH: authentication and routing.
- HOME: home, study cards, creation, invite link.
- STD-COM / STD-MGT / STD-END: study container, management, ended mode.
- STD-KNW: ontology graph and concept detail.
- STD-UP: material upload and AI extraction.
- REV: AI candidate review.
- REC / RPT: weekly records and coverage reports.
- SRC: source material popup.
- QNA: question board.
- COMMON: empty, loading, error, permission, disabled states.

## 5. File Naming Conventions

| Type               | Case       | Example                            |
| ------------------ | ---------- | ---------------------------------- |
| Pages & Components | PascalCase | `LoginPage.tsx`, `StudyHeader.tsx` |
| Hooks              | camelCase  | `useAuth.ts`, `useStudyQuery.ts`   |
| Utilities/Others   | snake_case | `auth_api.ts`, `date_utils.ts`     |

## 6. Code Naming Rules

| Type       | Rule                         | Example                                  |
| ---------- | ---------------------------- | ---------------------------------------- |
| Variables  | camelCase                    | `currentStudy`, `selectedWeek`           |
| Functions  | camelCase with verb          | `getStudyList`, `handleSubmit`           |
| Components | PascalCase                   | `KnowledgePage`, `ReviewCandidateCard`   |
| Boolean    | `is`, `has`, `should` prefix | `isLoading`, `hasError`, `shouldShowCTA` |
| Arrays     | plural or `List` suffix      | `studies`, `materialList`                |

## 7. Code Style

- Use functional components and hooks only.
- Use arrow functions for components and regular functions.
- Place the main component at the top of the file.
- Define Props interfaces explicitly.
- Prefer feature-local components before moving code to `shared/ui`.
- Do not introduce CSS-in-JS unless the team explicitly agrees.
- Consider loading, empty, error, permission, and ended-study states for every feature screen.

## 8. Branch & PR

- Branch flow: `main` -> `dev` -> `feature/*`.
- Feature branches must target `dev`.
- PR descriptions should include feature ID, screen ID, priority, test result, and screenshot when UI changes.
