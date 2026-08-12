/** 레이아웃을 결정론적으로 만드는 고정 시드. */
export const LAYOUT_SEED = 2026;

// ── 전체보기 레이아웃 (graph_layout.ts) ─────────────────────────
export const CLUSTER_ANCHOR_RADIUS = 26;
export const CLUSTER_SPREAD = 12.5;
export const MATERIAL_OUTWARD = 1.34;
export const MIN_GAP = 1.15;
export const RELAX_ITERATIONS = 6;
export const RELAX_CELL_SIZE = 6;

export const ROOT_NODE_RADIUS = 1.95;
export const MATERIAL_NODE_RADIUS = 0.78;
export const CONCEPT_BASE_RADIUS = 0.86;
export const CONCEPT_IMPORTANCE_STEP = 0.13;

// ── 포커스(에고) 레이아웃 (graph_focus_layout.ts) ───────────────
export const FOCUS_COLLISION_CELL_SIZE = 5;
export const FOCUS_COLLISION_ITERATIONS = 3;

// ── 노드/씬 인터랙션 ─────────────────────────────────────────
/**
 * 클릭 판정용 히트 메시는 실제 구보다 이만큼 크게 잡는다.
 * three.js Mesh 레이캐스팅은 픽셀 여유(threshold)가 없어 작은 구를 정확히 맞추기 어렵기 때문.
 */
export const HIT_RADIUS_MULTIPLIER = 1.8;

/** 클릭으로 인정할 최대 포인터 이동 거리(px). 이보다 크면 드래그(오빗)로 간주한다. */
export const CLICK_MOVE_TOLERANCE_PX = 6;

/** 노드/카메라 전환 애니메이션 길이(초). */
export const TRANSITION_DURATION = 0.72;

// ── 오빗 카메라 ────────────────────────────────────────────
export const DEFAULT_ORBIT_YAW = 0.62;
export const DEFAULT_ORBIT_PITCH = 0.3;
export const MIN_ORBIT_DISTANCE_RATIO = 0.34;
export const MAX_ORBIT_DISTANCE_RATIO = 3.1;
export const ORBIT_PITCH_LIMIT = (60 * Math.PI) / 180;
export const ORBIT_YAW_SENSITIVITY = 0.0042;
export const ORBIT_PITCH_SENSITIVITY = 0.0036;
export const ZOOM_SENSITIVITY = 0.0014;
export const CAMERA_FOV = 42;

// ── 라벨 오버레이 ────────────────────────────────────────────
export const LABEL_BUDGET = 13;
