import { computeDegree, deriveActivation } from '@/shared/lib/knowledge_activation';
import type {
  ConceptRelationKind,
  KnowledgeCluster,
  KnowledgeClusterAccent,
  KnowledgeConceptNode,
  KnowledgeEdge,
  KnowledgeGraph,
  KnowledgeMaterialNode,
  WeeklyRecordMaterial,
} from '@/shared/types/stology';

type ConceptSeed = [
  id: string,
  label: string,
  clusterId: string,
  week: number,
  importance: 1 | 2 | 3 | 4 | 5,
  definition: string,
  aliases?: string[],
];

type MaterialSeed = [
  id: string,
  title: string,
  uploaderName: string,
  uploadedAt: string,
  week: number,
];

type RelationSeed = [source: string, target: string, kind: ConceptRelationKind];

type EvidenceSeed = [materialId: string, conceptId: string];

const clusterSeeds: KnowledgeCluster[] = [
  { accent: 'accent-1', id: 'cluster-auth', label: '인증/보안' },
  { accent: 'accent-2', id: 'cluster-db', label: '데이터베이스' },
  { accent: 'accent-3', id: 'cluster-network', label: '네트워크' },
  { accent: 'accent-4', id: 'cluster-frontend', label: '프론트엔드' },
  { accent: 'accent-5', id: 'cluster-backend', label: '백엔드 아키텍처' },
  { accent: 'accent-6', id: 'cluster-devops', label: 'DevOps' },
];

// 레이아웃은 isRoot 노드를 원점(0,0,0)에 고정하므로 그래프 전체에서 단 하나만 둔다.
const rootIds = new Set(['jwt']);

const conceptSeeds: ConceptSeed[] = [
  // 인증/보안
  [
    'jwt',
    'JWT',
    'cluster-auth',
    1,
    4,
    '서버가 발급하는 자가 검증 가능한 인증 토큰',
    ['Json Web Token'],
  ],
  [
    'session',
    'Session',
    'cluster-auth',
    1,
    3,
    '서버가 상태를 저장해 클라이언트를 식별하는 방식',
    ['세션 관리'],
  ],
  [
    'oauth2',
    'OAuth2',
    'cluster-auth',
    2,
    4,
    '제3자 애플리케이션에 위임된 접근 권한을 부여하는 인가 프로토콜',
  ],
  [
    'password-hashing',
    '비밀번호 해싱',
    'cluster-auth',
    2,
    3,
    '원문 비밀번호를 복호화 불가능한 형태로 저장하는 기법',
    ['bcrypt'],
  ],
  ['csrf', 'CSRF 방어', 'cluster-auth', 3, 2, '위조된 요청으로부터 세션을 보호하는 방어 기법'],
  // 데이터베이스
  ['index', '인덱스', 'cluster-db', 2, 4, '조회 성능을 높이기 위한 자료구조'],
  [
    'transaction',
    '트랜잭션',
    'cluster-db',
    2,
    4,
    '연산을 하나의 논리적 단위로 묶어 원자성을 보장',
    ['ACID'],
  ],
  [
    'normalization',
    '정규화',
    'cluster-db',
    3,
    3,
    '중복을 줄이기 위해 데이터를 구조적으로 분해하는 설계 기법',
  ],
  [
    'n-plus-one',
    'N+1 문제',
    'cluster-db',
    3,
    3,
    '연관 데이터를 반복 조회해 쿼리 수가 폭증하는 문제',
  ],
  [
    'connection-pool',
    '커넥션 풀',
    'cluster-db',
    4,
    2,
    '데이터베이스 연결을 재사용해 오버헤드를 줄이는 기법',
  ],
  // 네트워크
  [
    'http-caching',
    'HTTP 캐싱',
    'cluster-network',
    3,
    3,
    'ETag/Cache-Control로 응답 재사용을 제어하는 기법',
  ],
  [
    'websocket',
    'WebSocket',
    'cluster-network',
    4,
    4,
    '단일 연결로 양방향 실시간 통신을 지원하는 프로토콜',
  ],
  ['cors', 'CORS', 'cluster-network', 4, 3, '다른 출처 간 자원 공유를 제어하는 브라우저 정책'],
  ['load-balancing', '로드 밸런싱', 'cluster-network', 5, 3, '여러 서버에 트래픽을 분산하는 기법'],
  ['dns', 'DNS 조회', 'cluster-network', 5, 1, '도메인 이름을 IP 주소로 변환하는 과정'],
  // 프론트엔드
  [
    'state-management',
    '상태 관리',
    'cluster-frontend',
    1,
    4,
    '컴포넌트 간 공유 데이터를 예측 가능하게 다루는 패턴',
    ['전역 상태'],
  ],
  [
    'virtual-dom',
    '가상 DOM',
    'cluster-frontend',
    2,
    3,
    '실제 DOM 변경을 최소화하기 위한 메모리상의 트리 표현',
  ],
  [
    'code-splitting',
    '코드 스플리팅',
    'cluster-frontend',
    3,
    3,
    '번들을 나눠 필요한 시점에만 로드하는 최적화 기법',
  ],
  [
    'accessibility',
    '웹 접근성',
    'cluster-frontend',
    3,
    2,
    '장애 유무와 관계없이 모두가 사용할 수 있게 만드는 설계 원칙',
    ['a11y'],
  ],
  [
    'rendering-strategy',
    '렌더링 전략',
    'cluster-frontend',
    4,
    3,
    'CSR/SSR/SSG 등 렌더링 시점과 위치를 선택하는 전략',
  ],
  // 백엔드 아키텍처
  [
    'layered-architecture',
    '레이어드 아키텍처',
    'cluster-backend',
    4,
    4,
    '관심사를 계층으로 분리해 의존성을 관리하는 구조',
  ],
  [
    'event-driven',
    '이벤트 드리븐',
    'cluster-backend',
    5,
    3,
    '이벤트 발행/구독으로 컴포넌트를 느슨하게 결합하는 설계',
  ],
  [
    'idempotency',
    '멱등성',
    'cluster-backend',
    5,
    3,
    '같은 요청을 여러 번 보내도 결과가 같도록 보장하는 성질',
  ],
  [
    'cache-strategy',
    '캐시 전략',
    'cluster-backend',
    6,
    3,
    '캐시 무효화와 갱신 시점을 설계하는 전략',
  ],
  [
    'rate-limiting',
    '요청 제한',
    'cluster-backend',
    6,
    2,
    '단위 시간당 요청 수를 제한해 남용을 막는 기법',
    ['Rate Limiting'],
  ],
  // DevOps
  ['ci-cd', 'CI/CD', 'cluster-devops', 5, 4, '빌드·테스트·배포를 자동화하는 파이프라인'],
  [
    'containerization',
    '컨테이너화',
    'cluster-devops',
    5,
    3,
    '애플리케이션과 실행 환경을 함께 패키징하는 기법',
    ['Docker'],
  ],
  ['monitoring', '모니터링', 'cluster-devops', 6, 3, '시스템 상태를 지속적으로 관측하는 체계'],
  [
    'rollback-strategy',
    '롤백 전략',
    'cluster-devops',
    6,
    2,
    '배포 실패 시 이전 상태로 되돌리는 전략',
  ],
  [
    'infra-as-code',
    'IaC',
    'cluster-devops',
    6,
    2,
    '인프라 구성을 코드로 관리하는 방식',
    ['Infrastructure as Code'],
  ],
];

const materialSeeds: MaterialSeed[] = [
  ['mat-1', 'JWT 정리 노트', '김철수', '2026-03-13', 1],
  ['mat-2', '인증 흐름 정리', '이영희', '2026-03-14', 1],
  ['mat-3', '토큰 재발급 전략', '김철수', '2026-03-27', 3],
  ['mat-4', 'OAuth2 인가 코드 흐름', '박민수', '2026-03-21', 2],
  ['mat-5', '비밀번호 해싱 비교', '이영희', '2026-03-22', 2],
  ['mat-6', '인덱스 튜닝 회고', '박민수', '2026-03-28', 3],
  ['mat-7', '트랜잭션 격리 수준 정리', '김철수', '2026-03-29', 3],
  ['mat-8', 'N+1 문제 디버깅기', '이영희', '2026-04-04', 4],
  ['mat-9', 'HTTP 캐싱 헤더 정리', '박민수', '2026-04-05', 4],
  ['mat-10', 'WebSocket 핸드셰이크', '김철수', '2026-04-11', 5],
  ['mat-11', '상태 관리 라이브러리 비교', '이영희', '2026-03-06', 1],
  ['mat-12', '가상 DOM 재조정 원리', '박민수', '2026-03-20', 2],
  ['mat-13', 'CI/CD 파이프라인 구축기', '김철수', '2026-04-18', 5],
  ['mat-14', '컨테이너 이미지 최적화', '이영희', '2026-04-19', 5],
  ['mat-15', '레이어드 아키텍처 리팩터링', '박민수', '2026-04-12', 5],
];

const relationSeeds: RelationSeed[] = [
  ['jwt', 'session', 'contrasted-with'],
  ['jwt', 'oauth2', 'associated-with'],
  ['oauth2', 'csrf', 'associated-with'],
  ['session', 'csrf', 'based-on'],
  ['password-hashing', 'oauth2', 'associated-with'],
  ['index', 'transaction', 'associated-with'],
  ['transaction', 'normalization', 'based-on'],
  ['normalization', 'n-plus-one', 'advanced-from'],
  ['n-plus-one', 'connection-pool', 'associated-with'],
  ['index', 'n-plus-one', 'contrasted-with'],
  ['http-caching', 'websocket', 'contrasted-with'],
  ['http-caching', 'cors', 'associated-with'],
  ['websocket', 'load-balancing', 'associated-with'],
  ['cors', 'dns', 'based-on'],
  ['state-management', 'virtual-dom', 'based-on'],
  ['virtual-dom', 'code-splitting', 'advanced-from'],
  ['code-splitting', 'accessibility', 'contrasted-with'],
  ['state-management', 'rendering-strategy', 'associated-with'],
  ['layered-architecture', 'event-driven', 'contrasted-with'],
  ['layered-architecture', 'idempotency', 'based-on'],
  ['event-driven', 'cache-strategy', 'associated-with'],
  ['idempotency', 'rate-limiting', 'advanced-from'],
  ['ci-cd', 'containerization', 'based-on'],
  ['containerization', 'monitoring', 'associated-with'],
  ['ci-cd', 'rollback-strategy', 'advanced-from'],
  ['monitoring', 'infra-as-code', 'associated-with'],
  ['http-caching', 'cache-strategy', 'advanced-from'],
  ['connection-pool', 'containerization', 'contrasted-with'],
];

const evidenceSeeds: EvidenceSeed[] = [
  ['mat-1', 'jwt'],
  ['mat-2', 'jwt'],
  ['mat-3', 'jwt'],
  ['mat-4', 'oauth2'],
  ['mat-5', 'password-hashing'],
  ['mat-6', 'index'],
  ['mat-7', 'transaction'],
  ['mat-8', 'n-plus-one'],
  ['mat-9', 'http-caching'],
  ['mat-10', 'websocket'],
  ['mat-11', 'state-management'],
  ['mat-11', 'virtual-dom'],
  ['mat-12', 'virtual-dom'],
  ['mat-13', 'ci-cd'],
  ['mat-14', 'containerization'],
  ['mat-15', 'layered-architecture'],
];

const buildKnowledgeGraph = (): KnowledgeGraph => {
  const relationEdges: KnowledgeEdge[] = relationSeeds.map(([source, target, kind]) => ({
    kind,
    source,
    target,
  }));
  const evidenceEdges: KnowledgeEdge[] = evidenceSeeds.map(([materialId, conceptId]) => ({
    kind: 'evidence',
    source: materialId,
    target: conceptId,
  }));
  const edges = [...relationEdges, ...evidenceEdges];

  const materialsById = new Map<string, WeeklyRecordMaterial>(
    materialSeeds.map(([id, title, uploaderName, uploadedAt]) => [
      id,
      { id, title, uploaderName, uploadedAt },
    ]),
  );
  const materialWeekById = new Map<string, number>(
    materialSeeds.map(([id, , , , week]) => [id, week]),
  );

  const conceptNodes: KnowledgeConceptNode[] = conceptSeeds.map(
    ([id, label, clusterId, week, importance, definition, aliases]) => {
      const activation = deriveActivation(id, edges, materialWeekById);

      return {
        ...activation,
        aliases: aliases ?? [],
        clusterId,
        definition,
        degree: computeDegree(id, edges),
        id,
        importance,
        isRoot: rootIds.has(id),
        label,
        type: 'concept',
        week,
      };
    },
  );

  const materialNodes: KnowledgeMaterialNode[] = materialSeeds.map(([id, , , , week]) => {
    const material = materialsById.get(id);
    if (!material) throw new Error(`알 수 없는 자료 id: ${id}`);

    const [conceptId] = evidenceSeeds.find(([materialId]) => materialId === id) ?? [];
    const clusterId =
      conceptSeeds.find(([conceptSeedId]) => conceptSeedId === conceptId)?.[2] ?? 'cluster-auth';

    return {
      clusterId,
      degree: computeDegree(id, edges),
      id,
      importance: 1,
      isRoot: false,
      label: material.title,
      material,
      type: 'material',
      week,
    };
  });

  return {
    clusters: clusterSeeds,
    edges,
    nodes: [...conceptNodes, ...materialNodes],
  };
};

export const mockKnowledgeGraph: KnowledgeGraph = buildKnowledgeGraph();

export const mockKnowledgeGraphWeeks = [1, 2, 3, 4, 5, 6];

export const clusterAccentValues: KnowledgeClusterAccent[] = [
  'accent-1',
  'accent-2',
  'accent-3',
  'accent-4',
  'accent-5',
  'accent-6',
];
