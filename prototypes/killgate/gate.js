// The kill-gate tables: the eight claims in docs/SPEC.md "Proof before screens", then the
// author's round 4 answers (the first ten years, sites, the envoy, pacts, ties, factions,
// backgrounds). docs/KILLGATE.md reads them.
//   node prototypes/killgate/gate.js [runs=400]
// Every arm plays the same seeds. Rates are % with ±1 SE; a paired gap is real past 2 SE.

import { play, won, worth, popOf } from './model.js';
import { policy, careful, careless, SPLITS } from './policies.js';
import { D } from './data.js';
import { seRate, paired, summarize } from './stats.js';

const runs = Number(process.argv[2] || 400);
const seeds = Array.from({ length: runs }, (_, i) => 1 + i * 7919);
const pct = (k, n) => `${(100 * k / n).toFixed(1)}±${seRate(k / n, n).toFixed(1)}`;
const gap = (a, b) => { const p = paired(a.map(Number), b.map(Number)); return `${(100 * p.diff).toFixed(1)}±${(100 * p.se).toFixed(1)}${p.real ? '' : ' ~'}`; };
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const f1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : '-');
const cache = new Map();
function arm(name, opt) {
  if (!cache.has(name)) cache.set(name, seeds.map((seed) => {
    const s = play(seed, { fallback: careless, ...opt });
    if (!s.ended) throw new Error(`${name} seed ${seed}: did not end`);
    if (s.t < 1 || s.stats.live.length !== s.t) throw new Error(`${name} seed ${seed}: the clock did not move`);
    if (![popOf(s), s.food, s.powder, s.favour, s.morale].every(Number.isFinite)) throw new Error(`${name} seed ${seed}: a number broke`);
    return s;
  }));
  return cache.get(name);
}
const ten = (s) => !!s.stats.at20;                        // alive, in office or not, at year ten
const tag = (s) => s.ended.why + (s.ended.why === 'mutiny' && s.stats.mutinyBy ? ':' + s.stats.mutinyBy : '') + (s.ended.after ? '+' : '');
const why = (rows) => { const c = {}; for (const s of rows) c[tag(s)] = (c[tag(s)] || 0) + 1; return Object.entries(c).sort((a, b) => b[1] - a[1]).filter(([, v]) => v / rows.length >= 0.01).map(([k, v]) => `${k} ${(100 * v / rows.length).toFixed(0)}`).join(', '); };
/** On how many seeds each arm is the best (ties split). */
function bestOn(arms, value) {
  const wins = Object.fromEntries(Object.keys(arms).map((k) => [k, 0]));
  seeds.forEach((_, i) => { const v = Object.entries(arms).map(([k, r]) => [k, value(r[i])]); const top = Math.max(...v.map((x) => x[1])); const tied = v.filter((x) => x[1] === top); for (const [k] of tied) wins[k] += 1 / tied.length; });
  return Object.entries(wins).map(([k, v]) => `${k} ${(100 * v / runs).toFixed(0)}%`).join(' | ');
}
const row = (name, r) => console.log(`${name.padEnd(30)} | ten yrs ${pct(r.filter(ten).length, runs).padStart(9)} | win ${pct(r.filter(won).length, runs).padStart(9)} | ${why(r)}`);
const winOf = (r, idx) => pct(idx.filter((i) => won(r[i])).length, idx.length);
const C = (o) => policy(o);

console.log(`\n${runs} seeds per arm, the same seeds in every arm. Company charter and a random landing unless said.`);
console.log('"ten yrs" = the colony still there at year ten; "win" = it stands ten years after the governor. Endings: + after his death.\n');

// ---------------------------------------------------------------------------------------------
console.log('CLAIM 1  The wait is the game, and the first ten years hang on the ships');
const real = arm('careful', { policy: careful }), onTime = arm('careful/on-time', { policy: careful, onTime: true });
const today = arm('today', { policy: C({ order: 'today' }) }), todayOn = arm('today/on-time', { policy: C({ order: 'today' }), onTime: true });
row('careful, real ships', real); row('careful, perfect ships', onTime); row('orders for today', today); row('today, perfect ships', todayOn);
console.log(`  ten-year gap, perfect minus real (careful): ${gap(real.map(ten), onTime.map(ten))} pts; win gap ${gap(real.map(won), onTime.map(won))}`);
console.log(`  ten-year gap, ahead minus today (real ships): ${gap(today.map(ten), real.map(ten))} pts; win gap ${gap(today.map(won), real.map(won))}`);
{ const lost = real.filter((s) => !won(s)), early = lost.filter((s) => s.ended.t < D.firstTen);
  console.log(`  careful: of ${lost.length} lives lost, ${pct(early.length, lost.length)} were lost inside the first ten years (${why(early)})`);
  const lostOn = onTime.filter((s) => !won(s)); console.log(`  perfect ships: ${pct(lostOn.filter((s) => s.ended.t < D.firstTen).length, lostOn.length)} of ${lostOn.length} losses inside the first ten years`);
  console.log(`  careful, the colony's people at year ten: ${f1(mean(real.filter(ten).map((s) => s.stats.at20.pop)))}; with perfect ships ${f1(mean(onTime.filter(ten).map((s) => s.stats.at20.pop)))}`); }

// ---------------------------------------------------------------------------------------------
console.log('\nCLAIM 2  Powder is a clock');
const hunts = { need: real, early: arm('hunt early', { policy: C({ hunt: 'early' }) }), always: arm('hunt always', { policy: C({ hunt: 'always' }) }), never: arm('hunt never', { policy: C({ hunt: 'never' }) }) };
for (const [k, r] of Object.entries(hunts)) console.log(`${('hunt ' + k).padEnd(14)} | win ${pct(r.filter(won).length, runs).padStart(9)} | starved ${f1(mean(r.map((s) => s.stats.starved)))} | kegs hunted ${f1(mean(r.map((s) => s.stats.kegsHunted)))} | attacks met short of powder ${mean(r.map((s) => s.stats.powderOut)).toFixed(2)} | breaches ${mean(r.map((s) => s.stats.breaches)).toFixed(2)} | killed ${f1(mean(r.map((s) => s.stats.killed)))}`);
console.log(`  best on seed (worth): ${bestOn(hunts, worth)}`);

// ---------------------------------------------------------------------------------------------
console.log('\nCLAIM 3  The neighbours are not a hazard table');
const nb = {
  'trade, parley (careful)': real,
  'trade, play them off': arm('playoff', { policy: C({ envoy: 'playoff' }) }),
  'trade, mediate': arm('mediate', { policy: C({ envoy: 'mediate' }) }),
  'equal pact, march': arm('equal march', { policy: C({ neighbours: 'partisan', pact: 'equal', expedition: true }) }),
  'client pact, march': arm('client march', { policy: C({ neighbours: 'partisan', pact: 'client', expedition: true }) }),
  'keep apart': arm('isolate', { policy: C({ neighbours: 'isolate', share: false }) }),
  'raid when hungry': arm('raid', { policy: C({ neighbours: 'raid', share: false }) }),
};
for (const [k, r] of Object.entries(nb)) console.log(`${k.padEnd(24)} | ten yrs ${pct(r.filter(ten).length, runs).padStart(9)} | win ${pct(r.filter(won).length, runs).padStart(9)} | attacks ${f1(mean(r.map((s) => s.stats.attacks)))} | breaches ${mean(r.map((s) => s.stats.breaches)).toFixed(2)} | ${why(r)}`);
console.log(`  best on seed (worth): ${bestOn(nb, worth)}`);

// ---------------------------------------------------------------------------------------------
console.log('\nCLAIM 4  No best job');
const sp = { careful: real }; for (const k of Object.keys(SPLITS)) sp[k] = arm('split ' + k, { policy: C({ split: k }) });
for (const [k, r] of Object.entries(sp)) row('split ' + k, r);
console.log(`  best on seed (worth), fixed splits only: ${bestOn(Object.fromEntries(Object.entries(sp).filter(([k]) => k !== 'careful')), worth)}`);
console.log(`  best on seed (worth), with the careful rule: ${bestOn(sp, worth)}`);

// ---------------------------------------------------------------------------------------------
console.log('\nSITES  Where the ship puts in: a visible choice of difficulty (the author, 2026-11-24)');
const SITE_POLICIES = {
  careful: { policy: careful },
  'play them off': { policy: C({ envoy: 'playoff' }) },
  'equal pact, march': { policy: C({ neighbours: 'partisan', pact: 'equal', expedition: true }) },
  'client pact, march': { policy: C({ neighbours: 'partisan', pact: 'client', expedition: true }) },
  'fortress (company)': { policy: C({ fortress: true, expedition: true }) },
  'fortress (Crown)': { policy: C({ fortress: true, expedition: true }), charter: 'crown' },
  'fortress, soldier (Crown)': { policy: C({ fortress: true, expedition: true }), charter: 'crown', background: 'soldier' },
  'keep apart': { policy: C({ neighbours: 'isolate', share: false }) },
};
const bySite = {};
for (const site of Object.keys(D.sites)) {
  bySite[site] = Object.fromEntries(Object.entries(SITE_POLICIES).map(([k, o]) => [k, arm(`${site} ${k}`, { site, ...o })]));
  console.log(`${site.padEnd(10)} | ${Object.entries(bySite[site]).map(([k, r]) => `${k} ${pct(r.filter(won).length, runs)}`).join(' | ')}`);
  console.log(`${''.padEnd(10)} | ten yrs, careful ${pct(bySite[site].careful.filter(ten).length, runs)}; best on seed: ${bestOn(bySite[site], worth)}`);
}
console.log(`  palisade, play them off minus careful: ${gap(bySite.palisade.careful.map(won), bySite.palisade['play them off'].map(won))} pts; Crown fortress minus Crown careful needs its own arm, below`);
{ const cc = arm('palisade crown careful', { site: 'palisade', policy: careful, charter: 'crown' });
  console.log(`  palisade, Crown: careful ${pct(cc.filter(won).length, runs)}; fortress minus careful ${gap(cc.map(won), bySite.palisade['fortress (Crown)'].map(won))} pts; breaches ${mean(cc.map((s) => s.stats.breaches)).toFixed(2)} against ${mean(bySite.palisade['fortress (Crown)'].map((s) => s.stats.breaches)).toFixed(2)}; bloody repulses ${mean(bySite.palisade['fortress (Crown)'].map((s) => s.stats.bloody || 0)).toFixed(2)}`); }

// ---------------------------------------------------------------------------------------------
console.log('\nENVOY  Playing them off, and the other errands');
const env = { 'no envoy': arm('no envoy', { policy: C({ envoy: 'none' }) }), parley: real, 'play them off': nb['trade, play them off'], mediate: nb['trade, mediate'] };
for (const [k, r] of Object.entries(env)) console.log(`${k.padEnd(14)} | win ${pct(r.filter(won).length, runs).padStart(9)} | incitements ${f1(mean(r.map((s) => s.stats.incites)))} (found out ${mean(r.map((s) => s.stats.incitesFound)).toFixed(2)}, fights set going ${mean(r.map((s) => s.stats.incitedFights || 0)).toFixed(2)}) | parleys ${f1(mean(r.map((s) => s.stats.parleys)))} (truces ${mean(r.map((s) => s.stats.truces)).toFixed(2)}) | mediations ${f1(mean(r.map((s) => s.stats.mediations)))} | attacks ${f1(mean(r.map((s) => s.stats.attacks)))}`);
console.log(`  win gaps over no envoy: parley ${gap(env['no envoy'].map(won), real.map(won))}; play them off ${gap(env['no envoy'].map(won), env['play them off'].map(won))}; mediate ${gap(env['no envoy'].map(won), env.mediate.map(won))}`);

// ---------------------------------------------------------------------------------------------
console.log('\nPACTS  Allies as pawns, or as equals');
for (const [k, r] of [['trade, no pact', real], ['equal pact, march', nb['equal pact, march']], ['client pact, march', nb['client pact, march']]]) {
  const w = r.filter(won), near = (s) => s.nations.filter((n) => n.near);
  console.log(`${k.padEnd(20)} | win ${pct(w.length, runs).padStart(9)} | of the colonies that stand: land held ${f1(mean(w.map((s) => s.landFree)))}, people ${f1(mean(w.map(popOf)))}, the near nations' people ${f1(mean(w.map((s) => near(s).reduce((q, n) => q + n.pop, 0))))} | land taken ${f1(mean(r.map((s) => s.stats.landTaken)))} | marches ${f1(mean(r.map((s) => s.stats.expeditions)))} (client in front ${f1(mean(r.map((s) => s.stats.clientMarches)))}) | pact kept to the end ${pct(r.filter((s) => s.pact).length, runs)} | ${why(r)}`);
}
console.log(`  win gap, client minus equal: ${gap(nb['equal pact, march'].map(won), nb['client pact, march'].map(won))} pts`);

// ---------------------------------------------------------------------------------------------
console.log('\nFACTIONS  Real threats, not micromanagement');
const fac = { 'hears the worst (careful)': real, 'hears the colony': arm('fac colony', { policy: C({ factions: 'colony' }) }), 'never concedes': arm('fac no concede', { policy: C({ concede: false }) }), 'hears no one, concedes nothing': arm('fac ignore', { policy: C({ factions: 'ignore', concede: false }) }) };
for (const [k, r] of Object.entries(fac)) {
  const mut = r.filter((s) => s.ended.why === 'mutiny'), by = {}; for (const s of mut) by[s.stats.mutinyBy] = (by[s.stats.mutinyBy] || 0) + 1;
  console.log(`${k.padEnd(31)} | win ${pct(r.filter(won).length, runs).padStart(9)} | mutiny ${pct(mut.length, runs)} (in office ${pct(mut.filter((s) => !s.ended.after).length, runs)}; by ${Object.entries(by).map(([f, n]) => `${f} ${n}`).join(', ') || 'none'}) | demands a life ${f1(mean(r.map((s) => s.stats.demands)))}, granted ${f1(mean(r.map((s) => s.stats.conceded)))}`);
}
console.log(`  win gap, careful minus hears no one: ${gap(fac['hears no one, concedes nothing'].map(won), real.map(won))} pts; careful minus never concedes: ${gap(fac['never concedes'].map(won), real.map(won))}`);

// ---------------------------------------------------------------------------------------------
console.log('\nSTARTS  Backgrounds, by charter and site (careful)');
for (const [k, o] of [['company', {}], ['Crown', { charter: 'crown' }], ['palisade', { site: 'palisade' }]]) {
  const rs = Object.fromEntries(Object.keys(D.backgrounds).map((b) => [b, b === 'none' && k === 'company' ? real : arm(`bg ${k} ${b}`, { policy: careful, background: b, ...o })]));
  console.log(`${k.padEnd(9)} | ${Object.entries(rs).map(([b, r]) => `${b} ${pct(r.filter(won).length, runs)}`).join(' | ')}`);
}

// ---------------------------------------------------------------------------------------------
console.log('\nCLAIM 5  The middle is not dead (proxy: turns with something pressing; see KILLGATE.md)');
for (const [name, lo, hi] of [['years 0-10', 0, 20], ['years 10-20', 20, 40], ['years 20-30', 40, 60]]) {
  const t = real.flatMap((s) => s.stats.live.slice(lo, Math.min(hi, s.govDiedAt ?? s.t)));
  console.log(`${name.padEnd(12)} | governor-turns ${String(t.length).padStart(6)} | none pressing ${pct(t.filter((x) => x === 0).length, t.length || 1)} | one ${pct(t.filter((x) => x === 1).length, t.length || 1)} | two or more ${pct(t.filter((x) => x >= 2).length, t.length || 1)}`);
}

// ---------------------------------------------------------------------------------------------
console.log('\nCLAIM 6  Winning is reachable and uncommon (target: careful about one in three, careless almost never)');
const cl = arm('careless', { policy: careless }), noDep = arm('no deputy', { policy: C({ deputy: false }) });
row('careful', real); row('careless', cl); row('careful, no deputy', noDep);
console.log(`  deputy worth (win, careful minus no deputy): ${gap(noDep.map(won), real.map(won))} pts`);

// ---------------------------------------------------------------------------------------------
console.log('\nCLAIM 7  Crown and company are both worth choosing');
const crown = arm('crown', { policy: careful, charter: 'crown' }), crownCl = arm('crown careless', { policy: careless, charter: 'crown' });
row('company, careful', real); row('Crown, careful', crown); row('company, careless', cl); row('Crown, careless', crownCl);
console.log(`  win gap, Crown minus company (careful): ${gap(real.map(won), crown.map(won))} pts; best on seed (worth): ${bestOn({ company: real, crown }, worth)}`);

// ---------------------------------------------------------------------------------------------
console.log('\nCLAIM 8  Sickness cuts both ways and ends nobody; and a tie buys something (the author, 2026-11-24)');
const noShare = arm('no share', { policy: C({ share: false }) });
for (const [k, r] of [['shares cures', real], ['does not', noShare]]) console.log(`${k.padEnd(14)} | win ${pct(r.filter(won).length, runs).padStart(9)} | waves on colony ${f1(mean(r.map((s) => s.stats.feverWaves)))} | on nations ${f1(mean(r.map((s) => s.stats.nationWaves)))} | colony fever dead ${mean(r.map((s) => s.stats.feverDead)).toFixed(0)} | nations' fever dead ${mean(r.map((s) => s.stats.nationFeverDead)).toFixed(0)} | smallest nation ever ${Math.min(...r.map((s) => s.stats.minNationPop)).toFixed(0)} | mean tie at end ${mean(r.map((s) => mean(s.nations.map((n) => n.rel)))).toFixed(0)}`);
console.log(`  tie at end, shares minus does not: ${(() => { const p = paired(noShare.map((s) => mean(s.nations.map((n) => n.rel))), real.map((s) => mean(s.nations.map((n) => n.rel)))); return `${p.diff.toFixed(1)}±${p.se.toFixed(1)}${p.real ? '' : ' ~'}`; })()}; win gap ${gap(noShare.map(won), real.map(won))} pts`);

console.log(`\n${cache.size} arms x ${runs} seeds = ${cache.size * runs} runs. Life ${D.life} turns, then ${D.after} without the governor.`);
