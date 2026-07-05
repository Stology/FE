# Stology Design Tokens

Figma에서 확인한 공통 색상과 타이포그래피는 `tailwind.config.ts`의 `stology` 토큰으로 관리한다.

컴포넌트에서는 hex 값을 직접 쓰기보다 Tailwind class를 우선 사용한다. 단, Figma 값이 Tailwind 기본 scale에 없는 경우에만 arbitrary value를 사용한다.

## Color

| Figma Token                  | Hex       | Tailwind Class 예시                                      | 사용처                              |
| ---------------------------- | --------- | -------------------------------------------------------- | ----------------------------------- |
| `Color/Brand/Deep-Navy`      | `#0A192F` | `bg-stology-deep-navy`, `text-stology-deep-navy`         | 헤더, 사이드바 active, 로고 배지    |
| `Color/Brand/Royal-Blue`     | `#1E3A8A` | `bg-stology-royal-blue`, `text-stology-royal-blue`       | 보조 강조 텍스트                    |
| `Color/Brand/Electric-Blue`  | `#3B82F6` | `bg-stology-electric-blue`, `text-stology-electric-blue` | Primary 버튼, active tab, 파란 배지 |
| `Color/Brand/Light-Blue`     | `#93C5FD` | `bg-stology-light-blue`, `border-stology-light-blue`     | hover, focus ring                   |
| `Color/Neutral/Off-White`    | `#F8FAFC` | `bg-stology-off-white`                                   | 페이지, 사이드바 배경               |
| `Color/Neutral/Border-Light` | `#E5E7EB` | `border-stology-border-light`                            | 기본 테두리, 구분선                 |
| `Color/Text/Dark`            | `#1F2937` | `text-stology-text-dark`                                 | 본문 텍스트                         |
| `Color/Text/Light`           | `#6B7280` | `text-stology-text-light`                                | 보조 텍스트, 메타 정보              |
| `Color/Semantic/Success-BG`  | `#ECFDF5` | `bg-stology-approve-bg`                                  | 승인 상태 배경                      |
| `Color/Semantic/Success`     | `#10B981` | `bg-stology-approve`, `text-stology-approve`             | 승인 상태, 승인 버튼                |
| `Color/Semantic/Danger-BG`   | `#FEF2F2` | `bg-stology-reject-bg`                                   | 반려 상태 배경                      |
| `Color/Semantic/Danger`      | `#EF4444` | `bg-stology-reject`, `text-stology-reject`               | 반려 상태, 반려 버튼                |
| `Color/Semantic/Pending-Bar` | `#D1D5DB` | `bg-stology-pending`                                     | 대기/비활성 상태                    |

배지처럼 특정 컴포넌트 variant에서만 쓰는 색상은 `tailwind.config.ts`에 전부 추가하지 않고, 해당 컴포넌트 내부에서 관리한다.

예시: `Badge`의 `week`, `success`, `warning` 배경/텍스트 색상

## Typography

| Figma Token          | Size            | Weight | Tailwind Class         | 사용처               |
| -------------------- | --------------- | ------ | ---------------------- | -------------------- |
| Inter Bold           | `36px / 54px`   | `700`  | `text-display-1`       | 큰 화면 제목         |
| `Text/Heading-1`     | `20px / 28px`   | `700`  | `text-heading-1`       | 페이지/섹션 제목     |
| `Text/Heading-2`     | `16px / 24px`   | `700`  | `text-heading-2`       | 카드, 모달 제목      |
| Noto Sans KR Bold    | `16px / 19.2px` | `700`  | `text-title-1`         | 카드 제목, 강조 제목 |
| `Text/Label`         | `14px / 20px`   | `600`  | `text-label`           | 탭, 버튼, 입력 라벨  |
| `Text/Body`          | `14px / 20px`   | `500`  | `text-body`            | 본문 텍스트          |
| `Text/Caption`       | `13px / 18px`   | `400`  | `text-caption`         | 보조 설명, 메타 정보 |
| Sidebar section text | `11px / 13px`   | `500`  | `text-sidebar-section` | 사이드바 섹션 제목   |

## Spacing / Radius

Tailwind 기본 spacing scale을 우선 사용한다. 기본값은 `1 = 4px`이다.

| Tailwind Class         | Value  |
| ---------------------- | ------ |
| `p-1`, `gap-1`, `mt-1` | `4px`  |
| `p-2`, `gap-2`, `mt-2` | `8px`  |
| `p-3`, `gap-3`, `mt-3` | `12px` |
| `p-4`, `gap-4`, `mt-4` | `16px` |
| `p-5`, `gap-5`, `mt-5` | `20px` |
| `p-6`, `gap-6`, `mt-6` | `24px` |
| `p-8`, `gap-8`, `mt-8` | `32px` |

Radius도 Tailwind 기본값을 우선 사용한다.

| Tailwind Class | Value  |
| -------------- | ------ |
| `rounded`      | `4px`  |
| `rounded-md`   | `6px`  |
| `rounded-lg`   | `8px`  |
| `rounded-2xl`  | `16px` |

Figma에서 Tailwind scale과 맞지 않는 값만 arbitrary value로 사용한다.

예시: `rounded-[4.5px]`, `rounded-[7.5px]`, `w-[260px]`, `h-[1200px]`

## Source

Token source is configured in:

- `tailwind.config.ts`
