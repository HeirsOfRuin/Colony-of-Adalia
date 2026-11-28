// Proves the colony's rules before their numbers are believed. Part of `npm run check`.
//   1. deterministic: the same seed and governor give a byte-identical end state, twice;
//   2. every run ends, moved its clock, kept every number finite and every count at or above zero;
//   3. it survives the save: a life saved and reloaded at every turn plays on exactly as one never saved;
//   4. nothing declared is decoration: every policy part, site, background and world switch changes the
//      end state on at least one seed in ten (game-building rule 2). This failed the first expedition
//      rule (round 2) and "never concede" (round 4); both were rewritten, not excused.
//   tsx sim/check.ts [seeds=60]
import { play, popOf, newColony, step, standsNow, toSave, fromSave, type NewColony, type ColonyState, type Site, type Background } from '../src/game/colony';
import { policy, careful, careless, SPLITS, type Policy, type PolicyOptions } from './policies';

const n = Number(process.argv[2] || 60);
const seeds = Array.from({ length: n }, (_, i) => 3 + i * 6151);
const snap = (s: ColonyState) => JSON.stringify(s);
const run = (seed: number, governor: Policy, x: NewColony & { fallback?: Policy } = {}) => play(seed, { governor, fallback: careless, ...x });

const arms: [string, Policy, NewColony][] = [['careful', careful, {}], ['careless', careless, {}], ['crown', careful, { charter: 'crown' }], ['onTime', careful, { onTime: true }]];
let runs = 0;
for (const [name, gov, x] of arms) for (const seed of seeds) {
  const a = run(seed, gov, x), b = run(seed, gov, x); runs += 2;
  if (snap(a) !== snap(b)) throw new Error(`${name} seed ${seed}: two runs differ`);
  if (!a.ended) throw new Error(`${name} seed ${seed}: did not end`);
  if (a.stats.live.length !== a.t || a.t < 1) throw new Error(`${name} seed ${seed}: the clock did not move`);
  const nums = [popOf(a), a.food, a.powder, a.iron, a.salt, a.goods, a.cargo, a.walls, a.morale, a.favour, ...a.nations.flatMap((v) => [v.pop, v.corn, v.rel, v.grudge])];
  if (!nums.every(Number.isFinite)) throw new Error(`${name} seed ${seed}: a number is not finite`);
  if ([a.lab, a.craft, a.sold, a.gent, a.fam, a.food, a.powder, a.iron, a.salt, a.goods, a.cargo].some((v) => v < -1e-9)) throw new Error(`${name} seed ${seed}: a store went below nothing`);
}
console.log(`ok  deterministic, ended, clock moved, numbers finite: ${runs} runs`);

// a life played through the save: written out as JSON text and read back before every turn
let reloads = 0;
for (const seed of seeds.slice(0, 20)) {
  let s = newColony(seed, {});
  while (!s.ended && !standsNow(s)) { s = fromSave(JSON.parse(JSON.stringify(toSave(s)))); reloads++; step(s, careful, s.deputy, careless); }
  const ref = newColony(seed, {});
  while (!ref.ended && !standsNow(ref)) step(ref, careful, ref.deputy, careless);
  if (snap(s) !== snap(ref)) throw new Error(`seed ${seed}: a life saved and reloaded each turn played differently`);
}
console.log(`ok  save and reload before every turn changes nothing: 20 lives, ${reloads} reloads`);

const parts: Record<string, Partial<PolicyOptions>> = {
  'order: today': { order: 'today' }, 'neighbours: raid': { neighbours: 'raid' }, 'neighbours: ignore': { neighbours: 'ignore' }, 'neighbours: partisan': { neighbours: 'partisan' },
  'partisan raids rival': { neighbours: 'partisan', raidRival: true }, 'refuses the call': { neighbours: 'partisan', answerCall: false }, 'expedition': { expedition: true },
  'partisan marches': { neighbours: 'partisan', expedition: true }, 'isolate': { neighbours: 'isolate' }, 'no envoy': { envoy: 'none' }, 'envoy: playoff': { envoy: 'playoff' },
  'envoy: mediate': { envoy: 'mediate' }, 'client pact, marches': { neighbours: 'partisan', pact: 'client', expedition: true }, 'fortress': { fortress: true },
  'factions: colony': { factions: 'colony' }, 'factions: ignore': { factions: 'ignore' }, 'never concede': { concede: false }, 'no watch': { noWatch: true },
  'no cargo floor': { cargoFloor: 0 }, 'hunt: early': { hunt: 'early' }, 'hunt: always': { hunt: 'always' }, 'hunt: never': { hunt: 'never' },
  'share: false': { share: false }, 'deputy: false': { deputy: false }, 'ration: full': { ration: 'full' }, 'sellPowder': { sellPowder: true },
  ...Object.fromEntries((Object.keys(SPLITS) as (keyof typeof SPLITS)[]).map((k) => ['split: ' + k, { split: k }])),
};
const base = seeds.map((seed) => snap(run(seed, careful)));
let inert = 0;
const differs = (name: string, f: (seed: number) => ColonyState) => {
  const k = seeds.filter((seed, i) => snap(f(seed)) !== base[i]).length;
  if (k < n / 10) { inert++; console.log(`INERT  ${name}: changes ${k} of ${n} seeds`); } else console.log(`ok  ${name.padEnd(22)} changes ${k} of ${n} seeds`);
};
for (const [name, o] of Object.entries(parts)) differs(name, (seed) => run(seed, policy(o)));
differs('charter: crown', (seed) => run(seed, careful, { charter: 'crown' }));
for (const site of ['sheltered', 'contested', 'palisade'] as Site[]) differs('site: ' + site, (seed) => run(seed, careful, { site }));
for (const background of ['oldHouse', 'merchant', 'soldier', 'disgrace'] as Background[]) differs('background: ' + background, (seed) => run(seed, careful, { background }));
differs('nobody named', (seed) => run(seed, careful, { noNames: true }));
differs('ships on time', (seed) => run(seed, careful, { onTime: true }));
differs('successor fallback', (seed) => run(seed, careful, { fallback: careful }));
if (inert) { console.error(`${inert} inert part(s)`); process.exit(1); }
