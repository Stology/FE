# 스터디

## 탐색 경로

- 화면: `src/pages/study/StudyPage.tsx`
- 기본 진입: `/studies/:studyId`에서 `knowledge` 탭으로 이동
- 탭 라우트: `/studies/:studyId/:tab`
- 주차별 기록: `/studies/:studyId/records`에서 공통 헤더와 탭 아래에 Mock 기록 화면 표시
- 자료 업로드: `/studies/:studyId/upload`에서 `src/pages/study/upload`의 등록 폼과 대기 자료 목록 표시
- 지식 구조: `/studies/:studyId/knowledge`에서 `src/pages/study/knowledge`의 그래프와 노드 상세 패널 표시
- 질문함: `/studies/:studyId/questions`에서 `src/pages/study/questions`의 질문 목록과 상세·답글 화면 표시
- 공유 모델: `src/shared/types/stology.ts`

## 제품 경계

`STD-COM`, `STD-MGT`, `STD-END`는 컨테이너·관리·종료 상태를, `STD-KNW`는 온톨로지 지식 구조를, `STD-UP`은 자료 업로드와 AI 추출을 담당합니다. 질문은 `QNA`에서 별도로 관리하며 Concept 노드로 자동 변환하지 않습니다. 종료된 스터디는 읽기 전용이고, 탭 추가나 변경 시 라우터와 화면의 허용 탭 처리를 함께 확인합니다.

## 지식 구조

그래프는 Three.js 기반 3D WebGL로 렌더링하며, 노드 좌표는 클러스터·중요도 기반 결정론적 배치로 계산합니다(외부 좌표 데이터 없음). 접근성용 DOM 노드 목록(`KnowledgeNodeListFallback`)을 그래프와 함께 제공하며, WebGL을 지원하지 않는 환경에서는 이 목록만으로 동작합니다.

노드는 `KnowledgeConceptNode`(온톨로지 개념)와 `KnowledgeMaterialNode`(자료)로 나뉘며, 자료가 `evidence` 엣지로 개념에 연결되면 해당 개념이 활성화됩니다. 개념은 연결된 자료 중 가장 이른 주차를 `activatedWeek`(신규 활성)로, 그 이후 주차를 `reinforcedWeeks`(보강)로 구분해 추적합니다. 활성 노드와 비활성 노드를 함께 표시합니다. 노드명 검색은 필터와 무관하게 전체 노드를 대상으로 합니다. 주차 필터를 선택하면 해당 주차에 신규 활성 또는 보강 활동이 있는 노드만 남깁니다. 노드를 클릭하면 그 노드를 중심으로 연관 노드가 재정렬되는 ego layout으로 전환되고 카메라가 자동으로 프레이밍합니다. 노드 상세의 연결 관계는 `ConceptRelationKind`의 기반(`based-on`)·맥락(`associated-with`)·확장(`advanced-from`)·대조(`contrasted-with`) 중 하나만 선택하는 세그먼트 토글이며, 연결 노드명을 클릭하면 그 노드 상세로 전환합니다.
연결 자료를 선택하면 해당 스터디의 자료 업로드 탭으로 이동하며 `materialId`를 쿼리로 유지합니다.

## 자료 업로드

자료는 파일 업로드와 텍스트 직접 입력 중 하나로 등록하며 마크다운만 허용합니다. 자료 제목은 필수, 자료 설명은 선택이고 현재 진행 주차에 자동 귀속합니다. 등록하면 AI 추출이 시작되고 화면은 현재 탭에 머뭅니다. 대기 자료는 `MaterialStatus`로 상태를 구분하며 `자료 수정`은 본인 자료에만 노출합니다. `검토 필요` 자료를 선택하면 AI 후보 검토 화면으로 이동합니다.
