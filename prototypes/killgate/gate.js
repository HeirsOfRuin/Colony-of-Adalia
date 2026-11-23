// The kill-gate tables, one per claim in docs/SPEC.md "Proof before screens".
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
const ten = (s) => !!s.stats.at20;                        // stood, with the colony alive, at year ten
const why = (rows) => { const c = {}; for (const s of rows) c[s.ended.why + (s.ended.after ? '+' : '')] = (c[s.ended.why + (s.ended.after ? '+' : '')] || 0) + 1; return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(100 * v / rows.length).toFixed(0)}`).join(', '); };
/** On how many seeds each arm is the best (ties split). */
function bestOn(arms, value) {
  const wins = Object.fromEntries(Object.keys(arms).map((k) => [k, 0]));
  seeds.forEach((_, i) => { const v = Object.entries(arms).map(([k, r]) => [k, value(r[i])]); const top = Math.max(...v.map((x) => x[1])); const tied = v.filter((x) => x[1] === top); for (const [k] of tied) wins[k] += 1 / tied.length; });
  return Object.entries(wins).map(([k, v]) => `${k} ${(100 * v / runs).toFixed(0)}%`).join(' | ');
}
const row = (name, r) => console.log(`${name.padEnd(22)} | ten yrs ${pct(r.filter(ten).length, runs).padStart(9)} | win ${pct(r.filter(won).length, runs).padStart(9)} | pop@10 ${mean(r.filter(ten).map((s) => s.stats.at20.pop)).toFixed(0).padStart(4)} | ${why(r)}`);
const C = (o) => policy(o);

console.log(`\n${runs} seeds per arm, the same seeds in every arm. Company charter unless said. "ten yrs" = alive and unrecalled at year ten; "win" = stands ten years after the governor.`);
console.log('Endings: + means after the governor\'s death.\n');

console.log('CLAIM 1  The wait is the game');
const real = arm('careful', { policy: careful }), onTime = arm('careful/on-time', { policy: careful, onTime: true });
const today = arm('today', { policy: C({ order: 'today' }) }), todayOn = arm('today/on-time', { policy: C({ order: 'today' }), onTime: true });
row('careful, real ships', real); row('careful, on time', onTime); row('orders for today', today); row('today, on time', todayOn);
console.log(`  ten-year gap, on-time minus real (careful): ${gap(real.map(ten), onTime.map(ten))} pts; win gap ${gap(real.map(won), onTime.map(won))}`);
console.log(`  ten-year gap, ahead minus today (real ships): ${gap(today.map(ten), real.map(ten))} pts; win gap ${gap(today.map(won), real.map(won))}`);
console.log(`  ten-year gap, ahead minus today (on time):    ${gap(todayOn.map(ten), onTime.map(ten))} pts`);

console.log('\nCLAIM 2  Powder is a clock');
const hunts = { need: real, early: arm('hunt early', { policy: C({ hunt: 'early' }) }), always: arm('hunt always', { policy: C({ hunt: 'always' }) }), never: arm('hunt never', { policy: C({ hunt: 'never' }) }) };
for (const [k, r] of Object.entries(hunts)) console.log(`${('hunt ' + k).padEnd(22)} | ten yrs ${pct(r.filter(ten).length, runs).padStart(9)} | win ${pct(r.filter(won).length, runs).padStart(9)} | hungry winters ${mean(r.map((s) => s.stats.hungryWinters)).toFixed(2)} | starved ${mean(r.map((s) => s.stats.starved)).toFixed(1)} | kegs hunted ${mean(r.map((s) => s.stats.kegsHunted)).toFixed(0)} | attacks met without powder ${mean(r.map((s) => s.stats.powderOut)).toFixed(2)} | breaches ${mean(r.map((s) => s.stats.breaches)).toFixed(2)} | killed ${mean(r.map((s) => s.stats.killed)).toFixed(1)}`);
console.log(`  best on seed (worth): ${bestOn(hunts, worth)}`);

console.log('\nCLAIM 3  The neighbours are not a hazard table');
const nb = { 'trade with both': real, 'take a side': arm('partisan', { policy: C({ neighbours: 'partisan' }) }), 'side, raid the rival': arm('partisan raid', { policy: C({ neighbours: 'partisan', raidRival: true }) }), 'keep apart': arm('isolate', { policy: C({ neighbours: 'isolate', share: false }) }), 'raid when hungry': arm('raid', { policy: C({ neighbours: 'raid', share: false }) }), 'trade, sell powder': arm('sell powder', { policy: C({ sellPowder: true }) }) };
for (const [k, r] of Object.entries(nb)) console.log(`${k.padEnd(22)} | ten yrs ${pct(r.filter(ten).length, runs).padStart(9)} | win ${pct(r.filter(won).length, runs).padStart(9)} | pop@10 ${mean(r.filter(ten).map((s) => s.stats.at20.pop)).toFixed(0).padStart(4)} | worst tie@10 ${mean(r.filter(ten).map((s) => Math.min(...s.stats.at20.rel))).toFixed(0).padStart(4)} | attacks ${mean(r.map((s) => s.stats.attacks)).toFixed(1)} | breaches ${mean(r.map((s) => s.stats.breaches)).toFixed(2)} | pact years ${mean(r.map((s) => s.stats.pactYears)).toFixed(1)} | calls ${mean(r.map((s) => s.stats.calls)).toFixed(1)} | ${why(r)}`);
console.log(`  best on seed (worth): ${bestOn(nb, worth)}`);
for (const [name, f] of [['feud cold at landing (under 40)', (s) => s.feud0 < 40], ['feud hot at landing (over 60)', (s) => s.feud0 > 60]]) { const idx = seeds.map((_, i) => i).filter((i) => f(real[i])); console.log(`  ${name}, ${idx.length} seeds, win: ${Object.entries(nb).map(([k, r]) => `${k} ${pct(idx.filter((i) => won(r[i])).length, idx.length)}`).join(' | ')}`); }
console.log(`  best on seed at year ten (pop): ${bestOn(nb, (s) => (ten(s) ? s.stats.at20.pop : 0))}`);

console.log('\nCLAIM 4  No best job');
const sp = { adaptive: real }; for (const k of Object.keys(SPLITS)) sp[k] = arm('split ' + k, { policy: C({ split: k }) });
for (const [k, r] of Object.entries(sp)) row('split ' + k, r);
console.log(`  best on seed (worth), fixed splits only: ${bestOn(Object.fromEntries(Object.entries(sp).filter(([k]) => k !== 'adaptive')), worth)}`);
console.log(`  best on seed (worth), all six: ${bestOn(sp, worth)}`);

console.log('\nWAR  The watch, the expedition, and what an ally costs');
const war = { careful: real, 'marches on a hostile neighbour': arm('expedition', { policy: C({ expedition: true }) }), 'no watch kept': arm('no watch', { policy: C({ noWatch: true }) }), 'side, marches with the ally': arm('partisan march', { policy: C({ neighbours: 'partisan', expedition: true }) }), 'side, refuses the call': arm('refuse call', { policy: C({ neighbours: 'partisan', answerCall: false }) }), 'side, answers': nb['take a side'] };
for (const [k, r] of Object.entries(war)) console.log(`${k.padEnd(30)} | ten yrs ${pct(r.filter(ten).length, runs).padStart(9)} | win ${pct(r.filter(won).length, runs).padStart(9)} | attacks ${mean(r.map((s) => s.stats.attacks)).toFixed(1)} | breaches ${mean(r.map((s) => s.stats.breaches)).toFixed(2)} | killed ${mean(r.map((s) => s.stats.killed)).toFixed(1)} | expeditions ${mean(r.map((s) => s.stats.expeditions)).toFixed(2)} (carried ${mean(r.map((s) => s.stats.carried)).toFixed(2)}, routed ${mean(r.map((s) => s.stats.routs)).toFixed(2)}) | calls ${mean(r.map((s) => s.stats.calls)).toFixed(1)} | ${why(r)}`);
console.log(`  win gap, marches minus careful: ${gap(real.map(won), war['marches on a hostile neighbour'].map(won))} pts; no watch minus careful: ${gap(real.map(won), war['no watch kept'].map(won))}; answers minus refuses: ${gap(war['side, refuses the call'].map(won), war['side, answers'].map(won))}; side and march minus side: ${gap(war['side, answers'].map(won), war['side, marches with the ally'].map(won))}`);

console.log('\nNAMES  The named few, and what hunger costs');
const noNames = arm('no names', { policy: careful, noNames: true });
for (const [k, r] of [['careful, eight named', real], ['careful, nobody named', noNames], ['plough, eight named', sp.plough]]) console.log(`${k.padEnd(24)} | win ${pct(r.filter(won).length, runs).padStart(9)} | starved ${mean(r.map((s) => s.stats.starved)).toFixed(0)} | named dead ${mean(r.map((s) => s.stats.namedDead)).toFixed(1)} | sent out to replace ${mean(r.map((s) => s.stats.namedSent)).toFixed(1)} | places filled at the end ${mean(r.map((s) => Object.values(s.named).filter(Boolean).length)).toFixed(1)} of 8`);
console.log(`  win gap, named minus not: ${gap(noNames.map(won), real.map(won))} pts`);
const safe = arm('named safe', { policy: careful, namedSafe: true });
console.log(`careful, the named cannot die | win ${pct(safe.filter(won).length, runs)}; win gap, safe minus mortal: ${gap(real.map(won), safe.map(won))} pts`);

console.log('\nSTART  The near nation\'s temper on landing (careful)');
for (const [name, f] of [['below -15', (s) => s.base0 < -15], ['-15 to 10', (s) => s.base0 >= -15 && s.base0 <= 10], ['above 10', (s) => s.base0 > 10]]) { const idx = seeds.map((_, i) => i).filter((i) => f(real[i])); console.log(`${name.padEnd(10)} | ${String(idx.length).padStart(4)} seeds | ${Object.entries({ 'trade with both': real, 'take a side': nb['take a side'], 'side and march': war['side, marches with the ally'], 'keep apart': nb['keep apart'] }).map(([k, r]) => `${k} ${pct(idx.filter((i) => won(r[i])).length, idx.length)}`).join(' | ')}`); }

console.log('\nCLAIM 5  The middle is not dead (proxy: turns with something pressing; see KILLGATE.md)');
for (const [name, lo, hi] of [['years 0-10', 0, 20], ['years 10-20', 20, 40], ['years 20-30', 40, 60]]) {
  const t = real.flatMap((s) => s.stats.live.slice(lo, Math.min(hi, s.govDiedAt ?? s.t)));
  console.log(`${name.padEnd(12)} | governor-turns ${String(t.length).padStart(6)} | none pressing ${pct(t.filter((x) => x === 0).length, t.length || 1)} | one ${pct(t.filter((x) => x === 1).length, t.length || 1)} | two or more ${pct(t.filter((x) => x >= 2).length, t.length || 1)}`);
}

console.log('\nCLAIM 6  Winning is reachable and uncommon (target: careful about one in three, careless almost never)');
const cl = arm('careless', { policy: careless }), noDep = arm('no deputy', { policy: C({ deputy: false }) });
row('careful', real); row('careless', cl); row('careful, no deputy', noDep);
const lived = real.filter((s) => s.govDiedAt !== null);
console.log(`  careful: governor died or laid down in office in ${pct(lived.length, runs)}; of those the colony stood ${pct(lived.filter(won).length, lived.length || 1)}; governor's last turn median ${summarize(lived.map((s) => s.govDiedAt)).median}`);
console.log(`  deputy worth (win, careful minus no deputy): ${gap(noDep.map(won), real.map(won))} pts`);

console.log('\nCLAIM 7  Crown and company are both worth choosing');
const crown = arm('crown', { policy: careful, charter: 'crown' }), crownCl = arm('crown careless', { policy: careless, charter: 'crown' });
row('company, careful', real); row('crown, careful', crown); row('company, careless', cl); row('crown, careless', crownCl);
console.log(`  win gap, crown minus company (careful): ${gap(real.map(won), crown.map(won))} pts; ten-year gap ${gap(real.map(ten), crown.map(ten))}`);
console.log(`  best on seed (worth): ${bestOn({ company: real, crown }, worth)}; ships landed in the whole run: company ${mean(real.map((s) => s.stats.ships)).toFixed(1)}, crown ${mean(crown.map((s) => s.stats.ships)).toFixed(1)}`);

console.log('\nCLAIM 8  Sickness cuts both ways and ends nobody');
const noShare = arm('no share', { policy: C({ share: false }) });
for (const [k, r] of [['shares cures', real], ['does not', noShare]]) console.log(`${k.padEnd(22)} | win ${pct(r.filter(won).length, runs).padStart(9)} | waves on colony ${mean(r.map((s) => s.stats.feverWaves)).toFixed(1)} | on nations ${mean(r.map((s) => s.stats.nationWaves)).toFixed(1)} | colony fever dead ${mean(r.map((s) => s.stats.feverDead)).toFixed(0)} | nation fever dead ${mean(r.map((s) => s.stats.nationFeverDead)).toFixed(0)} | smallest nation ever ${Math.min(...r.map((s) => s.stats.minNationPop)).toFixed(0)} | mean tie at end ${mean(r.map((s) => mean(s.nations.map((n) => n.rel)))).toFixed(0)} | runs with both peoples hit ${pct(r.filter((s) => s.stats.feverWaves > 0 && s.stats.nationWaves > 0).length, runs)}`);
console.log(`  tie at end, shares minus does not: ${(() => { const p = paired(noShare.map((s) => mean(s.nations.map((n) => n.rel))), real.map((s) => mean(s.nations.map((n) => n.rel)))); return `${p.diff.toFixed(1)}±${p.se.toFixed(1)}${p.real ? '' : ' ~'}`; })()}; win gap ${gap(noShare.map(won), real.map(won))} pts`);
console.log(`\n${cache.size} arms x ${runs} seeds = ${cache.size * runs} runs. Life ${D.life} turns, then ${D.after} without the governor.`);
