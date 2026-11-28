// The colony's save: the whole state as JSON, versioned. The random streams are rebuilt from the
// seed (rng.ts), so the save carries no generator state and a reload replays every draw exactly.
// Rule 9: a versioned payload, a migration chain, and a fixture from every shipped version that
// must load and play on (tests/fixtures/colony-v1.json).
import type { ColonyState } from './types';

export const SAVE_FORMAT = 'colony-of-adalia/colony';
export const SAVE_VERSION = 1;

export interface ColonySave { format: typeof SAVE_FORMAT; version: number; state: ColonyState }

/** Each entry upgrades a save from version i to i + 1. Never edited once a version has shipped. */
const MIGRATIONS: ((state: Record<string, unknown>) => void)[] = [];

export function toSave(s: ColonyState): ColonySave {
  return { format: SAVE_FORMAT, version: SAVE_VERSION, state: structuredClone(s) };
}

export function fromSave(save: unknown): ColonyState {
  const f = save as Partial<ColonySave> | null;
  if (!f || f.format !== SAVE_FORMAT || typeof f.version !== 'number' || !f.state) throw new Error('not a Colony of Adalia colony save');
  if (f.version > SAVE_VERSION) throw new Error(`this save is from a newer build (version ${f.version}; this build reads up to ${SAVE_VERSION})`);
  const state = structuredClone(f.state) as unknown as Record<string, unknown>;
  for (let v = f.version; v < SAVE_VERSION; v++) MIGRATIONS[v - 1]!(state);
  const s = state as unknown as ColonyState;
  // JSON has no Infinity: a save written before the first turn carries null here
  if (s.stats.minNationPop === null) s.stats.minNationPop = Infinity;
  return s;
}
