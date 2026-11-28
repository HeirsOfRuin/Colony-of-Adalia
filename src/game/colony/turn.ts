// The colony's turn: half a year. Even turns are summer (the sailing season), odd turns winter.
// Pure apart from the state it is given: no DOM, no clock, no Math.random. Every draw comes from a
// stream named by (seed, turn, system).
//
// Ported 2026-11-28 from the kill-gate prototype (prototypes/killgate/model.js, round 4b), line
// for line in the same arithmetic order, so a seed plays the same life in both. The comments in
// brackets are the gate faults each rule fixed; docs/KILLGATE.md has their numbers.
import { N, ROLES, FACTIONS, type Faction } from './numbers';
import { streamFor, type Rng } from './rng';
import {
  allyMarchOf, budgetOf, byId, clamp, companyWants, defenceOf, feudOf, fieldCost, fieldMult, flagWallsOf, forceOf, handsOf, hazardOf,
  homeOf, hostile, hottest, knowOf, pairKey, patience, popOf, pressing, pushSettlersOf, role, sailsOf, shareOf, standingOf,
  strengthOf, tieGood, view, yearOf,
} from './derive';
import {
  ITEMS, KLASSES, type ColonyState, type Ended, type Governor, type Item, type Klass, type Load, type Nation, type NewColony,
  type SummerPlan, type WinterPlan,
} from './types';

// ---- a new colony ---------------------------------------------------------------------------
export function newColony(seed: number, opt: NewColony = {}): ColonyState {
  const r = streamFor(seed, 0, 'world');
  const background = opt.background ?? 'none';
  const bg = N.backgrounds[background];
  const s: ColonyState = {
    seed, t: 0, charter: opt.charter ?? 'company', onTime: !!opt.onTime, site: opt.site ?? null, background,
    ...N.start, cargo: 0, walls: 0, fields: 0, store: 0, mill: false, millWork: 0, buildWork: 0, range: 0, born: 0,
    landFree: N.landFree, strikes: 0, diedNow: 0, diedYear: 0, loseN: 0,
    nations: N.nations.map((n) => ({ id: n.id, near: n.near, truce: 0, beaten: 0, engaged: 0, pop0: n.pop, pop: n.pop, corn: n.pop * 0.6, rel: 0, base: r.range(n.base[0], n.base[1]), grudge: 0, guns: 0, cornK: n.corn, fever: 0, contact: false })),
    feuds: {}, feudNear0: 0, hostileNear0: 0, pact: null, pactKind: null, owed: 0, drill: 0, cover: 0,
    griev: Object.fromEntries(FACTIONS.map((f) => [f, N.griev.base])) as Record<Faction, number>, lastDemand: {}, budgetK: bg.budget ?? 1,
    named: Object.fromEntries(ROLES.map((k) => [k, !opt.noNames])) as ColonyState['named'], noNames: !!opt.noNames, namedSafe: !!opt.namedSafe,
    inbound: [], shipHere: false,
    used: { powder: 4, iron: 2, salt: 2, goods: 4 }, usedNow: { powder: 0, iron: 0, salt: 0, goods: 0 },
    plan: null, sickNow: false,
    govAlive: true, govDiedAt: null, laidDown: false, deputy: 0, ended: null,
    stats: { ships: 0, noShip: 0, lost: 0, starved: 0, killed: 0, feverDead: 0, nationFeverDead: 0, feverWaves: 0, nationWaves: 0, attacks: 0, breaches: 0, raids: 0, powderOut: 0,
      hungryWinters: 0, hungrySummers: 0, kegsHunted: 0, peak: 0, live: [], at20: null, minNationPop: Infinity, parleys: 0, truces: 0, incites: 0, incitesFound: 0, incitedFights: 0,
      mediations: 0, demands: 0, conceded: 0, mutinyBy: null, landTaken: 0, clientMarches: 0, standingAtDeath: null, firstAtDeath: false, standingEnd: null, griefPeak: 0,
      namedDead: 0, namedSent: 0, calls: 0, callsRefused: 0, expeditions: 0, carried: 0, routs: 0, feudFights: 0, pactYears: 0, bloody: 0, sailedHome: false },
  };
  // the site has its own stream: the same seed has the same feuds on every site
  const rs = streamFor(seed, 0, 'site');
  if (opt.site) N.sites[opt.site].forEach((range, i) => { const n = s.nations.filter((x) => x.near)[i]!; n.base = rs.range(range[0], range[1]); });
  for (const n of s.nations) n.rel = n.base;
  s.favour += bg.favour ?? 0; s.sold += bg.sold ?? 0; s.drill = bg.drill ?? 0; s.goods += bg.goods ?? 0;
  for (let i = 0; i < s.nations.length; i++) for (let j = i + 1; j < s.nations.length; j++) s.feuds[pairKey(s.nations[i]!, s.nations[j]!)] = r.range(N.feud[0], N.feud[1]);
  const near = s.nations.filter((n) => n.near);
  s.feudNear0 = feudOf(s, near[0]!, near[1]!); s.hostileNear0 = near.filter((n) => n.base < -15).length;
  // the settler ship that brought them goes home with the first letter
  s.shipHere = true;
  return s;
}

// ---- shared helpers -------------------------------------------------------------------------
function end(s: ColonyState, why: Ended['why']) { if (!s.ended) s.ended = { why, t: s.t }; }

/** Deaths fall across the classes in proportion; the named few die at the rate everyone does. */
function lose(s: ColonyState, n: number, key?: 'starved' | 'killed' | 'feverDead') {
  const p = popOf(s); if (p <= 0 || n <= 0) return 0;
  const k = Math.min(1, n / p);
  for (const c of ['lab', 'craft', 'sold', 'gent', 'fam'] as const) s[c] = Math.max(0, s[c] * (1 - k));
  if (key) s.stats[key] += n;
  s.diedNow += n / p;
  s.morale -= N.deathMorale * k;
  s.griev.lab += N.griev.lab.deaths * k; s.griev.fam += N.griev.fam.deaths * k;
  if (key === 'killed') s.griev.sold += N.griev.sold.killed * k;
  if (key === 'feverDead') s.griev.fam += N.griev.fam.fever;
  const rn = streamFor(s.seed, s.t, 'named' + (s.loseN++));
  if (!s.namedSafe) for (const q of ROLES) if (s.named[q] && rn.chance(Math.min(1, k * N.namedRisk))) { s.named[q] = false; s.stats.namedDead++; s.morale -= N.namedMorale; }
  return n;
}

function spend(s: ColonyState, item: 'powder' | 'iron' | 'salt' | 'goods', q: number) {
  const u = Math.min(s[item], Math.max(0, q)); s[item] -= u; s.usedNow[item] += u; return u;
}

// ---- the ship -------------------------------------------------------------------------------
function lading(s: ColonyState, letter: Load | null): Load {
  const price = N.price[s.charter], budget = budgetOf(s.charter, s.favour) * s.budgetK;
  let want: Load | null = letter;
  if (!want) { want = {}; for (const [k, share] of Object.entries(N.standard[s.charter])) want[k as Item] = (budget * share) / price[k as Item]; }
  let cost = 0; const out: Record<string, number> = {};
  for (const k of ITEMS) {            // the letter is filled in its own order until the money is gone
    const q = Math.max(0, want[k] || 0), c = Math.min(q * price[k], budget - cost);
    out[k] = c / price[k]; cost += c;
  }
  const lost = out.craft! * (1 - N.craftFound); out.craft! -= lost;   // "ask for carpenters and you get what the backers could find"
  const into = s.charter === 'crown' ? 'sold' : 'gent';
  out[into] = (out[into] || 0) + lost;
  const people = out.lab! + out.craft! + out.sold! + out.fam! + (out.gent || 0);
  out.gent = (out.gent || 0) + people * N.gentPerShip[s.charter];
  out.lab! += pushSettlersOf(s.charter, yearOf(s));
  if (s.charter === 'crown') out.food! += s.sold * N.crownVictuals;
  // Nobody sails to a graveyard. (Round 1, sixth run: a fixed 60% on food starved 369 a life and
  // still won, because the dead were replaced free.)
  const willing = 1 - Math.min(N.graveyardMax, N.graveyard * s.diedYear);
  for (const c of ['lab', 'craft', 'sold', 'fam', 'gent']) out[c]! *= willing;
  return out;
}

function shipSeason(s: ColonyState) {
  const r = streamFor(s.seed, s.t, 'ship');
  // A new route loses ships and lands them short; a slow court is another matter. Perfect ships:
  // one a year, whole, in season.
  const route = 1 + N.newRoute * Math.max(0, 1 - yearOf(s) / N.routeYears);
  const f = N.fate[s.charter];
  const fate = s.onTime ? { late: 0, short: 0, lost: 0 } : { late: f.late, short: f.short * route, lost: f.lost * route };
  let landed: Record<string, number> | null = null;
  for (const b of s.inbound.filter((x) => x.due <= s.t)) {
    s.inbound.splice(s.inbound.indexOf(b), 1);
    const x = r.next();
    if (x < fate.lost) { s.stats.lost++; continue; }
    if (x < fate.lost + fate.late && !b.late) { b.late = true; b.due = s.t + 2; s.inbound.push(b); continue; }
    const k = x < fate.lost + fate.late + fate.short ? 0.5 : 1;
    landed = landed || {}; for (const [i, q] of Object.entries(b.load)) landed[i] = (landed[i] || 0) + q! * k;
  }
  s.shipHere = !!landed || s.t === 0;
  if (!landed) { if (s.t > 0) { s.stats.noShip++; s.morale += N.m.noShip; } return; }
  s.stats.ships++; s.morale += N.m.ship;
  for (const i of ['powder', 'iron', 'salt', 'goods', 'food'] as const) s[i] += landed[i] || 0;
  for (const c of ['lab', 'craft', 'sold', 'fam', 'gent'] as const) s[c] += (landed[c] || 0) * (1 - N.seasoning);
  // the men asked for by trade: the backers find one in two, and he fills an empty place
  for (let i = 0; i < (s.noNames ? 0 : Math.round(landed.spec || 0)); i++) {
    const empty = ROLES.filter((k) => !s.named[k]);
    if (empty.length && r.chance(N.specFound)) { s.named[r.pick(empty)!] = true; s.stats.namedSent++; s.lab += 1; }
  }
  // the ship's fever, and whether it crosses to the nations
  if (r.chance(N.shipFever)) {
    const asked = !!s.plan?.share && s.nations.some((n) => n.rel >= N.healerAbove);
    const d = r.float(N.shipFeverDeath[0], N.shipFeverDeath[1]) * (asked ? N.nurseCut : 1) * role(s, 'surgeon');
    lose(s, popOf(s) * d, 'feverDead'); s.stats.feverWaves++; s.morale += N.m.fever; s.sickNow = true;
    for (const n of s.nations) if (r.chance((n.contact ? N.crossOver : N.crossOverNoContact) * (n.near ? 1 : 0.6))) n.fever = 1;
  }
}

// Every summer the backers decide on next year's ship. A ship that is here takes them the cargo and
// the letter; with no ship they have neither, load what they think fit, and a company counts the
// year as a loss. (Round 1, first run: they decided only when a ship called, so one missed ship
// meant no ship ever again: 2.5 landings a life.)
function backers(s: ColonyState, letterIn: Load) {
  const r = streamFor(s.seed, s.t, 'backers');
  let letter: Load | null = letterIn;
  const year = yearOf(s), sent = s.shipHere ? s.cargo : 0; if (s.shipHere) s.cargo = 0; else letter = null;
  const want = companyWants(year, popOf(s));
  const verdict = clamp(N.companySwing * (sent / Math.max(1, want) - 1), -N.companySwing, N.companySwing);
  if (s.charter === 'company') {
    s.favour += (!s.shipHere ? N.companyNoShip : verdict) * patience(year);
  } else {
    const flag = s.walls >= flagWallsOf(year) - 1e-9 && s.sold >= 6 ? N.flagBonus : -N.flagBonus;
    s.favour += r.normal(N.courtDrift, N.courtSd) + (flag + N.crownCargoWeight * verdict) * patience(year);
  }
  s.favour = clamp(s.favour, 0, 100);
  s.strikes = s.favour < N.recallBelow ? s.strikes + 1 : 0;
  if (s.strikes >= N.recallStrikes && s.govAlive) return end(s, 'recalled');
  if (s.onTime || r.chance(sailsOf(s.charter, s.favour))) s.inbound.push({ due: s.t + 2, load: lading(s, letter) });
}

// ---- summer ---------------------------------------------------------------------------------
function summer(s: ColonyState, plan: SummerPlan) {
  const w = streamFor(s.seed, yearOf(s), 'weather').normal(1, 0.2);   // one sky for everyone
  const r = streamFor(s.seed, s.t, 'summer');
  const press = !!plan.press; if (press) { s.morale += N.m.press; s.griev.gent += N.griev.gent.press; }
  // The summer is eaten out of the store before the harvest is in. (Round 1, third run: the colony
  // only ate in winter, so every colony needed half the food the design says.)
  const eat = popOf(s);
  if (s.food < eat) { lose(s, (eat - s.food) * N.summerDeathShare, 'starved'); s.food = 0; s.morale += N.m.starve / 2; s.stats.hungrySummers++; if (popOf(s) < N.minPop) return end(s, 'starved'); }
  else s.food -= eat;
  let hands = handsOf(s, press);
  // nursing the neighbours' sick costs hands; refusing costs more, later
  for (const n of s.nations) if (n.fever) {
    s.stats.nationWaves++;
    let d = r.float(N.nationFeverDeath[0], N.nationFeverDeath[1]);
    if (plan.share) { d *= N.nurseCut; hands *= 1 - N.nurseHands; n.rel += N.nurseTie; n.grudge = Math.max(0, n.grudge + N.nurseGrudge); }
    else if (n.rel > 0) { n.rel += N.refuseTie; n.grudge += N.refuseGrudge; }
    const dead = n.pop * d; n.pop -= dead; s.stats.nationFeverDead += dead; n.fever = 0;
  }
  const ironNeed = hands * N.ironUsePerHand * role(s, 'smith'), iron = spend(s, 'iron', ironNeed);
  const tools = 1 - N.ironShortPenalty * (1 - (ironNeed ? iron / ironNeed : 1));
  const sp = plan.split, tot = (sp.food + sp.walls + sp.cargo + sp.build + sp.range + (sp.watch || 0)) || 1;
  if ((sp.walls + (sp.watch || 0)) / tot > 0.35) s.griev.lab += N.griev.lab.overwork;   // digging and standing guard, not their own plots
  const h = (k: keyof typeof sp) => hands * (sp[k] || 0) / tot;
  // the watch: men under arms keep the field hands safe from a hostile neighbour, and drill
  s.cover = Math.min(1, h('watch') / Math.max(1, popOf(s) * N.watchCover));
  s.drill = Math.min(1, s.drill * (1 - N.drillDecay) + N.drillRate * h('watch') / Math.max(1, popOf(s)));
  const out = hostile(s) ? 1 - N.harassPenalty * (1 - s.cover) : 1;
  if (hostile(s) && s.cover < 1) lose(s, r.range(0, N.watchDeaths) * (1 - s.cover), 'killed');   // men picked off at the plough
  const craftK = (1 + 2 * s.craft / Math.max(1, popOf(s))) * role(s, 'carpenter');

  s.food += h('food') * N.foodPerHand * fieldMult(s.fields) * knowOf(s) * w * tools * out * role(s, 'husbandman');
  s.walls = Math.min(N.wallMax, s.walls * (1 - N.wallDecay) + h('walls') * N.wallPerHand * tools * craftK);
  s.cargo += h('cargo') * N.cargoPerHand * (1 + s.range) * tools * out * role(s, 'factor');
  s.range = Math.min(1, s.range + h('range') * N.rangePerHand);
  const bp = h('build') * tools * craftK;
  if (plan.build === 'mill' && !s.mill && s.craft >= N.millCraft) { s.millWork += bp; if (s.millWork >= N.millCost) s.mill = true; }
  else if (plan.build === 'store' && s.store < N.storeMax) { s.buildWork += bp; if (s.buildWork >= N.storeCost) { s.buildWork -= N.storeCost; s.store++; } }
  else { s.buildWork += bp; while (s.fields < 10 && s.buildWork >= fieldCost(s.fields)) { s.buildWork -= fieldCost(s.fields); s.fields++; } }
  if (s.mill) s.powder += N.millKegs / 2;

  neighbours(s, plan, w, r);
  const e = plan.envoy;
  if (e?.kind === 'parley') parley(s, byId(s, e.a), r);
  else if (e?.kind === 'incite') incite(s, byId(s, e.a), byId(s, e.b), r, e.pay);
  else if (e?.kind === 'mediate') mediate(s, byId(s, e.a), byId(s, e.b));
  client(s);
  politics(s, plan, r);
  if (plan.expedition) expedition(s, byId(s, plan.expedition), r);
  if (s.ended) return;
  // the ship sails: abandonment, then the cargo and the letter. After a starving year the next ship
  // may take them home (Jamestown, 1610); not once the place is home.
  if (s.shipHere && s.t > 0 && s.morale < N.abandonBelow && s.food < popOf(s) * 0.5) return end(s, 'abandoned');
  if (s.shipHere && s.t > 0 && r.chance(Math.min(0.9, N.abandonDied * Math.max(0, s.diedYear - N.hardYear) * Math.max(0, 1 - yearOf(s) / N.homeBy)))) { s.stats.sailedHome = true; return end(s, 'abandoned'); }
  backers(s, plan.letter);
}

// the neighbours: their harvest, the governor's dealings, the land, and their answer
function neighbours(s: ColonyState, plan: SummerPlan, w: number, r: Rng) {
  const trading = Math.max(1, s.nations.filter((n) => ['trade', 'ally'].includes(plan.stance[n.id] ?? 'ignore') && n.rel >= N.tradeAbove).length);
  for (const n of s.nations) {
    n.truce = Math.max(0, n.truce - 2); n.beaten = Math.max(0, n.beaten - 2);
    n.corn = Math.max(0, n.corn * 0.6 + n.pop * 2 * (n.cornK * w - 1) + n.pop * 0.25);
    n.pop *= 1.006;
    let st = plan.stance[n.id] || 'ignore';
    const others = s.nations.filter((o) => o !== n), before = n.rel;
    if (st === 'ally') {             // a pact: asked for where the tie is good enough, kept by trading
      if (!s.pact && n.rel >= N.pactAbove) { s.pact = n.id; s.pactKind = plan.pactKind || 'equal'; s.owed = 0; }
      st = 'trade';
    }
    if (st === 'trade' && n.rel < N.tradeAbove) st = 'gift';   // they will not trade with people they do not trust; a gift is how it starts
    n.contact = st !== 'ignore';
    if (st === 'trade') {
      const g = spend(s, 'goods', Math.min(s.goods, plan.tradeGoods ?? 4));
      s.cargo += g * N.furPerGood * (1 + s.range) * (n.near ? 1 : N.far.furs) * (1 + N.tieFurs * tieGood(n));   // the furs are inland; friends bring the best
      if (g >= popOf(s) * N.friendshipPrice / trading - 1e-9) n.rel += N.tradeTie + (s.named.interpreter ? N.roles.interpreter : 0);   // the year's price, shared among those traded with
      const landCost = N.landCost * (1 - N.tieLand * tieGood(n));
      if (plan.buyLand && n.near && popOf(s) > s.landFree - 10 && n.rel > 0 && s.goods >= landCost) { spend(s, 'goods', landCost); s.landFree += N.landPerDeal; }
      const kegs = spend(s, 'powder', plan.sellPowder?.[n.id] || 0);
      if (kegs > 0) { n.guns += kegs; n.rel += kegs * N.powderTie; s.food += Math.min(n.corn, kegs * N.powderFood); n.corn = Math.max(0, n.corn - kegs * N.powderFood); for (const o of others) o.rel -= kegs * N.rivalSpite * feudOf(s, n, o) / 50; }
      if (r.chance(N.tradeFever)) {   // a fever comes back with the trading season
        const d = r.float(N.colonyFeverDeath[0], N.colonyFeverDeath[1]) * (plan.share && n.rel >= N.healerAbove ? N.nurseCut : 1) * role(s, 'surgeon');
        if (plan.share && n.rel >= N.healerAbove) n.rel += N.healerTie;
        lose(s, popOf(s) * d, 'feverDead'); s.stats.feverWaves++; s.morale += N.m.fever; s.sickNow = true;
      }
    } else if (st === 'gift') { if (spend(s, 'goods', N.giftCost) >= N.giftCost - 1e-9) n.rel += N.giftTie; }
    else if (st === 'raid') {
      spend(s, 'powder', N.raidKegs); s.stats.raids++;
      const take = Math.min(n.corn * N.raidShare, N.raidMax) * (s.powder > 0 ? 1 : 0.5);
      s.food += take; n.corn -= take; n.rel += N.raidTie; n.grudge += N.raidGrudge; lose(s, r.range(0, 4), 'killed');
      for (const o of others) if (feudOf(s, n, o) > N.fightAbove) o.rel += N.raidRivalTie;   // his enemy's enemy
    }
    // taking a side: what is gained with one is lost with his enemies, as hot as their feud is
    if (n.rel > before) for (const o of others) o.rel -= (n.rel - before) * N.sideCost * feudOf(s, n, o) / 100;
    if (n.near || popOf(s) > s.landFree * 1.5) n.rel -= Math.max(0, popOf(s) - s.landFree) * N.landPressure * (n.near ? N.nearLand : N.far.land);
    n.grudge *= 1 - N.grudgeDecay;
    n.rel += ((n.base - n.grudge) - n.rel) * N.drift;
    n.rel = clamp(n.rel, -100, 100 - n.grudge);
  }
}

// ---- politics between the nations -------------------------------------------------------------
// Each pair has a feud. When it is hot they fight; an ally calls the colony out; a friend who
// wins too well names his price. (Round 3: with six feuds and nothing to end them, one nation was
// fought down to 8 people. A fight cools the feud, and a people at half strength makes peace.)
function politics(s: ColonyState, plan: SummerPlan, r: Rng) {
  let ally = byId(s, s.pact);
  if (ally && ally.rel < N.pactBreaks) { s.pact = null; s.pactKind = null; s.owed = 0; ally = undefined; }
  if (s.pact) s.stats.pactYears++;
  let called = false;
  for (let i = 0; i < s.nations.length; i++) for (let j = i + 1; j < s.nations.length; j++) {
    const a = s.nations[i]!, b = s.nations[j]!, key = pairKey(a, b);
    s.feuds[key] = clamp(s.feuds[key]! + r.normal(0, N.feudSd), 0, 100);
    if (!(s.feuds[key]! > N.fightAbove && r.chance(N.fightChance)) || a.pop < a.pop0 * N.suesBelow || b.pop < b.pop0 * N.suesBelow) continue;
    s.stats.feudFights++; s.feuds[key]! -= N.fightCools; a.engaged = b.engaged = N.engagedTurns;
    let [x, y] = homeOf(a) >= homeOf(b) ? [a, b] : [b, a];   // the stronger, the weaker
    // An ally in the fight calls the colony out, once a summer. Answered, he has the better of it
    // whatever the odds; refused, the worse, and he remembers who stayed home.
    ally = byId(s, s.pact);
    if (ally && (a === ally || b === ally) && !called) {
      called = true; s.stats.calls++;
      const rival = a === ally ? b : a;
      if (s.pactKind === 'client') {
        // a client's call is answered with powder, not men: his war is the colony's errand
        [x, y] = [ally, rival]; spend(s, 'powder', N.callKegs); ally.guns += N.callKegs; rival.rel += N.callRivalTie / 2;
      } else if (plan.answerCall !== false) {
        [x, y] = [ally, rival];
        spend(s, 'powder', N.callKegs); lose(s, r.range(0, 3), 'killed');
        rival.rel += N.callRivalTie; rival.grudge += N.callRivalGrudge; ally.rel += N.callTie; s.owed += 1;
        const q = Math.min(rival.corn * 0.15, N.callPlunder); rival.corn -= q; s.food += q;
      } else { [x, y] = [rival, ally]; s.stats.callsRefused++; ally.rel += N.refuseCall; s.pact = null; }
    }
    y.pop *= 1 - N.fightLoss; x.pop *= 1 - N.fightLoss / 2;
    if (x.guns > y.guns + 10) { y.rel -= 8; y.grudge += 4; }   // the loser knows who sold the guns
  }
  ally = byId(s, s.pact);
  const foes = ally ? s.nations.filter((o) => o !== ally && feudOf(s, ally!, o) > N.feudCares) : [];
  if (ally && s.pactKind !== 'client' && foes.length && ally.pop > N.hegemon * Math.min(...foes.map((o) => o.pop))) {   // the friend who no longer needs you
    if (plan.payTribute !== false && s.goods >= N.tribute) spend(s, 'goods', N.tribute); else ally.rel += N.tributeRefused;
  }
  for (const n of s.nations) n.rel = clamp(n.rel, -100, 100 - n.grudge);
}

// ---- the envoy: one errand a summer ------------------------------------------------------------
// Parley: goods for a truce. A nation lately beaten listens; one with a long grudge does not.
function parley(s: ColonyState, n: Nation | undefined, r: Rng) {
  if (!n || n.rel >= N.warBelow + 10 || n.truce > 0 || s.goods < N.parleyGoods) return;
  spend(s, 'goods', N.parleyGoods); s.stats.parleys++; n.contact = true;
  // a good word from a nation he trusts helps: the best tie among his friends
  const word = Math.max(0, ...s.nations.filter((o) => o !== n && feudOf(s, n, o) < N.feudCares).map(tieGood));
  const p = clamp(N.parleyBase + (n.beaten > 0 ? N.parleyBeaten : 0) + (s.named.interpreter ? N.parleyInterpreter : 0) + N.tieParley * word - n.grudge / 100, 0.05, 0.9);
  if (r.chance(p)) { s.stats.truces++; n.rel = Math.max(n.rel, N.parleyTo); n.truce = N.truceTurns; n.beaten = 0; }
}
// Incite: gifts and tales to one nation about another, paid in goods or in powder. A tale well told
// sets the fight going this summer. Found out, both remember. (Round 4, first try: the envoy waited
// for goods a hostile-shore colony never has.)
function incite(s: ColonyState, a: Nation | undefined, b: Nation | undefined, r: Rng, pay: 'goods' | 'powder') {
  if (!a || !b || a === b || a.rel < N.inciteAbove) return;
  if (pay === 'powder' ? s.powder < N.inciteKegs : s.goods < N.inciteGoods) return;
  if (pay === 'powder') { a.guns += spend(s, 'powder', N.inciteKegs); } else spend(s, 'goods', N.inciteGoods);
  s.stats.incites++; a.contact = true; a.rel += N.giftTie;   // it comes as a gift
  const key = pairKey(a, b);
  s.feuds[key] = clamp(feudOf(s, a, b) + N.inciteHeat * (0.5 + N.tieIncite * tieGood(a)), 0, 100);
  if (r.chance(s.feuds[key]! / 100) && !(a.engaged > 0 && b.engaged > 0)) {   // they go at each other now
    s.stats.feudFights++; s.stats.incitedFights++; s.feuds[key]! -= N.fightCools;
    a.engaged = b.engaged = N.engagedTurns; const [x, y] = homeOf(a) >= homeOf(b) ? [a, b] : [b, a]; y.pop *= 1 - N.fightLoss; x.pop *= 1 - N.fightLoss / 2;
  }
  if (r.chance(clamp(N.inciteFound - (s.named.interpreter ? 0.06 : 0) + 0.2 * tieGood(b), 0.02, 0.6))) {
    s.stats.incitesFound++; b.rel += N.inciteFoundTie; b.grudge += N.inciteFoundGrudge; a.rel += N.inciteUsed;
  }
}
// Mediate: cool a feud between two nations that both like the colony; both credit it.
function mediate(s: ColonyState, a: Nation | undefined, b: Nation | undefined) {
  if (!a || !b || a === b || a.rel < 0 || b.rel < 0 || s.goods < N.mediateGoods) return;
  spend(s, 'goods', N.mediateGoods); s.stats.mediations++;
  s.feuds[pairKey(a, b)] = clamp(feudOf(s, a, b) - N.mediateCool, 0, 100);
  a.rel += N.mediateTie; b.rel += N.mediateTie;
}
// A client is armed and pointed. He takes the colony's powder and its enemies, and resents both.
function client(s: ColonyState) {
  if (s.pactKind !== 'client') return;
  const a = byId(s, s.pact); if (!a) return;
  a.guns += spend(s, 'powder', N.clientKegs);
  a.rel -= N.clientResent;
  for (const n of s.nations) if (n !== a && n.rel < -15) s.feuds[pairKey(a, n)] = clamp(feudOf(s, a, n) + N.clientHeat, 0, 100);
}

// ---- the one fight the governor starts ----------------------------------------------------------
// Force against what the town can put up at home; the roll moves the ratio by a fifth, it does not
// decide what beats what.
function expedition(s: ColonyState, n: Nation | undefined, r: Rng) {
  if (!n || n.rel >= N.warBelow) return;
  s.stats.expeditions++;
  const kegs = spend(s, 'powder', N.expeditionKegs), ratio = (forceOf(s, kegs / N.expeditionKegs) + allyMarchOf(s, n)) / Math.max(1, homeOf(n) * r.float(0.8, 1.2));
  if (ratio >= N.carried) {
    s.stats.carried++; lose(s, r.range(0, 3), 'killed'); n.pop *= 1 - N.carriedPop;
    if (s.pact && allyMarchOf(s, n) > 0) {
      const a = byId(s, s.pact)!;
      if (s.pactKind === 'client') {   // he marched in front: his dead, the colony's land
        s.stats.clientMarches++; a.pop *= 1 - N.clientLoss; a.grudge += N.clientWarriorGrudge;
        if (n.near) { s.landFree += N.takeLand; s.stats.landTaken += N.takeLand; }
      } else if (s.owed >= 1) s.owed -= 1;
    }
    const q = Math.min(n.corn, N.carriedCorn); n.corn -= q; s.food += q;
    n.grudge += N.carriedGrudge; n.rel = Math.max(n.rel, N.warBelow + 15); n.beaten = N.beatenTurns; s.morale += N.m.repulse; s.favour += N.expeditionFavour[s.charter];
  } else if (ratio >= N.standOff) { lose(s, r.range(1, 4), 'killed'); n.rel += 5; n.grudge += N.carriedGrudge / 2; }
  else { s.stats.routs++; lose(s, forceOf(s) * N.routShare, 'killed'); n.rel -= 10; s.morale += N.m.breach; }
  if (popOf(s) < N.minPop) end(s, 'overrun');
}

// ---- war: a nation that has turned comes in the dead of winter ----------------------------------
// After the hunting is done and months before any ship. (Round 1, fifth run: attacks came in summer,
// behind the ship, so a magazine emptied on deer was always full again before it was needed.)
function war(s: ColonyState, r: Rng) {
  for (const n of s.nations) {
    const busy = n.engaged > 0 ? N.busyFight : 1, cowed = n.beaten > 0 ? N.beatenHeat : 1;
    const pact = byId(s, s.pact);
    // a partisan is his ally's enemies' target; a neutral is left alone while the nations are busy with each other
    const heat = busy * cowed * (pact ? (n.id !== s.pact && feudOf(s, pact, n) > N.feudCares ? N.pactTarget : 1) : 1 - hottest(s, n) / N.busyDiv) * (n.near ? 1 : N.far.attack);
    if (n.truce > 0 || n.rel >= N.warBelow || !r.chance(Math.min(N.attackMax, (N.attackBase + N.attackSlope * (N.warBelow - n.rel)) * heat))) continue;
    s.stats.attacks++;
    const S = strengthOf(n) * r.float(0.7, 1.3);
    const kegsNeed = S * N.kegsPerAttack, kegs = spend(s, 'powder', kegsNeed), armed = kegsNeed ? kegs / kegsNeed : 1;
    if (kegs < kegsNeed) s.stats.powderOut++;
    // the ally behind the wall; and any friend sends a few, as many as the tie is good (support)
    const ally = s.nations.filter((o) => o !== n && (o.id === s.pact || o.rel > N.supportAbove)).reduce((q, o) => q + o.pop * N.warriorShare * (o.id === s.pact ? N.pactHelp : N.supportHelp * tieGood(o)), 0);
    const Dv = defenceOf(s, armed) + ally;
    if (Dv >= S) {
      lose(s, r.range(0, 3), 'killed'); n.pop *= 0.97; n.rel += 6; s.morale += N.m.repulse; n.beaten = N.beatenTurns; s.griev.sold += N.griev.sold.repulse;
      if (Dv >= S * N.bloodyRepulse) { s.stats.bloody++; s.favour += N.repulseFavour[s.charter]; n.pop *= 1 - N.repulseLoss; for (const o of s.nations) if (o !== n) o.rel += N.respect; }   // heard of up and down the coast
    } else { const k = (S - Dv) / S; lose(s, popOf(s) * k * N.breachPop, 'killed'); s.food *= 1 - k * N.breachFood; s.walls = Math.max(0, s.walls - 1); s.stats.breaches++; s.morale += N.m.breach; n.rel += 12; s.griev.fam += N.griev.fam.breach; }
    if (kegs < kegsNeed) s.griev.sold += N.griev.sold.noPowder;
    if (popOf(s) < N.minPop) return end(s, 'overrun');
  }
}

// ---- the colony's factions --------------------------------------------------------------------
// Each has a grievance that rises from what happens to it and settles slowly. The governor has one
// lever a winter: whom he hears. A faction past the demand line asks for something and is answered;
// a large faction past the mutiny line may rise. (Rounds 1 to 3: morale was one number and mutiny
// the commonest end. The author: "real threats, but not to the point of micromanagement".)
function factions(s: ColonyState, plan: WinterPlan, r: Rng) {
  const g = s.griev, G = N.griev;
  if (popOf(s) > s.landFree) g.lab += G.lab.landless;
  if (s.favour < 35) g.gent += G.gent.noProfit;
  g.gent += G.gent.idle;
  if (s.goods < 2) g.sold += G.sold.unpaid;
  if (s.named.minister) g.fam += G.fam.minister;
  // a demand comes first, from the most aggrieved faction that has people enough to make one; then
  // the winter's hearing. (Round 4: the other way round, hearing pre-empted every demand and
  // granting one was decoration: 2 seeds in 60.)
  const f = [...FACTIONS].filter((x) => s[x] >= 3).sort((a, b) => g[b] - g[a])[0];
  if (f && g[f] >= N.demandAt && !(s.t - (s.lastDemand[f] ?? -99) < N.demandEvery)) {
    s.lastDemand[f] = s.t; s.stats.demands++;
    const c = N.concede[f], landK = c.land || 0;
    const can = (c.goods || 0) <= s.goods && (c.powder || 0) <= s.powder && (!landK || s.landFree - landK >= popOf(s) * 0.8);
    if (plan.concede?.[f] && can) { spend(s, 'goods', c.goods || 0); spend(s, 'powder', c.powder || 0); s.landFree -= landK; g[f] += G[f].granted; s.stats.conceded++; }
    else g[f] += N.refused;
    g[f] = clamp(g[f], 0, 100);
  }
  const heard = plan.attend.startsWith('faction:') ? plan.attend.slice(8) : null;
  for (const x of FACTIONS) {
    if (heard === x) g[x] -= N.heard;
    else if (plan.attend === 'colony') g[x] -= N.heardAll;
    g[x] += (G.base - g[x]) * G.decay;
    g[x] = clamp(g[x], 0, 100);
  }
  s.stats.griefPeak = Math.max(s.stats.griefPeak, ...FACTIONS.map((x) => g[x]));
  for (const x of FACTIONS) {
    if (g[x] < N.mutinyAt || shareOf(s, x) < N.mutinyWeight) continue;
    if (r.chance(N.mutinyChance * (g[x] - N.mutinyAt) / (100 - N.mutinyAt))) { s.stats.mutinyBy = x; return end(s, 'mutiny'); }
  }
}

// ---- winter ---------------------------------------------------------------------------------
function winter(s: ColonyState, plan: WinterPlan) {
  const r = streamFor(s.seed, s.t, 'winter');
  const pop = popOf(s);
  const kegs = spend(s, 'powder', Math.min(plan.hunt || 0, pop * N.huntKegsPerHead));
  s.food += kegs * N.huntFoodPerKeg * (1 + 0.5 * s.range); s.stats.kegsHunted += kegs;
  for (const n of s.nations) {       // corn bought, where there is corn and they will sell
    if (!(plan.buyCorn > 0) || n.rel <= -10 || s.goods <= 0) continue;
    const price = N.cornPrice / (1 + Math.max(0, n.rel) / 100) * (n.id === s.pact ? N.pactCorn : 1) * (s.named.interpreter ? 0.85 : 1);
    const q = Math.min(plan.buyCorn, n.corn * N.cornSold, s.goods / price); spend(s, 'goods', q * price); s.food += q; n.corn -= q; plan.buyCorn -= q; n.contact = true;
  }
  war(s, r); if (s.ended) return;
  const ration = plan.ration === 'short' ? N.shortRation : 1; const need = popOf(s) * ration;
  // a friend sends corn in a hungry winter, as much as the tie is good (support)
  if (s.food < need) for (const n of s.nations) if (n.rel > N.supportAbove) { const q = Math.min(need - s.food, n.corn * N.supportCorn * tieGood(n) * 2); s.food += q; n.corn -= q; n.rel -= 2; }
  if (plan.ration === 'short') { s.morale += N.m.short; lose(s, pop * N.shortRationDeath, 'starved'); s.griev.lab += N.griev.lab.short; }
  let hungry = false;
  if (s.food < need) { hungry = true; lose(s, (need - s.food) * N.starveDeathShare, 'starved'); s.food = 0; s.morale += N.m.starve; s.stats.hungryWinters++; s.griev.lab += N.griev.lab.hunger; }
  else s.food -= need;
  if (popOf(s) < N.minPop) return end(s, 'starved');
  const saltNeed = s.food * N.saltPerFood, salt = spend(s, 'salt', saltNeed), salted = saltNeed ? salt / saltNeed : 1;
  s.food *= 1 - (N.spoilSalted * salted + N.spoil * (1 - salted)) * (1 - N.storeSpoilCut * s.store);
  s.powder *= 1 - N.powderDamp;
  // births, the colony's temper, the men who slip away
  const births = s.fam * 0.07; s.fam += births * 0.5; s.lab += births * 0.5; s.born += births;
  if (plan.attend === 'colony') s.morale += N.m.attend;
  if (s.named.minister) s.morale += N.roles.minister;
  factions(s, plan, r); if (s.ended) return;
  s.morale += (N.moraleRest - s.morale) * N.moralePull; s.morale = clamp(s.morale, 0, 100);
  if (s.morale < N.desertBelow) { const to = s.nations.find((n) => n.rel > 20); if (to) { lose(s, popOf(s) * N.desert); to.rel += 1; } }
  // the governor's own life
  if (s.govAlive) {
    if (plan.attend === 'deputy') s.deputy = Math.min(1, s.deputy + N.deputyStep);
    if (s.deputy > 0 && r.chance(N.deputyDies)) s.deputy *= N.deputyHeir;
    const hz = (hazardOf(s.t) + (hungry ? N.hazardHunger : 0)) * (plan.attend === 'health' ? N.healthCut : 1);
    if (r.chance(hz * 2) || s.t + 1 >= N.life) {   // one roll a year
      s.govAlive = false; s.govDiedAt = s.t; s.laidDown = s.t + 1 >= N.life;
      s.favour = clamp(s.favour - N.successionFavour * (1 - s.deputy), 0, 100); s.morale -= N.successionMorale * (1 - s.deputy);
      for (const x of FACTIONS) s.griev[x] += N.successionMorale * (1 - s.deputy);   // an untried successor is everyone's chance
      s.stats.standingAtDeath = standingOf(s); s.stats.firstAtDeath = standingOf(s) >= 1;
    }
  }
}

// ---- the turn -------------------------------------------------------------------------------
/**
 * One half-year. After the governor's death the successor decides as `governor` with probability
 * `skill` (his deputy's training) times N.successorBest, and as `fallback` otherwise.
 */
export function step(s: ColonyState, governor: Governor, skill = 1, fallback: Governor | null = null): void {
  let gov = governor;
  if (!s.govAlive && fallback && !streamFor(s.seed, s.t, 'successor').chance(skill * N.successorBest)) gov = fallback;
  s.sickNow = false; s.loseN = 0;
  if (s.t % 2 === 0) {
    s.plan = s.plan || { share: false };
    shipSeason(s);
    if (popOf(s) < N.minPop) return end(s, 'starved');   // the clock does not move: the colony is gone
    const plan = gov.summer(view(s)); s.plan = plan;
    summer(s, plan);
  } else {
    winter(s, gov.winter(view(s)));
    s.used = { ...s.usedNow }; s.usedNow = { powder: 0, iron: 0, salt: 0, goods: 0 };
    s.diedYear = s.diedNow; s.diedNow = 0;
  }
  s.morale = clamp(s.morale, 0, 100);
  for (const n of s.nations) n.engaged = Math.max(0, (n.engaged || 0) - 1);
  const p = pressing(s); s.stats.live.push(Object.values(p).filter(Boolean).length);
  s.stats.peak = Math.max(s.stats.peak, popOf(s));
  for (const x of FACTIONS) s.griev[x] = clamp(s.griev[x], 0, 100);
  s.stats.minNationPop = Math.min(s.stats.minNationPop, ...s.nations.map((n) => n.pop));
  s.t++;
  if (s.ended) s.stats.standingEnd = standingOf(s);
  if (s.t === N.firstTen && !s.ended) s.stats.at20 = { pop: popOf(s), inOffice: s.govAlive, powder: s.powder, rel: s.nations.map((n) => n.rel) };
}

/** Has the colony outlasted its governor by the ten years the win asks? */
export function standsNow(s: ColonyState) { return !s.ended && !s.govAlive && s.t >= s.govDiedAt! + 1 + N.after; }

export interface PlayOptions extends NewColony { governor: Governor; fallback?: Governor | null; until?: number }

/** A whole life and the ten years after, under one governor (a bot, in the gate). */
export function play(seed: number, opt: PlayOptions): ColonyState {
  const s = newColony(seed, opt);
  const until = opt.until ?? Infinity;
  while (!s.ended && s.t < until) {
    if (standsNow(s)) { end(s, 'stands'); s.stats.standingEnd = standingOf(s); break; }
    step(s, opt.governor, s.deputy, opt.fallback ?? null);
    const e = s.ended as Ended | null;   // step may have ended it
    if (e && !s.govAlive && e.why !== 'stands') e.after = true;
  }
  return s;
}

export type { Klass, Load };
export { KLASSES };
