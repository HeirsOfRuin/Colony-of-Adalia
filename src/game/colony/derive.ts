// Every number a screen shows and the turn resolves with, derived in one place (game-building
// rule 1: one derivation per number). The fight is resolved with defenceOf and strengthOf, and
// the muster screen will show defenceOf and strengthOf; never a second formula.
//
// The arithmetic is written in the kill-gate prototype's order (prototypes/killgate/model.js,
// round 4b), so the port gives the same floating-point results; tests/colony.test.ts holds the
// fingerprint that proves it.
import { N, ROLES, FACTIONS, type Charter, type Faction, type Role } from './numbers';
import { streamFor } from './rng';
import type { ColonyState, Nation, View } from './types';

export const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// ---- the formulas the YAML writes as numbers -------------------------------------------------
export const fieldMult = (lvl: number) => N.fieldMult.base + N.fieldMult.perLevel * lvl;
export const fieldCost = (lvl: number) => N.fieldCost.base + N.fieldCost.perLevel * lvl;
export const budgetOf = (charter: Charter, favour: number) => N.budget[charter].base + N.budget[charter].perFavour * favour;
export const sailsOf = (charter: Charter, favour: number) => Math.min(N.sails[charter].cap, N.sails[charter].base + N.sails[charter].perFavour * favour);
export const pushSettlersOf = (charter: Charter, year: number) => {
  const p = N.pushSettlers[charter];
  return p && year >= p.fromYear ? p.base + p.perYear * year : 0;
};
/** the backers' patience: their expectations and their verdict rise to full in year seven */
export const patience = (year: number) => Math.min(1, (year + 1) / N.patienceYears);
export const companyWants = (year: number, pop: number) => N.companyWants.perHead * pop * (1 + N.companyWants.growth * year) * patience(year);
export const hazardOf = (t: number) => N.hazard.base + N.hazard.perTurn * t;
/** the wall the Crown expects to see: nothing at landing, five feet by year twelve and a half */
export const flagWallsOf = (year: number) => Math.min(5, year / 2.5);

// ---- the colony -----------------------------------------------------------------------------
export const popOf = (s: ColonyState) => s.lab + s.craft + s.sold + s.gent + s.fam;
export const handsOf = (s: ColonyState, press: boolean) => s.lab + s.craft + 0.5 * s.sold + (press ? 0.6 * s.gent : 0) + 0.4 * s.fam;
export const yearOf = (s: ColonyState) => Math.floor(s.t / 2);
export const role = (s: ColonyState, k: Role) => (s.named[k] ? N.roles[k] : 1);
/** how well the colony knows this land: the harvest's share of what the same hands will grow later */
export const knowOf = (s: ColonyState) => Math.min(1, N.know0 + N.knowYear * yearOf(s) + N.knowRange * s.range);
/** a faction's share of the colony */
export const shareOf = (s: ColonyState, f: Faction) => s[f] / Math.max(1, popOf(s));
/** the colony against the strongest nation: 1 or more and it is first in the country */
export const standingOf = (s: ColonyState) => popOf(s) / Math.max(...s.nations.map((n) => n.pop));

// ---- the nations ----------------------------------------------------------------------------
export const pairKey = (a: Nation, b: Nation) => (a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`);
/** how hot the feud between two nations is, 0..100 */
export const feudOf = (s: ColonyState, a: Nation, b: Nation): number => (a === b ? 0 : s.feuds[pairKey(a, b)]!);
export const hottest = (s: ColonyState, n: Nation) => Math.max(...s.nations.filter((o) => o !== n).map((o) => feudOf(s, n, o)));
export const byId = (s: ColonyState, id: string | null | undefined) => s.nations.find((n) => n.id === id);
/** the tie above nothing, as a share of 100: what a good tie buys is read through this */
export const tieGood = (n: Nation) => clamp(n.rel / 100, 0, 1);
/** a nation at war with the colony, with no truce and not busy with a neighbour */
export const hostile = (s: ColonyState) => s.nations.some((n) => n.rel < N.warBelow && !(n.truce > 0) && !(n.engaged > 0));

// ---- war: one derivation each for what a nation can send and what the colony can stand off ----
export const strengthOf = (n: Nation) => n.pop * N.warriorShare * clamp(N.commit[0] + (N.warBelow - n.rel) / 100, N.commit[0], N.commit[1]) * (1 + n.guns * N.gunEdge);
const menOf = (s: ColonyState) => s.sold + (N.settlerArms + N.drillArms * s.drill) * (popOf(s) - s.sold);
export const defenceOf = (s: ColonyState, armed = 1) => (s.walls * N.wallDef + menOf(s) * (N.unarmedDef + (N.armedDef - N.unarmedDef) * armed)) * role(s, 'captain');
/** what the colony can take into the field */
export const forceOf = (s: ColonyState, armed = 1) => (s.sold + 0.5 * (N.settlerArms + N.drillArms * s.drill) * (popOf(s) - s.sold)) * (N.unarmedDef + (N.armedDef - N.unarmedDef) * armed) * role(s, 'captain');
/** what one of the nation's towns can put up at home */
export const homeOf = (n: Nation) => n.pop * N.warriorShare * N.homeEdge * (1 + n.guns * N.gunEdge);
/** warriors an ally sends on the colony's march: a client goes where he is sent; an equal against his own enemies, or in full for a march owed */
export const allyMarchOf = (s: ColonyState, n: Nation) => {
  if (!s.pact || n.id === s.pact) return 0;
  const a = byId(s, s.pact)!;
  if (s.pactKind === 'client') return a.pop * N.warriorShare * N.pactHelp * N.clientMarch * (1 + a.guns * N.gunEdge);
  if (feudOf(s, a, n) <= N.feudCares && s.owed < 1) return 0;
  return a.pop * N.warriorShare * N.pactHelp * (s.owed >= 1 ? N.owedMarch : N.allyMarch);
};
/** what the governor reckons a town can put up: right once the country is ranged, wrong by up to half before */
export const reckonedHome = (s: ColonyState, n: Nation) => homeOf(n) * (1 + streamFor(s.seed, s.t, 'scout' + n.id).float(-1, 1) * N.scoutErr * (1 - s.range) * (n.near ? 1 : N.far.scout));

// ---- the view: what a governor (bot or player) may see ---------------------------------------
export function view(s: ColonyState): View {
  return { t: s.t, year: yearOf(s), summer: s.t % 2 === 0, charter: s.charter, pop: popOf(s), hands: handsOf(s, false), lab: s.lab, craft: s.craft, sold: s.sold, gent: s.gent, fam: s.fam,
    food: s.food, powder: s.powder, iron: s.iron, salt: s.salt, goods: s.goods, cargo: s.cargo, walls: s.walls, fields: s.fields, store: s.store, mill: s.mill, range: s.range,
    morale: s.morale, favour: s.favour, landFree: s.landFree, shipHere: s.shipHere, used: s.used, deputy: s.deputy, govAlive: s.govAlive,
    wants: companyWants(yearOf(s), popOf(s)), flagWalls: flagWallsOf(yearOf(s)), hostile: hostile(s),
    defence: defenceOf(s), threat: Math.max(0, ...s.nations.filter((n) => n.rel < N.warBelow + 20 && !(n.truce > 0)).map(strengthOf)), wallDef: N.wallDef, foodPerHand: N.foodPerHand * fieldMult(s.fields) * knowOf(s), budget: budgetOf(s.charter, s.favour), price: N.price[s.charter],
    watchNeed: Math.min(0.2, popOf(s) * N.watchCover / Math.max(1, handsOf(s, false))), cargoPerHand: N.cargoPerHand * (1 + s.range),
    feudMax: Math.max(...Object.values(s.feuds)), pact: s.pact, pactKind: s.pactKind, owed: s.owed, know: knowOf(s), griev: { ...s.griev },
    shares: Object.fromEntries(FACTIONS.map((f) => [f, shareOf(s, f)])) as Record<Faction, number>, drill: s.drill, force: forceOf(s), named: { ...s.named },
    emptyPlaces: s.noNames ? 0 : ROLES.filter((k) => !s.named[k]).length, friendshipPrice: popOf(s) * N.friendshipPrice,
    nations: s.nations.map((n) => ({ id: n.id, rel: n.rel, grudge: n.grudge, guns: n.guns, corn: n.corn, pop: n.pop, near: n.near, truce: n.truce, beaten: n.beaten, engaged: n.engaged || 0, tie: tieGood(n), home: reckonedHome(s, n), strength: strengthOf(n), allyMarch: allyMarchOf(s, n), feuds: Object.fromEntries(s.nations.filter((o) => o !== n).map((o) => [o.id, feudOf(s, n, o)])) })) };
}

/** A turn is "live" when something is pressing: the proxy for claim 5 (docs/KILLGATE.md says what it does and does not show). */
export function pressing(s: ColonyState) {
  const pop = popOf(s);
  return { food: s.food < pop * 1.5, war: s.nations.some((n) => n.rel < N.warBelow + 15 && !(n.truce > 0)), land: pop > s.landFree - 5, backers: s.favour < 35, powder: s.powder < 6 + pop / 12 && !s.mill, temper: s.morale < 40, fever: !!s.sickNow };
}

/** The win: the colony stood ten years after the governor. */
export const won = (s: ColonyState) => s.ended?.why === 'stands';
/** What it became, for ranking runs on one seed: the living count, or how long it lasted. */
export const worth = (s: ColonyState) => (s.ended && s.ended.why !== 'stands' ? s.ended.t / 1000 : popOf(s) + s.born + (s.mill ? 20 : 0));
