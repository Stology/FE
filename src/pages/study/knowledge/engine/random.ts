/** 결정론적 의사난수(mulberry32). 같은 seed면 항상 같은 수열을 낸다. */
export const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Fibonacci sphere 위 index번째 방향 벡터(클러스터 앵커 배치용). */
export const fibonacciDirection = (index: number, total: number): [number, number, number] => {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = total <= 1 ? 0 : 1 - (index / (total - 1)) * 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = golden * index;
  return [Math.cos(theta) * radius, y, Math.sin(theta) * radius];
};

/** 구 내부에 균일 분포하는 점(표면에 쏠리지 않도록 cbrt 사용). */
export const randomPointInSphere = (
  random: () => number,
  radius: number,
): [number, number, number] => {
  const u = random();
  const v = random();
  const w = random();
  const theta = u * Math.PI * 2;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(w);
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
};
