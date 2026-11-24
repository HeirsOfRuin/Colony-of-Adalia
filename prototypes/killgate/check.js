// Proves the model before its numbers are believed:
//   1. deterministic: the same seed and policy give a byte-identical end state, twice;
//   2. every run ends, moved its clock, and kept every number finite and every count >= 0;
//   3. nothing declared is decoration: every policy part and every world switch changes the
//      end state on at least one seed in ten (game-building rule 2).
//   node prototypes/killgate/check.js [seeds=60]
import { play, popOf } from './model.js';
import { policy, careful, careless, SPLITS } from './policies.js';

const n = Number(process.argv[2] || 60);
const seeds = Array.from({ length: n }, (_, i) => 3 + i * 6151);
const snap = (s) => JSON.stringify(s);
const arms = { careful: { policy: careful }, careless: { policy: careless }, crown: { policy: careful, charter: 'crown' }, onTime: { policy: careful, onTime: true } };
let runs = 0;
for (const [name, opt] of Object.entries(arms)) for (const seed of seeds) {
  const a = play(seed, { fallback: careless, ...opt }), b = play(seed, { fallback: careless, ...opt }); runs += 2;
  if (snap(a) !== snap(b)) throw new Error(`${name} seed ${seed}: two runs differ`);
  if (!a.ended) throw new Error(`${name} seed ${seed}: did not end`);
  if (a.stats.live.length !== a.t || a.t < 1) throw new Error(`${name} seed ${seed}: the clock did not move`);
  const nums = [popOf(a), a.food, a.powder, a.iron, a.salt, a.goods, a.cargo, a.walls, a.morale, a.favour, ...a.nations.flatMap((x) => [x.pop, x.corn, x.rel, x.grudge])];
  if (!nums.every(Number.isFinite)) throw new Error(`${name} seed ${seed}: a number is not finite`);
  if ([a.lab, a.craft, a.sold, a.gent, a.fam, a.food, a.powder, a.iron, a.salt, a.goods, a.cargo].some((x) => x < -1e-9)) throw new Error(`${name} seed ${seed}: a store went below nothing`);
}
console.log(`ok  deterministic, ended, clock moved, numbers finite: ${runs} runs`);

const parts = { 'order: today': { order: 'today' }, 'neighbours: raid': { neighbours: 'raid' }, 'neighbours: ignore': { neighbours: 'ignore' }, 'neighbours: partisan': { neighbours: 'partisan' }, 'partisan raids rival': { neighbours: 'partisan', raidRival: true }, 'refuses the call': { neighbours: 'partisan', answerCall: false }, 'expedition': { expedition: true }, 'partisan marches': { neighbours: 'partisan', expedition: true }, 'isolate': { neighbours: 'isolate' }, 'no envoy': { envoy: 'none' }, 'envoy: playoff': { envoy: 'playoff' }, 'envoy: mediate': { envoy: 'mediate' }, 'client pact, marches': { neighbours: 'partisan', pact: 'client', expedition: true }, 'fortress': { fortress: true }, 'factions: colony': { factions: 'colony' }, 'factions: ignore': { factions: 'ignore' }, 'never concede': { concede: false }, 'no watch': { noWatch: true },  'hunt: early': { hunt: 'early' }, 'hunt: always': { hunt: 'always' }, 'hunt: never': { hunt: 'never' },
  'share: false': { share: false }, 'deputy: false': { deputy: false }, 'ration: full': { ration: 'full' }, 'sellPowder': { sellPowder: true }, ...Object.fromEntries(Object.keys(SPLITS).map((k) => ['split: ' + k, { split: k }])) };
const base = seeds.map((seed) => snap(play(seed, { policy: careful, fallback: careless })));
let inert = 0;
const differs = (name, f) => { const k = seeds.filter((seed, i) => snap(f(seed)) !== base[i]).length; if (k < n / 10) { inert++; console.log(`INERT  ${name}: changes ${k} of ${n} seeds`); } else console.log(`ok  ${name.padEnd(20)} changes ${k} of ${n} seeds`); };
for (const [name, o] of Object.entries(parts)) differs(name, (seed) => play(seed, { policy: policy(o), fallback: careless }));
differs('charter: crown', (seed) => play(seed, { policy: careful, charter: 'crown', fallback: careless }));
for (const site of ['sheltered', 'contested', 'palisade']) differs('site: ' + site, (seed) => play(seed, { policy: careful, site, fallback: careless }));
for (const background of ['oldHouse', 'merchant', 'soldier', 'disgrace']) differs('background: ' + background, (seed) => play(seed, { policy: careful, background, fallback: careless }));
differs('nobody named', (seed) => play(seed, { policy: careful, noNames: true, fallback: careless }));
differs('ships on time', (seed) => play(seed, { policy: careful, onTime: true, fallback: careless }));
differs('successor fallback', (seed) => play(seed, { policy: careful, fallback: careful }));
if (inert) { console.error(`${inert} inert part(s)`); process.exit(1); }
