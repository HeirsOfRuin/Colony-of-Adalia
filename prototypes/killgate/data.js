// Every tunable number of the kill-gate model. All of it is TUNED, none of it is sourced:
// the history (Jamestown, Quebec, Plymouth) is from memory and unchecked (docs/SPEC.md).
// Units: one turn is half a year; food is one person's ration for one turn; powder is kegs.

export const D = {
  life: 60,            // turns the governor may hold office before he lays it down
  after: 20,           // turns the colony must stand without him (the win test: ten years)
  firstTen: 20,        // the first-playable window
  minPop: 12,          // below this the colony is dead

  start: { lab: 34, craft: 6, sold: 10, gent: 12, fam: 0, food: 150, powder: 22, iron: 10, salt: 8, goods: 14, morale: 60, favour: 55 },

  // work, per hand set to the job for a summer
  foodPerHand: 2.8,          // times fieldMult, weather, tools
  fieldMult: (lvl) => 1 + 0.11 * lvl,       // fields 0..10. At 0, three hands in four on food grow 1.5 rations a head; the year needs 2
  fieldCost: (lvl) => 8 + 3 * lvl,          // build points for the next level
  storeCost: 22, storeMax: 3,
  millCost: 170, millCraft: 6, millKegs: 5,  // the powder mill: late, dear, and it ends the clock
  wallPerHand: 0.085, wallDecay: 0.06, wallMax: 10,
  cargoPerHand: 1.6,
  rangePerHand: 0.05,        // knowledge 0..1: better cargo, better hunting
  ironUsePerHand: 0.035,     // tools wear; short of iron, every job slows
  ironShortPenalty: 0.45,
  spoil: 0.28, spoilSalted: 0.06, saltPerFood: 0.035, storeSpoilCut: 0.2,
  harassPenalty: 0.25,       // field and cargo work under a hostile nation

  // winter
  huntFoodPerKeg: 5, huntKegsPerHead: 1 / 14,
  shortRation: 0.72, shortRationDeath: 0.02, starveDeathShare: 0.75, summerDeathShare: 0.4,   // summer hunger kills fewer: there is fish and forage
  powderDamp: 0.04,          // kegs spoiled per turn, share of stock

  // ships
  fate: {                    // real ships; the on-time world sets every late/short/lost to 0
    company: { late: 0.16, short: 0.12, lost: 0.07 },
    crown:   { late: 0.34, short: 0.10, lost: 0.07 },
  },
  budget: { company: (f) => 30 + 0.55 * f, crown: (f) => 36 + 0.22 * f },
  sails:  { company: (f) => Math.min(0.97, 0.55 + 0.0045 * f), crown: (f) => 0.72 + 0.002 * f },
  pushSettlers: { company: (year) => (year >= 4 ? 5 + 0.6 * year : 0), crown: () => 0 },   // labourers sent unasked: the later waves
  price: {
    company: { powder: 2.0, iron: 1.0, salt: 0.5, goods: 0.6, food: 0.2, lab: 1.0, craft: 2.2, sold: 3.0, fam: 1.5 },
    crown:   { powder: 1.1, iron: 1.0, salt: 0.5, goods: 0.9, food: 0.2, lab: 1.7, craft: 2.6, sold: 1.3, fam: 2.2 },
  },
  standard: {                // what the backers load when no letter reached them (shares of the budget)
    company: { lab: 0.45, goods: 0.15, food: 0.15, powder: 0.10, iron: 0.08, salt: 0.07 },
    crown:   { sold: 0.35, powder: 0.25, food: 0.15, lab: 0.12, iron: 0.08, salt: 0.05 },
  },
  craftFound: 0.6,           // "ask for carpenters and you get what the backers could find"
  gentPerShip: { company: 0.12, crown: 0.05 },   // gentlemen who come unasked, share of the settlers sent
  seasoning: 0.10,           // newcomers dead in their first season
  graveyard: 3, graveyardMax: 0.8,   // settlers who will not sail: share lost per share of the colony that died last year

  // the backers
  companyWants: (year, pop) => 0.30 * pop * (1 + 0.04 * year) * Math.min(1, (year + 1) / 4),   // cargo a year; the first years are forgiven
  companySwing: 16, companyNoShip: -4, crownCargoWeight: 0.3, courtSd: 5, courtDrift: -0.5, flagBonus: 3,
  recallBelow: 12, recallStrikes: 2,

  // the nations
  nations: [
    { id: 'near', pop: 320, base: [-45, 35], corn: 1.18 },
    { id: 'far',  pop: 220, base: [-45, 35], corn: 1.12 },
  ],
  warriorShare: 0.25, tradeTie: 3, tradeAbove: -10, giftTie: 6, giftCost: 5, furPerGood: 1.5,
  cornPrice: 0.8, cornSold: 0.25, powderTie: 3, powderFood: 8, rivalSpite: 2,
  raidTie: -50, raidGrudge: 30, raidKegs: 3, raidShare: 0.4, raidMax: 70,
  grudgeDecay: 0.01, drift: 0.12,
  landFree: 70, landPerDeal: 16, landCost: 9, landPressure: 0.2,
  warBelow: -30, attackBase: 0.10, attackSlope: 0.01, attackMax: 0.6,
  wallDef: 4, armedDef: 1.2, unarmedDef: 0.15, settlerArms: 0.15, kegsPerAttack: 1 / 12, gunEdge: 1 / 40,
  commit: [0.6, 1.2],        // how much of its strength a nation sends: more as the tie worsens
  breachPop: 0.35, breachFood: 0.3, allyAbove: 50, allyHelp: 0.3, allyCorn: 0.2,

  // sickness, both ways
  shipFever: 0.30, shipFeverDeath: [0.03, 0.08], crossOver: 0.5, crossOverNoContact: 0.2,
  nationFeverDeath: [0.05, 0.11], tradeFever: 0.15, colonyFeverDeath: [0.04, 0.10],
  nurseCut: 0.5, nurseHands: 0.10, nurseTie: 15, nurseGrudge: -5, refuseTie: -10, refuseGrudge: 8, healerTie: 5, healerAbove: 10,

  // the colony's own trouble
  moraleRest: 55, moralePull: 0.08, mutinyBelow: 20, mutiny: 0.15, desertBelow: 35, desert: 0.03,
  abandonBelow: 25, deathMorale: 60,   // morale lost per share of the colony that dies, of anything
  m: { ship: 8, noShip: -8, short: -7, starve: -15, breach: -12, repulse: 4, press: -2, attend: 5, fever: -4 },

  // the governor
  hazard: (t) => 0.002 + 0.0005 * t, hazardHunger: 0.012, healthCut: 0.5,
  deputyStep: 0.07, deputyDies: 0.02, deputyHeir: 0.35,
  successionFavour: 15, successionMorale: 10,
};
