// The kill-gate model: one governor's colony as numbers. No UI, no prose, no names of
// peoples or places. Round 2 (docs/KILLGATE.md) added the nations' feud, pacts, the watch,
// the expedition and eight named places (docs/FRAME-war.md is the design of the war side).
// Deterministic: every draw comes from a stream named by (seed, turn, system), so two
// policies on one seed meet the same weather, the same ship fates and the same court.
//   play(seed, { policy, charter, onTime, ... }) -> final state
// A turn is half a year: even turns are summer (the sailing season), odd turns winter.

import { streamFor } from './rng.js';
import { D } from './data.js';

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const ITEMS = ['powder', 'iron', 'salt', 'goods', 'food', 'spec', 'lab', 'craft', 'sold', 'fam'];
export const ROLES = Object.keys(D.roles);
const role = (s, k) => (s.named[k] ? D.roles[k] : 1);

export const popOf = (s) => s.lab + s.craft + s.sold + s.gent + s.fam;
export const handsOf = (s, press) => s.lab + s.craft + 0.5 * s.sold + (press ? 0.6 * s.gent : 0) + 0.4 * s.fam;
export const yearOf = (s) => Math.floor(s.t / 2);
export const hostile = (s) => s.nations.some((n) => n.rel < D.warBelow);

export function newColony(seed, opt = {}) {
  const r = streamFor(seed, 0, 'world');
  const s = {
    seed, t: 0, charter: opt.charter || 'company', onTime: !!opt.onTime,
    ...D.start, cargo: 0, walls: 0, fields: 0, store: 0, mill: false, millWork: 0, buildWork: 0, range: 0, born: 0,
    landFree: D.landFree, strikes: 0, diedNow: 0, diedYear: 0, loseN: 0,
    feud: 0, feud0: 0, base0: 0, pact: null, drill: 0, cover: 0,
    named: Object.fromEntries(ROLES.map((k) => [k, !opt.noNames])), noNames: !!opt.noNames, namedSafe: !!opt.namedSafe,
    nations: D.nations.map((n) => ({ id: n.id, pop: n.pop, corn: n.pop * 0.6, rel: 0, base: r.range(n.base[0], n.base[1]), grudge: 0, guns: 0, cornK: n.corn, fever: 0, contact: false })),
    inbound: [], shipHere: false, letter: null, cargoHome: 0,
    used: { powder: 4, iron: 2, salt: 2, goods: 4 }, usedNow: { powder: 0, iron: 0, salt: 0, goods: 0 },
    govAlive: true, govDiedAt: null, deputy: 0, ended: null,
    stats: { ships: 0, noShip: 0, lost: 0, starved: 0, killed: 0, feverDead: 0, nationFeverDead: 0, feverWaves: 0, nationWaves: 0, attacks: 0, breaches: 0, raids: 0, powderOut: 0, hungryWinters: 0, hungrySummers: 0, kegsHunted: 0, peak: 0, live: [], at20: null, minNationPop: Infinity, namedDead: 0, namedSent: 0, calls: 0, callsRefused: 0, expeditions: 0, carried: 0, routs: 0, feudFights: 0, pactYears: 0 },
  };
  for (const n of s.nations) n.rel = n.base;
  s.feud = s.feud0 = r.range(D.feud[0], D.feud[1]); s.base0 = s.nations[0].base;
  // the settler ship that brought them goes home with the first letter
  s.shipHere = true;
  return s;
}

// One derivation each for what a nation can send and what the colony can stand off: the
// war resolves with these and the governor is shown these (rule 1).
export const strengthOf = (n) => n.pop * D.warriorShare * clamp(D.commit[0] + (D.warBelow - n.rel) / 100, D.commit[0], D.commit[1]) * (1 + n.guns * D.gunEdge);
const menOf = (s) => s.sold + (D.settlerArms + D.drillArms * s.drill) * (popOf(s) - s.sold);
export const defenceOf = (s, armed = 1) => (s.walls * D.wallDef + menOf(s) * (D.unarmedDef + (D.armedDef - D.unarmedDef) * armed)) * role(s, 'captain');
// what the colony can take into the field, and what a nation can put up at home
export const forceOf = (s, armed = 1) => (s.sold + 0.5 * (D.settlerArms + D.drillArms * s.drill) * (popOf(s) - s.sold)) * (D.unarmedDef + (D.armedDef - D.unarmedDef) * armed) * role(s, 'captain');
/** warriors an ally sends on the colony's march against his rival */
export const allyMarchOf = (s, n) => (s.pact && n.id !== s.pact ? s.nations.find((o) => o.id === s.pact).pop * D.warriorShare * D.pactHelp * D.allyMarch : 0);
export const homeOf = (n) => n.pop * D.warriorShare * D.homeEdge * (1 + n.guns * D.gunEdge);

function end(s, why) { if (!s.ended) s.ended = { why, t: s.t }; }
function lose(s, n, key) {
  // deaths fall across the classes in proportion
  const p = popOf(s); if (p <= 0 || n <= 0) return 0;
  const k = Math.min(1, n / p);
  for (const c of ['lab', 'craft', 'sold', 'gent', 'fam']) s[c] = Math.max(0, s[c] * (1 - k));
  if (key) s.stats[key] += n;
  s.diedNow += n / p;
  s.morale -= D.deathMorale * k;
  // the named few die at the rate everyone does, and each is one person, not a share
  const rn = streamFor(s.seed, s.t, 'named' + (s.loseN++));
  if (!s.namedSafe) for (const q of ROLES) if (s.named[q] && rn.chance(Math.min(1, k * D.namedRisk))) { s.named[q] = false; s.stats.namedDead++; s.morale -= D.namedMorale; }
  return n;
}
function spend(s, item, q) { const u = Math.min(s[item], Math.max(0, q)); s[item] -= u; s.usedNow[item] += u; return u; }

// ---- the ship -------------------------------------------------------------------------------
function lading(s, letter) {
  const price = D.price[s.charter], budget = D.budget[s.charter](s.favour);
  let want = letter;
  if (!want) { want = {}; for (const [k, share] of Object.entries(D.standard[s.charter])) want[k] = (budget * share) / price[k]; }
  let cost = 0; const out = {};
  for (const k of ITEMS) {            // the letter is filled in its own order until the money is gone
    const q = Math.max(0, want[k] || 0), c = Math.min(q * price[k], budget - cost);
    out[k] = c / price[k]; cost += c;
  }
  const lost = out.craft * (1 - D.craftFound); out.craft -= lost;   // what the backers could find
  out[s.charter === 'crown' ? 'sold' : 'gent'] = (out[s.charter === 'crown' ? 'sold' : 'gent'] || 0) + lost;
  const people = out.lab + out.craft + out.sold + out.fam + (out.gent || 0);
  out.gent = (out.gent || 0) + people * D.gentPerShip[s.charter];
  out.lab += D.pushSettlers[s.charter](yearOf(s));
  // Nobody sails to a graveyard. (Sixth run of the gate: a fixed 60% on food starved 369 a
  // life and still won more often than the careful rule, because the dead were replaced free.)
  const willing = 1 - Math.min(D.graveyardMax, D.graveyard * s.diedYear);
  for (const c of ['lab', 'craft', 'sold', 'fam', 'gent']) out[c] *= willing;
  return out;
}

function shipSeason(s) {
  const r = streamFor(s.seed, s.t, 'ship');
  const fate = s.onTime ? { late: 0, short: 0, lost: 0 } : D.fate[s.charter];   // the on-time world: a ship every year, whole, in season
  let landed = null;
  for (const b of s.inbound.filter((x) => x.due <= s.t)) {
    s.inbound.splice(s.inbound.indexOf(b), 1);
    const x = r.next();
    if (x < fate.lost) { s.stats.lost++; continue; }
    if (x < fate.lost + fate.late && !b.late) { b.late = true; b.due = s.t + 2; s.inbound.push(b); continue; }
    const k = x < fate.lost + fate.late + fate.short ? 0.5 : 1;
    landed = landed || {}; for (const [i, q] of Object.entries(b.load)) landed[i] = (landed[i] || 0) + q * k;
  }
  s.shipHere = !!landed || s.t === 0;
  if (!landed) { if (s.t > 0) { s.stats.noShip++; s.morale += D.m.noShip; } return; }
  s.stats.ships++; s.morale += D.m.ship;
  for (const i of ['powder', 'iron', 'salt', 'goods', 'food']) s[i] += landed[i] || 0;
  for (const c of ['lab', 'craft', 'sold', 'fam', 'gent']) s[c] += (landed[c] || 0) * (1 - D.seasoning);
  // the men asked for by trade: the backers find one in two, and he fills an empty place
  for (let i = 0; i < (s.noNames ? 0 : Math.round(landed.spec || 0)); i++) { const empty = ROLES.filter((k) => !s.named[k]); if (empty.length && r.chance(D.specFound)) { s.named[r.pick(empty)] = true; s.stats.namedSent++; s.lab += 1; } }
  // the ship's fever, and whether it crosses to the nations
  if (r.chance(D.shipFever)) {
    const asked = s.plan.share && s.nations.some((n) => n.rel >= D.healerAbove);
    const d = r.float(...D.shipFeverDeath) * (asked ? D.nurseCut : 1) * role(s, 'surgeon');
    lose(s, popOf(s) * d, 'feverDead'); s.stats.feverWaves++; s.morale += D.m.fever; s.sickNow = true;
    for (const n of s.nations) if (r.chance(n.contact ? D.crossOver : D.crossOverNoContact)) n.fever = 1;
  }
}

function backers(s, letter) {
  // Every summer the backers decide on next year's ship. A ship that is here takes them the
  // cargo and the letter; with no ship they have neither, load what they think fit, and a
  // company counts the year as a loss. (First run of the gate: the decision was only made
  // when a ship called, so one missed ship meant no ship ever again: 2.5 landings a life.)
  const r = streamFor(s.seed, s.t, 'backers');
  const year = yearOf(s), sent = s.shipHere ? s.cargo : 0; if (s.shipHere) s.cargo = 0; else letter = null;
  if (s.charter === 'company') {
    const want = D.companyWants(year, popOf(s));
    s.favour += !s.shipHere ? D.companyNoShip : clamp(D.companySwing * (sent / Math.max(1, want) - 1), -D.companySwing, D.companySwing);
  } else {
    const want = D.companyWants(year, popOf(s));
    const flag = s.walls >= Math.min(6, 1 + year / 3) - 1e-9 && s.sold >= 6 ? D.flagBonus : -D.flagBonus;
    s.favour += r.normal(D.courtDrift, D.courtSd) + flag + D.crownCargoWeight * clamp(D.companySwing * (sent / Math.max(1, want) - 1), -D.companySwing, D.companySwing);
  }
  s.favour = clamp(s.favour, 0, 100);
  s.strikes = s.favour < D.recallBelow ? s.strikes + 1 : 0;
  if (s.strikes >= D.recallStrikes && s.govAlive) return end(s, 'recalled');
  if (s.onTime || r.chance(D.sails[s.charter](s.favour))) s.inbound.push({ due: s.t + 2, load: lading(s, letter) });
}

// ---- summer ---------------------------------------------------------------------------------
function summer(s, plan) {
  const w = streamFor(s.seed, yearOf(s), 'weather').normal(1, 0.2);   // one sky for everyone
  const r = streamFor(s.seed, s.t, 'summer');
  const press = !!plan.press; if (press) s.morale += D.m.press;
  // The summer is eaten out of the store before the harvest is in. (Third run of the gate:
  // the colony only ate in winter, so every colony needed half the food the design says.)
  const eat = popOf(s);
  if (s.food < eat) { lose(s, (eat - s.food) * D.summerDeathShare, 'starved'); s.food = 0; s.morale += D.m.starve / 2; s.stats.hungrySummers++; if (popOf(s) < D.minPop) return end(s, 'starved'); }
  else s.food -= eat;
  let hands = handsOf(s, press);
  // nursing the neighbours' sick costs hands; refusing costs more, later
  for (const n of s.nations) if (n.fever) {
    s.stats.nationWaves++;
    let d = r.float(...D.nationFeverDeath);
    if (plan.share) { d *= D.nurseCut; hands *= 1 - D.nurseHands; n.rel += D.nurseTie; n.grudge = Math.max(0, n.grudge + D.nurseGrudge); }
    else if (n.rel > 0) { n.rel += D.refuseTie; n.grudge += D.refuseGrudge; }
    const dead = n.pop * d; n.pop -= dead; s.stats.nationFeverDead += dead; n.fever = 0;
  }
  const ironNeed = hands * D.ironUsePerHand * role(s, 'smith'), iron = spend(s, 'iron', ironNeed);
  const tools = 1 - D.ironShortPenalty * (1 - (ironNeed ? iron / ironNeed : 1));
  const sp = plan.split, tot = (sp.food + sp.walls + sp.cargo + sp.build + sp.range + (sp.watch || 0)) || 1;
  const h = (k) => hands * (sp[k] || 0) / tot;
  // the watch: men under arms keep the field hands safe from a hostile neighbour, and drill
  s.cover = Math.min(1, h('watch') / Math.max(1, popOf(s) * D.watchCover));
  s.drill = Math.min(1, s.drill * (1 - D.drillDecay) + D.drillRate * h('watch') / Math.max(1, popOf(s)));
  const out = hostile(s) ? 1 - D.harassPenalty * (1 - s.cover) : 1;
  const craftK = (1 + 2 * s.craft / Math.max(1, popOf(s))) * role(s, 'carpenter');

  s.food += h('food') * D.foodPerHand * D.fieldMult(s.fields) * w * tools * out * role(s, 'husbandman');
  s.walls = Math.min(D.wallMax, s.walls * (1 - D.wallDecay) + h('walls') * D.wallPerHand * tools * craftK);
  s.cargo += h('cargo') * D.cargoPerHand * (1 + s.range) * tools * out * role(s, 'factor');
  s.range = Math.min(1, s.range + h('range') * D.rangePerHand);
  let bp = h('build') * tools * craftK;
  if (plan.build === 'mill' && !s.mill && s.craft >= D.millCraft) { s.millWork += bp; if (s.millWork >= D.millCost) s.mill = true; }
  else if (plan.build === 'store' && s.store < D.storeMax) { s.buildWork += bp; if (s.buildWork >= D.storeCost) { s.buildWork -= D.storeCost; s.store++; } }
  else { s.buildWork += bp; while (s.fields < 10 && s.buildWork >= D.fieldCost(s.fields)) { s.buildWork -= D.fieldCost(s.fields); s.fields++; } }
  if (s.mill) s.powder += D.millKegs / 2;

  // the neighbours: their harvest, the governor's dealings, the land, and their answer
  for (const n of s.nations) {
    n.corn = Math.max(0, n.corn * 0.6 + n.pop * 2 * (n.cornK * w - 1) + n.pop * 0.25);
    n.pop *= 1.006;
    let st = plan.stance[n.id] || 'ignore';
    const other = s.nations.find((o) => o !== n), before = n.rel;
    if (st === 'ally') {             // a pact: asked for where the tie is good enough, kept by trading
      if (!s.pact && n.rel >= D.pactAbove) s.pact = n.id;
      st = 'trade';
    }
    if (st === 'trade' && n.rel < D.tradeAbove) st = 'gift';   // they will not trade with people they do not trust; a gift is how it starts
    n.contact = st !== 'ignore';
    if (st === 'trade') {
      const g = spend(s, 'goods', Math.min(s.goods, plan.tradeGoods ?? 4));
      s.cargo += g * D.furPerGood * (1 + s.range);
      if (g >= popOf(s) * D.friendshipPrice * 0.5 - 1e-9) n.rel += D.tradeTie + (s.named.interpreter ? D.roles.interpreter : 0);   // half the year's price to each of two
      if (plan.buyLand && n.id === 'near' && popOf(s) > s.landFree - 10 && n.rel > 0 && s.goods >= D.landCost) { spend(s, 'goods', D.landCost); s.landFree += D.landPerDeal; }
      const kegs = spend(s, 'powder', plan.sellPowder?.[n.id] || 0);
      if (kegs > 0) { n.guns += kegs; n.rel += kegs * D.powderTie; s.food += Math.min(n.corn, kegs * D.powderFood); n.corn = Math.max(0, n.corn - kegs * D.powderFood); for (const o of s.nations) if (o !== n) o.rel -= kegs * D.rivalSpite; }
      if (r.chance(D.tradeFever)) {   // a fever comes back with the trading season
        const d = r.float(...D.colonyFeverDeath) * (plan.share && n.rel >= D.healerAbove ? D.nurseCut : 1) * role(s, 'surgeon');
        if (plan.share && n.rel >= D.healerAbove) n.rel += D.healerTie;
        lose(s, popOf(s) * d, 'feverDead'); s.stats.feverWaves++; s.morale += D.m.fever; s.sickNow = true;
      }
    } else if (st === 'gift') { if (spend(s, 'goods', D.giftCost) >= D.giftCost - 1e-9) n.rel += D.giftTie; }
    else if (st === 'raid') {
      spend(s, 'powder', D.raidKegs); s.stats.raids++;
      const take = Math.min(n.corn * D.raidShare, D.raidMax) * (s.powder > 0 ? 1 : 0.5);
      s.food += take; n.corn -= take; n.rel += D.raidTie; n.grudge += D.raidGrudge; lose(s, r.range(0, 4), 'killed');
      if (s.feud > D.fightAbove) other.rel += D.raidRivalTie;   // his enemy's enemy
    }
    // taking a side: what is gained with one is lost with the other, as hot as their feud is
    if (n.rel > before) other.rel -= (n.rel - before) * D.sideCost * s.feud / 100;
    if (n.id === 'near' || popOf(s) > s.landFree * 1.5) n.rel -= Math.max(0, popOf(s) - s.landFree) * D.landPressure * (n.id === 'near' ? 1 : 0.5);
    n.grudge *= 1 - D.grudgeDecay;
    n.rel += ((n.base - n.grudge) - n.rel) * D.drift;
    n.rel = clamp(n.rel, -100, 100 - n.grudge);
  }
  politics(s, plan, r);
  if (plan.expedition) expedition(s, s.nations.find((n) => n.id === plan.expedition), r);
  if (s.ended) return;
  // the ship sails: abandonment, then the cargo and the letter
  if (s.shipHere && s.t > 0 && s.morale < D.abandonBelow && s.food < popOf(s) * 0.5) return end(s, 'abandoned');
  backers(s, plan.letter);
}

// ---- politics -------------------------------------------------------------------------------
// The two nations have a feud of their own. When it is hot they fight; an ally calls the
// colony out; a nation that wins too well starts naming its price.
function politics(s, plan, r) {
  s.feud = clamp(s.feud + r.normal(0, D.feudSd), 0, 100);
  const ally = s.nations.find((n) => n.id === s.pact), rival = ally && s.nations.find((n) => n !== ally);
  if (ally && ally.rel < D.pactBreaks) s.pact = null;
  if (s.pact) s.stats.pactYears++;
  if (s.feud > D.fightAbove && r.chance(D.fightChance)) {
    s.stats.feudFights++;
    const [x, y] = [...s.nations].sort((p, q) => homeOf(q) - homeOf(p));   // the stronger, the weaker
    y.pop *= 1 - D.fightLoss; x.pop *= 1 - D.fightLoss / 2;
    if (x.guns > y.guns + 10) { y.rel -= 8; y.grudge += 4; }   // the loser knows who sold the guns
    if (s.pact) {
      s.stats.calls++;
      if (plan.answerCall !== false) {
        spend(s, 'powder', D.callKegs); lose(s, r.range(0, 3), 'killed');
        rival.rel += D.callRivalTie; rival.grudge += D.callRivalGrudge; rival.pop *= 0.97; ally.rel += D.callTie;
        const q = Math.min(rival.corn * 0.15, D.callPlunder); rival.corn -= q; s.food += q;
      } else { s.stats.callsRefused++; ally.rel += D.refuseCall; s.pact = null; }
    }
  }
  if (s.pact && ally.pop > D.hegemon * rival.pop) {   // the friend who no longer needs you
    if (plan.payTribute !== false && s.goods >= D.tribute) spend(s, 'goods', D.tribute); else ally.rel += D.tributeRefused;
  }
  for (const n of s.nations) n.rel = clamp(n.rel, -100, 100 - n.grudge);
}

// The one fight the governor starts. Force against what the nation can put up at home; the
// roll moves the ratio by a fifth, it does not decide what beats what.
function expedition(s, n, r) {
  if (!n || n.rel >= D.warBelow) return;
  s.stats.expeditions++;
  const kegs = spend(s, 'powder', D.expeditionKegs), ratio = (forceOf(s, kegs / D.expeditionKegs) + allyMarchOf(s, n)) / Math.max(1, homeOf(n) * r.float(0.8, 1.2));
  if (ratio >= D.carried) {
    s.stats.carried++; lose(s, r.range(0, 3), 'killed'); n.pop *= 1 - D.carriedPop;
    const q = Math.min(n.corn, D.carriedCorn); n.corn -= q; s.food += q;
    n.grudge += D.carriedGrudge; n.rel = Math.max(n.rel, D.warBelow + 15); s.morale += D.m.repulse; s.favour += D.expeditionFavour[s.charter];
  } else if (ratio >= D.standOff) { lose(s, r.range(1, 4), 'killed'); n.rel += 5; n.grudge += D.carriedGrudge / 2; }
  else { s.stats.routs++; lose(s, forceOf(s) * D.routShare, 'killed'); n.rel -= 10; s.morale += D.m.breach; }
  if (popOf(s) < D.minPop) end(s, 'overrun');
}

// ---- war ------------------------------------------------------------------------------------
// A nation that has turned comes in the dead of winter, after the hunting is done and months
// before any ship. (Fifth run of the gate: attacks came in summer, behind the ship, so a
// magazine emptied on deer was always full again before it was needed.)
function war(s, r) {
  for (const n of s.nations) {
    // a partisan is his ally's enemy's target; a neutral is left alone while the two are busy with each other
    const heat = s.pact ? (n.id !== s.pact ? D.pactTarget : 1) : 1 - s.feud / D.busyDiv;
    if (n.rel >= D.warBelow || !r.chance(Math.min(D.attackMax, (D.attackBase + D.attackSlope * (D.warBelow - n.rel)) * heat))) continue;
    s.stats.attacks++;
    const S = strengthOf(n) * r.float(0.7, 1.3);
    const kegsNeed = S * D.kegsPerAttack, kegs = spend(s, 'powder', kegsNeed), armed = kegsNeed ? kegs / kegsNeed : 1;
    if (kegs < kegsNeed) s.stats.powderOut++;
    const ally = s.nations.filter((o) => o !== n && (o.id === s.pact || o.rel > D.allyAbove)).reduce((q, o) => q + o.pop * D.warriorShare * (o.id === s.pact ? D.pactHelp : D.allyHelp), 0);
    const Dv = defenceOf(s, armed) + ally;
    if (Dv >= S) { lose(s, r.range(0, 3), 'killed'); n.pop *= 0.97; n.rel += 6; s.morale += D.m.repulse; }
    else { const k = (S - Dv) / S; lose(s, popOf(s) * k * D.breachPop, 'killed'); s.food *= 1 - k * D.breachFood; s.walls = Math.max(0, s.walls - 1); s.stats.breaches++; s.morale += D.m.breach; n.rel += 12; }
    if (popOf(s) < D.minPop) return end(s, 'overrun');
  }
}

// ---- winter ---------------------------------------------------------------------------------
function winter(s, plan) {
  const r = streamFor(s.seed, s.t, 'winter');
  const pop = popOf(s);
  const kegs = spend(s, 'powder', Math.min(plan.hunt || 0, pop * D.huntKegsPerHead));
  s.food += kegs * D.huntFoodPerKeg * (1 + 0.5 * s.range); s.stats.kegsHunted += kegs;
  for (const n of s.nations) {       // corn bought, where there is corn and they will sell
    if (!(plan.buyCorn > 0) || n.rel <= -10 || s.goods <= 0) continue;
    const price = D.cornPrice / (1 + Math.max(0, n.rel) / 100) * (n.id === s.pact ? D.pactCorn : 1) * (s.named.interpreter ? 0.85 : 1);
    const q = Math.min(plan.buyCorn, n.corn * D.cornSold, s.goods / price); spend(s, 'goods', q * price); s.food += q; n.corn -= q; plan.buyCorn -= q; n.contact = true;
  }
  war(s, r); if (s.ended) return;
  const ration = plan.ration === 'short' ? D.shortRation : 1; let need = popOf(s) * ration;
  if (s.food < need) for (const n of s.nations) if (n.rel > D.allyAbove) { const q = Math.min(need - s.food, n.corn * D.allyCorn); s.food += q; n.corn -= q; n.rel -= 2; }
  if (plan.ration === 'short') { s.morale += D.m.short; lose(s, pop * D.shortRationDeath, 'starved'); }
  let hungry = false;
  if (s.food < need) { hungry = true; lose(s, (need - s.food) * D.starveDeathShare, 'starved'); s.food = 0; s.morale += D.m.starve; s.stats.hungryWinters++; }
  else s.food -= need;
  if (popOf(s) < D.minPop) return end(s, 'starved');
  const saltNeed = s.food * D.saltPerFood, salt = spend(s, 'salt', saltNeed), salted = saltNeed ? salt / saltNeed : 1;
  s.food *= 1 - (D.spoilSalted * salted + D.spoil * (1 - salted)) * (1 - D.storeSpoilCut * s.store);
  s.powder *= 1 - D.powderDamp;
  // births, the colony's temper, the men who slip away
  const births = s.fam * 0.07; s.fam += births * 0.5; s.lab += births * 0.5; s.born += births;
  if (plan.attend === 'colony') s.morale += D.m.attend;
  if (s.named.minister) s.morale += D.roles.minister;
  s.morale += (D.moraleRest - s.morale) * D.moralePull; s.morale = clamp(s.morale, 0, 100);
  if (s.morale < D.desertBelow) { const to = s.nations.find((n) => n.rel > 20); if (to) { lose(s, popOf(s) * D.desert); to.rel += 1; } }
  // after the governor too: a colony that turns on his successor did not outlast him
  if (s.morale < D.mutinyBelow && r.chance(D.mutiny)) return end(s, 'mutiny');
  // the governor's own life
  if (s.govAlive) {
    if (plan.attend === 'deputy') s.deputy = Math.min(1, s.deputy + D.deputyStep);
    if (s.deputy > 0 && r.chance(D.deputyDies)) s.deputy *= D.deputyHeir;
    const hz = (D.hazard(s.t) + (hungry ? D.hazardHunger : 0)) * (plan.attend === 'health' ? D.healthCut : 1);
    if (r.chance(hz * 2) || s.t + 1 >= D.life) {   // one roll a year
      s.govAlive = false; s.govDiedAt = s.t; s.laidDown = s.t + 1 >= D.life;
      s.favour = clamp(s.favour - D.successionFavour * (1 - s.deputy), 0, 100); s.morale -= D.successionMorale * (1 - s.deputy);
    }
  }
}

// ---- the turn -------------------------------------------------------------------------------
// What a policy may see. The same object a screen would be drawn from.
export function view(s) {
  return { t: s.t, year: yearOf(s), summer: s.t % 2 === 0, charter: s.charter, pop: popOf(s), hands: handsOf(s, false), lab: s.lab, craft: s.craft, sold: s.sold, gent: s.gent, fam: s.fam,
    food: s.food, powder: s.powder, iron: s.iron, salt: s.salt, goods: s.goods, cargo: s.cargo, walls: s.walls, fields: s.fields, store: s.store, mill: s.mill, range: s.range,
    morale: s.morale, favour: s.favour, landFree: s.landFree, shipHere: s.shipHere, used: s.used, deputy: s.deputy, govAlive: s.govAlive,
    wants: D.companyWants(yearOf(s), popOf(s)), flagWalls: Math.min(6, 1 + yearOf(s) / 3), hostile: hostile(s),
    defence: defenceOf(s), threat: Math.max(0, ...s.nations.filter((n) => n.rel < D.warBelow + 20).map(strengthOf)), wallDef: D.wallDef, foodPerHand: D.foodPerHand * D.fieldMult(s.fields), budget: D.budget[s.charter](s.favour), price: D.price[s.charter],
    watchNeed: Math.min(0.2, popOf(s) * D.watchCover / Math.max(1, handsOf(s, false))), cargoPerHand: D.cargoPerHand * (1 + s.range),
    feud: s.feud, pact: s.pact, drill: s.drill, force: forceOf(s), named: { ...s.named }, emptyPlaces: s.noNames ? 0 : ROLES.filter((k) => !s.named[k]).length, friendshipPrice: popOf(s) * D.friendshipPrice,
    nations: s.nations.map((n) => ({ id: n.id, rel: n.rel, grudge: n.grudge, guns: n.guns, corn: n.corn, pop: n.pop, home: homeOf(n), strength: strengthOf(n), allyMarch: allyMarchOf(s, n) })) };
}

// A turn is "live" when something is pressing: the proxy for claim 5 (docs/KILLGATE.md says
// what it does and does not show).
function pressing(s) {
  const pop = popOf(s);
  return { food: s.food < pop * 1.5, war: s.nations.some((n) => n.rel < D.warBelow + 15), land: pop > s.landFree - 5, backers: s.favour < 35, powder: s.powder < 6 + pop / 12 && !s.mill, temper: s.morale < 40, fever: !!s.sickNow };
}

export function step(s, policy, skill = 1, fallback = null) {
  // after the governor, the successor decides: well with probability `skill`, else like a careless man
  let pol = policy;
  if (!s.govAlive && fallback && !streamFor(s.seed, s.t, 'successor').chance(skill * D.successorBest)) pol = fallback;
  s.sickNow = false; s.loseN = 0;
  if (s.t % 2 === 0) {
    s.plan = s.plan || { share: false };
    shipSeason(s);
    if (popOf(s) < D.minPop) return end(s, 'starved');
    const plan = pol.summer(view(s)); s.plan = plan;
    summer(s, plan);
  } else {
    winter(s, pol.winter(view(s)));
    s.used = { ...s.usedNow }; s.usedNow = { powder: 0, iron: 0, salt: 0, goods: 0 };
    s.diedYear = s.diedNow; s.diedNow = 0;
  }
  s.morale = clamp(s.morale, 0, 100);
  const p = pressing(s); s.stats.live.push(Object.values(p).filter(Boolean).length);
  s.stats.peak = Math.max(s.stats.peak, popOf(s));
  s.stats.minNationPop = Math.min(s.stats.minNationPop, ...s.nations.map((n) => n.pop));
  s.t++;
  if (s.t === D.firstTen && !s.ended) s.stats.at20 = { pop: popOf(s), inOffice: s.govAlive, powder: s.powder, rel: s.nations.map((n) => n.rel) };
}

export function play(seed, opt) {
  const s = newColony(seed, opt);
  const until = opt.until ?? Infinity;
  while (!s.ended && s.t < until) {
    if (!s.govAlive && s.t >= s.govDiedAt + 1 + D.after) { end(s, 'stands'); break; }
    step(s, opt.policy, s.deputy, opt.fallback);
    if (s.ended && !s.govAlive && s.ended.why !== 'stands') s.ended.after = true;
  }
  return s;
}

/** The win: the colony stood ten years after the governor. */
export const won = (s) => s.ended?.why === 'stands';
/** What it became, for ranking runs on one seed: the living count, or how long it lasted. */
export const worth = (s) => (s.ended && s.ended.why !== 'stands' ? s.ended.t / 1000 : popOf(s) + s.born + (s.mill ? 20 : 0));
