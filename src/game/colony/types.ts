// The colony's state, the plans a governor (a player or a bot) hands the turn, and the view
// both of them see. Plain data: the whole state goes into the save as JSON.
import type { Background, Charter, Faction, Role, Site } from './numbers';

export type Klass = 'lab' | 'craft' | 'sold' | 'gent' | 'fam';
export const KLASSES: readonly Klass[] = ['lab', 'craft', 'sold', 'gent', 'fam'];
export type Store = 'powder' | 'iron' | 'salt' | 'goods' | 'food';
/** What a letter can ask for and a ship can carry, in the order the backers fill it. */
export type Item = 'powder' | 'iron' | 'salt' | 'goods' | 'food' | 'spec' | 'lab' | 'craft' | 'sold' | 'fam';
export const ITEMS: readonly Item[] = ['powder', 'iron', 'salt', 'goods', 'food', 'spec', 'lab', 'craft', 'sold', 'fam'];
export type Load = Partial<Record<Item | 'gent', number>>;

export interface Nation {
  id: string; near: boolean;
  pop0: number; pop: number; corn: number; cornK: number;
  /** the tie with the colony, -100..100; drifts toward base less grudge */
  rel: number; base: number; grudge: number;
  /** kegs the colony has sold or given it: every later fight is harder for its enemies */
  guns: number;
  fever: number; contact: boolean;
  /** turns left of a truce with the colony, of being lately beaten, of a war with a neighbour */
  truce: number; beaten: number; engaged: number;
}

export interface Ship { due: number; load: Load; late?: boolean }

export type Stance = 'trade' | 'ally' | 'gift' | 'raid' | 'ignore';
export type PactKind = 'equal' | 'client';
export type Build = 'fields' | 'store' | 'mill';
export interface Split { food: number; walls: number; cargo: number; build: number; range: number; watch?: number }
export type Envoy =
  | { kind: 'parley'; a: string }
  | { kind: 'incite'; a: string; b: string; pay: 'goods' | 'powder' }
  | { kind: 'mediate'; a: string; b: string };

export interface SummerPlan {
  split: Split;
  stance: Record<string, Stance>;
  sellPowder: Record<string, number>;
  share: boolean;
  tradeGoods: number;
  envoy?: Envoy | undefined;
  pactKind: PactKind;
  buyLand: boolean;
  build: Build;
  press: boolean;
  answerCall: boolean;
  payTribute: boolean;
  expedition?: string | undefined;
  letter: Load;
}
export type Attend = 'colony' | 'deputy' | 'health' | `faction:${Faction}`;
export interface WinterPlan {
  hunt: number;
  buyCorn: number;
  ration: 'full' | 'short';
  attend: Attend;
  concede: Partial<Record<Faction, boolean>>;
}

export interface Ended { why: 'stands' | 'recalled' | 'mutiny' | 'abandoned' | 'starved' | 'overrun'; t: number; after?: boolean }

export interface Stats {
  ships: number; noShip: number; lost: number; starved: number; killed: number; feverDead: number; nationFeverDead: number;
  feverWaves: number; nationWaves: number; attacks: number; breaches: number; raids: number; powderOut: number;
  hungryWinters: number; hungrySummers: number; kegsHunted: number; peak: number;
  /** things pressing each turn: the proxy for claim 5 */
  live: number[];
  at20: { pop: number; inOffice: boolean; powder: number; rel: number[] } | null;
  minNationPop: number;
  parleys: number; truces: number; incites: number; incitesFound: number; incitedFights: number; mediations: number;
  demands: number; conceded: number; mutinyBy: Faction | null; landTaken: number; clientMarches: number;
  standingAtDeath: number | null; firstAtDeath: boolean; standingEnd: number | null; griefPeak: number;
  namedDead: number; namedSent: number; calls: number; callsRefused: number; expeditions: number; carried: number; routs: number;
  feudFights: number; pactYears: number; bloody: number; sailedHome: boolean;
}

export interface ColonyState {
  seed: number; t: number; charter: Charter; onTime: boolean;
  site: Site | null; background: Background;
  // people and stores
  lab: number; craft: number; sold: number; gent: number; fam: number;
  food: number; powder: number; iron: number; salt: number; goods: number;
  morale: number; favour: number;
  cargo: number; walls: number; fields: number; store: number; mill: boolean; millWork: number; buildWork: number;
  range: number; born: number; landFree: number;
  strikes: number; diedNow: number; diedYear: number; loseN: number;
  // the nations
  nations: Nation[]; feuds: Record<string, number>; feudNear0: number; hostileNear0: number;
  pact: string | null; pactKind: PactKind | null; owed: number;
  drill: number; cover: number;
  // the colony's own
  griev: Record<Faction, number>; lastDemand: Partial<Record<Faction, number>>; budgetK: number;
  named: Record<Role, boolean>; noNames: boolean; namedSafe: boolean;
  // the sea
  inbound: Ship[]; shipHere: boolean;
  used: Record<'powder' | 'iron' | 'salt' | 'goods', number>; usedNow: Record<'powder' | 'iron' | 'salt' | 'goods', number>;
  /** last summer's plan: the ship's fever reads whether the colony shares cures */
  plan: SummerPlan | { share: false } | null;
  sickNow: boolean;
  // the governor
  govAlive: boolean; govDiedAt: number | null; laidDown: boolean; deputy: number;
  ended: Ended | null;
  stats: Stats;
}

export interface NewColony {
  charter?: Charter; onTime?: boolean; site?: Site | null; background?: Background;
  /** gate switches: no named settlers at all; the named cannot die */
  noNames?: boolean; namedSafe?: boolean;
}

/** A governor: a bot here, a player's choices on the desks later. Sees only the view. */
export interface Governor {
  summer(v: View): SummerPlan;
  winter(v: View): WinterPlan;
}

export interface NationView {
  id: string; rel: number; grudge: number; guns: number; corn: number; pop: number; near: boolean;
  truce: number; beaten: number; engaged: number; tie: number;
  /** what the governor reckons the town can put up: wrong by up to half until the country is ranged */
  home: number; strength: number; allyMarch: number; feuds: Record<string, number>;
}
export interface View {
  t: number; year: number; summer: boolean; charter: Charter; pop: number; hands: number;
  lab: number; craft: number; sold: number; gent: number; fam: number;
  food: number; powder: number; iron: number; salt: number; goods: number; cargo: number; walls: number; fields: number; store: number; mill: boolean; range: number;
  morale: number; favour: number; landFree: number; shipHere: boolean; used: ColonyState['used']; deputy: number; govAlive: boolean;
  wants: number; flagWalls: number; hostile: boolean; defence: number; threat: number; wallDef: number; foodPerHand: number; budget: number;
  price: Record<Item, number>; watchNeed: number; cargoPerHand: number; feudMax: number; pact: string | null; pactKind: PactKind | null; owed: number;
  know: number; griev: Record<Faction, number>; shares: Record<Faction, number>; drill: number; force: number; named: Record<Role, boolean>;
  emptyPlaces: number; friendshipPrice: number; nations: NationView[];
}
