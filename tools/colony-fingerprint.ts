// The colony's fingerprint: a hash of the end state of 25 kinds of life on 30 seeds each, from the
// game's own rules. tests/colony.test.ts fails if a change to src/game/colony or the numbers moves any
// of them. A change that is meant to move play rewrites it with --write, and reruns `npm run gate`
// for the commit message (game-building F27: a neutral refactor is proved neutral by a seeded checksum).
//
// The fingerprint committed on 2026-11-28 was checked against the retired kill-gate prototype: the
// port and the prototype gave the same end state in all 5,000 runs compared (25 arms x 200 seeds),
// and the same gate tables to the last digit at 1,000 seeds an arm (67,000 runs).
//   tsx tools/colony-fingerprint.ts [--write]
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { play, type NewColony, type ColonyState } from '../src/game/colony';
import { policy, careless, type PolicyOptions } from '../sim/policies';

export const ARMS: [string, Partial<PolicyOptions> | null, NewColony][] = [
  ['careful', {}, {}], ['careless', null, {}], ['crown', {}, { charter: 'crown' }], ['onTime', {}, { onTime: true }], ['today', { order: 'today' }, {}],
  ['playoff', { envoy: 'playoff' }, {}], ['mediate', { envoy: 'mediate' }, {}], ['equal', { neighbours: 'partisan', pact: 'equal', expedition: true }, {}],
  ['client', { neighbours: 'partisan', pact: 'client', expedition: true }, {}], ['isolate', { neighbours: 'isolate', share: false }, {}], ['raid', { neighbours: 'raid', share: false }, {}],
  ['fortress crown soldier palisade', { fortress: true, expedition: true }, { charter: 'crown', background: 'soldier', site: 'palisade' }], ['sell', { sellPowder: true }, {}],
  ['hunt always', { hunt: 'always' }, {}], ['plough', { split: 'plough' }, {}], ['even', { split: 'even' }, {}], ['facIgnore', { factions: 'ignore', concede: false }, {}],
  ['refuse', { neighbours: 'partisan', answerCall: false }, {}], ['noWatch', { noWatch: true }, {}], ['noNames', {}, { noNames: true }], ['safe', {}, { namedSafe: true }],
  ['sheltered', {}, { site: 'sheltered' }], ['contested oldHouse', {}, { site: 'contested', background: 'oldHouse' }], ['merchant', {}, { background: 'merchant' }], ['disgrace crown', {}, { background: 'disgrace', charter: 'crown' }],
];
export const SEEDS = Array.from({ length: 30 }, (_, i) => 1 + i * 7919);

const canon = (x: unknown): unknown => Array.isArray(x) ? x.map(canon) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, canon((x as Record<string, unknown>)[k])])) : x;
export const endState = (s: ColonyState) => JSON.stringify(canon(JSON.parse(JSON.stringify(s))));

export function fingerprint(): Record<string, string> {
  return Object.fromEntries(ARMS.map(([name, o, x]) => {
    const h = createHash('sha256');
    for (const seed of SEEDS) h.update(endState(play(seed, { governor: o ? policy(o) : careless, fallback: careless, ...x })) + '\n');
    return [name, h.digest('hex').slice(0, 16)];
  }));
}

export const FILE = join(import.meta.dirname, '..', 'tests', 'fixtures', 'colony-fingerprint.json');

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const now = fingerprint();
  if (process.argv.includes('--write')) { mkdirSync(dirname(FILE), { recursive: true }); writeFileSync(FILE, JSON.stringify(now, null, 1) + '\n'); console.log(`wrote ${FILE}`); }
  else {
    const was = JSON.parse(readFileSync(FILE, 'utf8')) as Record<string, string>;
    const moved = Object.keys(now).filter((k) => now[k] !== was[k]);
    console.log(moved.length ? `moved: ${moved.join(', ')}` : `unchanged: ${Object.keys(now).length} arms x ${SEEDS.length} seeds`);
    process.exit(moved.length ? 1 : 0);
  }
}
