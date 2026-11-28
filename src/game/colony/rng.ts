// The colony's random numbers: named streams, ported unchanged from the kill-gate prototype
// (game-scaffold's rng.js, from Centennial Farm). Not the story engine's sfc32 cursor, on purpose:
//   1. A stream is named by (seed, period, system), so adding a draw to one system never shifts
//      another's. Two policies on one seed meet the same weather, ships and court, which is what
//      makes the gate's paired comparisons possible.
//   2. A stream is rebuilt from the seed whenever it is needed, so the save holds only the seed.
// Never Math.random() or Date.now() in src/game/colony/.

const UINT32 = 4294967296;

export function hashString(str: string): number {
  let h = 0x811c9dc5; // FNV-1a
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface Rng {
  next(): number;
  int(n: number): number;
  range(lo: number, hi: number): number;
  float(lo: number, hi: number): number;
  chance(p: number): boolean;
  pick<T>(arr: readonly T[]): T | undefined;
  normal(mean?: number, sd?: number): number;
}

export function makeRng(seed: number): Rng {
  let state = (seed >>> 0) || 1;
  const raw = () => { // mulberry32
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / UINT32;
  };
  return {
    next: raw,
    int(n) { return n > 0 ? Math.floor(raw() * n) : 0; },
    range(lo, hi) { if (hi < lo) [lo, hi] = [hi, lo]; return lo + Math.floor(raw() * (hi - lo + 1)); },
    float(lo, hi) { return lo + raw() * (hi - lo); },
    chance(p) { return raw() < p; },
    pick(arr) { return arr && arr.length ? arr[Math.floor(raw() * arr.length)] : undefined; },
    // Clamped to +/-3 sd: a 6-sigma harvest is a bug, not a good year.
    normal(mean = 0, sd = 1) {
      const u = Math.max(raw(), Number.EPSILON);
      const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * raw());
      return mean + sd * Math.max(-3, Math.min(3, z));
    },
  };
}

/** One stream per (seed, period, system): `streamFor(s.seed, s.t, 'ship')`. */
export function streamFor(seed: number, period: number, label: string): Rng {
  return makeRng(hashString(`${seed >>> 0}|${period}|${label}`));
}
