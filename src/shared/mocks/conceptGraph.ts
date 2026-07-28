import type { ConceptGraph, ConceptRelationType } from '@/shared/types/stology';

export const conceptRelationLabel: Record<ConceptRelationType, string> = {
  base: '기반',
  context: '맥락',
  extension: '확장',
  contrast: '대조',
};

export const conceptRelationTypes: ConceptRelationType[] = [
  'base',
  'context',
  'extension',
  'contrast',
];

export const mockConceptGraph: ConceptGraph = {
  nodes: [
    {
      definition: '인증 토큰',
      id: 'jwt',
      isActive: true,
      materials: [
        {
          id: 'jwt-note',
          title: 'JWT 정리 노트',
          uploaderName: '김철수',
          uploadedAt: '2026-03-15',
        },
        {
          id: 'auth-flow',
          title: '인증 흐름',
          uploaderName: '이영희',
          uploadedAt: '2026-03-14',
        },
        {
          id: 'token-reissue',
          title: '토큰 재발급',
          uploaderName: '김철수',
          uploadedAt: '2026-03-13',
        },
      ],
      name: 'JWT',
      weekStatus: 'newly_activated',
      x: 162,
      y: 142,
    },
    {
      definition: '사용자 인증 절차',
      id: 'auth',
      isActive: true,
      materials: [
        {
          id: 'auth-flow',
          title: '인증 흐름',
          uploaderName: '이영희',
          uploadedAt: '2026-03-14',
        },
        {
          id: 'auth-basic',
          title: '인증 기초',
          uploaderName: '박민수',
          uploadedAt: '2026-03-08',
        },
      ],
      name: 'Auth',
      weekStatus: 'reinforced',
      x: 382,
      y: 187,
    },
    {
      definition: '인증에 사용하는 자격 증명',
      id: 'token',
      isActive: true,
      materials: [
        {
          id: 'token-reissue',
          title: '토큰 재발급',
          uploaderName: '김철수',
          uploadedAt: '2026-03-13',
        },
      ],
      name: 'Token',
      weekStatus: 'newly_activated',
      x: 272,
      y: 332,
    },
    {
      definition: '반복 조회 결과의 임시 저장',
      id: 'cache',
      isActive: false,
      materials: [],
      name: 'Cache',
      x: 542,
      y: 112,
    },
    {
      definition: '서버가 유지하는 사용자 상태',
      id: 'session',
      isActive: false,
      materials: [],
      name: 'Session',
      x: 572,
      y: 322,
    },
  ],
  relations: [
    { fromId: 'jwt', toId: 'auth', type: 'base' },
    { fromId: 'auth', toId: 'token', type: 'base' },
    { fromId: 'auth', toId: 'cache', type: 'context' },
    { fromId: 'token', toId: 'session', type: 'extension' },
    { fromId: 'cache', toId: 'session', type: 'contrast' },
  ],
};

export const mockConceptGraphWeeks = [1, 2, 3];
