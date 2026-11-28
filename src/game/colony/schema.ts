// The schema of content/colony/numbers.yaml. tools/build-colony.ts validates the YAML
// against it and writes numbers.json (run by `npm run content`); numbers.ts parses that
// JSON again at load, so a missing or misspelt number fails loudly at once, not as a NaN
// forty turns into a run.
import { z } from 'zod';

/** A number, or a fraction written "a/b" (YAML cannot write 1/14 exactly any other way). */
const num = z.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?\/\d+(\.\d+)?$/)]).transform((v) => {
  if (typeof v === 'number') return v;
  const [a, b] = v.split('/').map(Number) as [number, number];
  return a / b;
});
const range = z.tuple([num, num]);
const perLevel = z.object({ base: num, perLevel: num }).strict();
const perFavour = z.object({ base: num, perFavour: num }).strict();
const byCharter = <T extends z.ZodTypeAny>(t: T) => z.object({ company: t, crown: t }).strict();
const items = z.object({ spec: num, powder: num, iron: num, salt: num, goods: num, food: num, lab: num, craft: num, sold: num, fam: num }).strict();
const shares = z.record(z.string(), num);

const FLAT = [
  'life', 'after', 'firstTen', 'minPop', 'foodPerHand', 'storeCost', 'storeMax', 'millCost', 'millCraft', 'millKegs', 'wallPerHand', 'wallDecay', 'wallMax',
  'cargoPerHand', 'rangePerHand', 'ironUsePerHand', 'ironShortPenalty', 'spoil', 'spoilSalted', 'saltPerFood', 'storeSpoilCut', 'harassPenalty',
  'huntFoodPerKeg', 'huntKegsPerHead', 'shortRation', 'shortRationDeath', 'starveDeathShare', 'summerDeathShare', 'powderDamp',
  'crownVictuals', 'craftFound', 'seasoning', 'graveyard', 'graveyardMax', 'patienceYears', 'companySwing', 'companyNoShip', 'crownCargoWeight',
  'courtSd', 'courtDrift', 'flagBonus', 'recallBelow', 'recallStrikes', 'warriorShare', 'tradeTie', 'tradeAbove', 'giftTie', 'giftCost', 'furPerGood',
  'cornPrice', 'cornSold', 'powderTie', 'powderFood', 'rivalSpite', 'raidTie', 'raidGrudge', 'raidKegs', 'raidShare', 'raidMax', 'grudgeDecay', 'drift',
  'landFree', 'landPerDeal', 'landCost', 'landPressure', 'warBelow', 'attackBase', 'attackSlope', 'attackMax', 'wallDef', 'armedDef', 'unarmedDef',
  'settlerArms', 'kegsPerAttack', 'gunEdge', 'breachPop', 'breachFood', 'nearLand', 'parleyGoods', 'parleyBase', 'parleyBeaten', 'parleyInterpreter',
  'parleyTo', 'truceTurns', 'beatenTurns', 'scoutErr', 'watchDeaths', 'fightCools', 'suesBelow', 'feudCares', 'feudSd', 'fightAbove', 'fightChance',
  'fightLoss', 'sideCost', 'friendshipPrice', 'pactAbove', 'pactBreaks', 'pactHelp', 'allyMarch', 'pactCorn', 'pactTarget', 'busyDiv', 'callKegs',
  'callRivalTie', 'callRivalGrudge', 'callTie', 'callPlunder', 'refuseCall', 'raidRivalTie', 'hegemon', 'tribute', 'tributeRefused', 'watchCover',
  'drillRate', 'drillDecay', 'drillArms', 'expeditionKegs', 'homeEdge', 'carried', 'standOff', 'carriedPop', 'carriedCorn', 'carriedGrudge', 'routShare',
  'namedRisk', 'namedMorale', 'specFound', 'shipFever', 'crossOver', 'crossOverNoContact', 'tradeFever', 'nurseCut', 'nurseHands', 'nurseTie',
  'nurseGrudge', 'refuseTie', 'refuseGrudge', 'healerTie', 'healerAbove', 'moraleRest', 'moralePull', 'desertBelow', 'desert', 'abandonBelow',
  'deathMorale', 'know0', 'knowYear', 'knowRange', 'newRoute', 'routeYears', 'abandonDied', 'hardYear', 'homeBy', 'inciteGoods', 'inciteKegs',
  'inciteHeat', 'inciteAbove', 'inciteFound', 'inciteFoundTie', 'inciteFoundGrudge', 'inciteUsed', 'mediateGoods', 'mediateCool', 'mediateTie',
  'busyFight', 'engagedTurns', 'bloodyRepulse', 'repulseLoss', 'respect', 'beatenHeat', 'owedMarch', 'clientKegs', 'clientHeat', 'clientMarch',
  'clientLoss', 'clientResent', 'clientWarriorGrudge', 'takeLand', 'tieFurs', 'tieParley', 'tieIncite', 'tieLand', 'supportAbove', 'supportCorn',
  'supportHelp', 'heard', 'heardAll', 'demandAt', 'demandEvery', 'refused', 'mutinyAt', 'mutinyWeight', 'mutinyChance', 'hazardHunger', 'healthCut',
  'deputyStep', 'deputyDies', 'deputyHeir', 'successionFavour', 'successionMorale', 'successorBest',
] as const;
type FlatKey = (typeof FLAT)[number];

export const FACTIONS = ['gent', 'lab', 'sold', 'fam'] as const;
export type Faction = (typeof FACTIONS)[number];
export const ROLES = ['surgeon', 'smith', 'carpenter', 'captain', 'interpreter', 'minister', 'husbandman', 'factor'] as const;
export type Role = (typeof ROLES)[number];
export const SITES = ['sheltered', 'contested', 'palisade'] as const;
export type Site = (typeof SITES)[number];
export const BACKGROUNDS = ['none', 'oldHouse', 'merchant', 'soldier', 'disgrace'] as const;
export type Background = (typeof BACKGROUNDS)[number];
export type Charter = 'company' | 'crown';

const background = z.object({ favour: num.optional(), budget: num.optional(), sold: num.optional(), drill: num.optional(), goods: num.optional() }).strict();
const STRUCTURED = {
  start: z.object({ lab: num, craft: num, sold: num, gent: num, fam: num, food: num, powder: num, iron: num, salt: num, goods: num, morale: num, favour: num }).strict(),
  fieldMult: perLevel,
  fieldCost: perLevel,
  fate: byCharter(z.object({ late: num, short: num, lost: num }).strict()),
  budget: byCharter(perFavour),
  sails: byCharter(z.object({ base: num, perFavour: num, cap: num }).strict()),
  pushSettlers: z.object({ company: z.object({ fromYear: num, base: num, perYear: num }).strict().nullable(), crown: z.object({ fromYear: num, base: num, perYear: num }).strict().nullable() }).strict(),
  price: byCharter(items),
  standard: byCharter(shares),
  gentPerShip: byCharter(num),
  companyWants: z.object({ perHead: num, growth: num }).strict(),
  nations: z.array(z.object({ id: z.string(), near: z.boolean(), pop: num, base: range, corn: num }).strict()).min(2),
  commit: range,
  far: z.object({ attack: num, land: num, furs: num, scout: num }).strict(),
  feud: range,
  expeditionFavour: byCharter(num),
  roles: z.object(Object.fromEntries(ROLES.map((r) => [r, num])) as Record<Role, typeof num>).strict(),
  shipFeverDeath: range,
  nationFeverDeath: range,
  colonyFeverDeath: range,
  m: z.object({ ship: num, noShip: num, short: num, starve: num, breach: num, repulse: num, press: num, attend: num, fever: num }).strict(),
  sites: z.object({ sheltered: z.tuple([range, range]), contested: z.tuple([range, range]), palisade: z.tuple([range, range]) }).strict(),
  repulseFavour: byCharter(num),
  factions: z.tuple([z.literal('gent'), z.literal('lab'), z.literal('sold'), z.literal('fam')]),
  griev: z.object({
    decay: num, base: num,
    gent: z.object({ press: num, noProfit: num, idle: num, granted: num }).strict(),
    lab: z.object({ hunger: num, short: num, deaths: num, overwork: num, landless: num, granted: num }).strict(),
    sold: z.object({ noPowder: num, killed: num, unpaid: num, repulse: num, granted: num }).strict(),
    fam: z.object({ fever: num, breach: num, deaths: num, minister: num, granted: num }).strict(),
  }).strict(),
  concede: z.object(Object.fromEntries(FACTIONS.map((f) => [f, z.object({ goods: num.optional(), land: num.optional(), powder: num.optional() }).strict()])) as Record<Faction, z.ZodObject<{ goods: z.ZodOptional<typeof num>; land: z.ZodOptional<typeof num>; powder: z.ZodOptional<typeof num> }>>).strict(),
  backgrounds: z.object(Object.fromEntries(BACKGROUNDS.map((b) => [b, background])) as Record<Background, typeof background>).strict(),
  hazard: z.object({ base: num, perTurn: num }).strict(),
};

export const NumbersSchema = z.object({
  ...(Object.fromEntries(FLAT.map((k) => [k, num])) as Record<FlatKey, typeof num>),
  ...STRUCTURED,
}).strict();

export type Numbers = z.infer<typeof NumbersSchema>;
