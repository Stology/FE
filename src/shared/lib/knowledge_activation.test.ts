import { describe, expect, it } from 'vitest';

import { computeDegree, deriveActivation } from './knowledge_activation';

describe('deriveActivation', () => {
  it('evidence 엣지가 없으면 비활성으로 계산한다', () => {
    const result = deriveActivation('jwt', [], new Map());

    expect(result).toEqual({ materialCount: 0, reinforcedWeeks: [], state: 'inactive' });
  });

  it('evidence 엣지가 1개 이상이면 활성화하고 최솟값을 activatedWeek로 계산한다', () => {
    const edges = [
      { kind: 'evidence', source: 'mat-1', target: 'jwt' },
      { kind: 'evidence', source: 'jwt', target: 'mat-2' },
    ] as const;
    const materialWeekById = new Map([
      ['mat-1', 3],
      ['mat-2', 1],
    ]);

    const result = deriveActivation('jwt', [...edges], materialWeekById);

    expect(result.state).toBe('active');
    expect(result.activatedWeek).toBe(1);
    expect(result.reinforcedWeeks).toEqual([3]);
    expect(result.materialCount).toBe(2);
  });

  it('중복 주차의 보강 자료는 reinforcedWeeks에서 한 번만 나타난다', () => {
    const edges = [
      { kind: 'evidence', source: 'mat-1', target: 'jwt' },
      { kind: 'evidence', source: 'mat-2', target: 'jwt' },
      { kind: 'evidence', source: 'mat-3', target: 'jwt' },
    ] as const;
    const materialWeekById = new Map([
      ['mat-1', 1],
      ['mat-2', 2],
      ['mat-3', 2],
    ]);

    const result = deriveActivation('jwt', [...edges], materialWeekById);

    expect(result.reinforcedWeeks).toEqual([2]);
  });

  it('최초 활성 주차에 자료가 여러 개 몰려도 그 주차를 보강으로 세지 않는다', () => {
    const edges = [
      { kind: 'evidence', source: 'mat-1', target: 'jwt' },
      { kind: 'evidence', source: 'mat-2', target: 'jwt' },
    ] as const;
    const materialWeekById = new Map([
      ['mat-1', 1],
      ['mat-2', 1],
    ]);

    const result = deriveActivation('jwt', [...edges], materialWeekById);

    expect(result.activatedWeek).toBe(1);
    expect(result.reinforcedWeeks).toEqual([]);
  });

  it('다른 노드로 향하는 evidence 엣지는 무시한다', () => {
    const edges = [{ kind: 'evidence', source: 'mat-1', target: 'session' }] as const;

    const result = deriveActivation('jwt', [...edges], new Map([['mat-1', 1]]));

    expect(result.state).toBe('inactive');
  });
});

describe('computeDegree', () => {
  it('source/target 어느 쪽이든 연결된 엣지 수를 센다', () => {
    const edges = [
      { kind: 'based-on', source: 'jwt', target: 'auth' },
      { kind: 'associated-with', source: 'session', target: 'jwt' },
      { kind: 'based-on', source: 'auth', target: 'session' },
    ] as const;

    expect(computeDegree('jwt', [...edges])).toBe(2);
  });
});
