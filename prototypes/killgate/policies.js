// Fixed policies, each a written rule, built from parts so one part can be swapped on the
// same seeds. A policy sees only view(s) (model.js) and returns a plan; it holds no state.
//   policy({ order, neighbours, split, hunt, share, deputy, ration, sellPowder, envoy, pact, fortress, factions, concede })

const P = (v) => 10 + v.pop / 6 + (v.nations.some((n) => n.rel < -15) ? 10 : 0);   // powder the governor wants in the magazine

// ---- the letter home ------------------------------------------------------------------------
// today: ask for whatever is short on the day the ship sails.
// ahead: ask for what will be short when the answer lands a year on, and for a second year
//        in case that ship is late or lost.
function letter(v, mode, o = {}) {
  const use = v.used, L = {};
  const gap = (have, want, yearly) => Math.max(0, mode === 'ahead' ? want + 2 * yearly - (have - yearly) : want - have);
  L.powder = v.mill ? 0 : gap(v.powder, P(v), Math.max(4, use.powder));
  L.iron = gap(v.iron, 3, Math.max(2, use.iron));
  L.salt = gap(v.salt, 2, Math.max(2, use.salt));
  L.goods = gap(v.goods, o.envoy === 'playoff' || o.envoy === 'mediate' ? 14 : 6, Math.max(4, use.goods));   // gifts are the envoy's coin
  L.spec = mode === 'ahead' ? v.emptyPlaces * 2 : 0;   // two asked for each empty place: one in two is found
  L.food = mode === 'ahead' ? Math.max(0, v.pop * 2 * (v.fields < 5 ? 0.35 : 0.1)) : Math.max(0, v.pop * 1.2 - v.food);
  let left = v.budget - ['powder', 'iron', 'salt', 'goods', 'food', 'spec'].reduce((q, k) => q + L[k] * v.price[k], 0);
  if (left > 0) {
    const war = v.nations.some((n) => n.rel < -15) || (o.fortress && v.nations.some((n) => n.near && n.rel < 0));
    L.craft = v.craft < 9 ? Math.min(4, left * 0.25 / v.price.craft) : 0; left -= L.craft * v.price.craft;
    L.sold = war && v.sold < (o.fortress ? 40 : 25) ? left * (o.fortress ? 0.55 : 0.35) / v.price.sold : 0; left -= L.sold * v.price.sold;
    L.fam = v.year >= 5 ? left * 0.4 / v.price.fam : 0; left -= L.fam * v.price.fam;
    L.lab = Math.max(0, left) / v.price.lab;
  }
  return L;
}

// ---- the hands ------------------------------------------------------------------------------
export const SPLITS = {
  even:   { food: 1 / 6, walls: 1 / 6, cargo: 1 / 6, build: 1 / 6, range: 1 / 6, watch: 1 / 6 },
  plough: { food: 0.6, walls: 0.08, cargo: 0.15, build: 0.1, range: 0.04, watch: 0.03 },
  wall:   { food: 0.35, walls: 0.33, cargo: 0.15, build: 0.1, range: 0.04, watch: 0.03 },
  arms:   { food: 0.35, walls: 0.12, cargo: 0.15, build: 0.1, range: 0.04, watch: 0.24 },
  cargo:  { food: 0.35, walls: 0.08, cargo: 0.4, build: 0.1, range: 0.04, watch: 0.03 },
  build:  { food: 0.35, walls: 0.08, cargo: 0.15, build: 0.35, range: 0.04, watch: 0.03 },
};
function adaptive(v, o) {
  // feed the year first, then guard against the worst neighbour, then pay the backers, then build
  // In that order: each job takes from what the one before it left. (Fourth run of the gate:
  // the shares were worked out separately and scaled down together, so a colony that needed
  // 74% of its hands on food set 55% and starved; a fixed 60% beat it on 61% of seeds.)
  let left = 1; const take = (x) => { const y = Math.max(0, Math.min(left, x)); left -= y; return y; };
  const need = Math.max(0, v.pop * 2 * 1.15 - Math.max(0, v.food - v.pop));   // the summer is eaten before the harvest
  // men under arms first where a neighbour is hostile: without them the field hands lose a quarter of the summer
  // a floor of hands on the backers' cargo, every year whatever else is short (round 4, fault A:
  // without it the rule starved the cargo whenever food was short, was recalled 9% of the time,
  // and a fixed 60% on food with 15% on cargo beat it, 46.2% to 41.4%)
  // The Crown's backers barely weigh cargo, so its governor keeps no floor (at a tenth, the Crown won
  // 31.5% against 44.5% with none, 400 seeds).
  const floor = take(o.cargoFloor ?? (v.charter === 'company' ? 0.1 : 0));
  const watch = take(o.noWatch ? 0 : v.hostile ? v.watchNeed * (o.fortress ? 1.5 : 1) : o.neighbours === 'isolate' || o.fortress ? 0.06 : 0.02);
  const food = take(Math.min(0.85, need / Math.max(1, v.hands * v.foodPerHand)));
  // walls to stand off the worst neighbour as he is today, with a third to spare; cargo
  // jumps the queue when the backers are losing patience
  const flagShort = v.charter === 'crown' && v.walls < v.flagWalls + 0.5;
  // the fortress-builder wants half again the margin, and keeps building the wall in peace
  const wallShare = () => take(v.defence < v.threat * (o.fortress ? 1.8 : 1.3) ? (o.fortress ? 0.3 : 0.22) : flagShort ? 0.18 : o.fortress && v.walls < 6 ? 0.15 : v.walls < 1.5 ? 0.08 : 0.04);
  const cargoFirst = v.charter === 'company' && v.favour < 50;
  let walls = cargoFirst ? 0 : wallShare();
  const cargoNeed = Math.max(0, (v.wants - v.cargo) * (v.charter === 'crown' ? 0.6 : 1.15));
  const cargo = floor + take(Math.min(0.5, cargoNeed / Math.max(1, v.hands * v.cargoPerHand)) - floor);
  if (cargoFirst) walls = wallShare();
  const range = take(v.range < 1 ? Math.min(0.08, left * 0.4) : 0);
  return { food, walls, cargo, build: left, range, watch };
}

export function policy(o = {}) {
  o = { order: 'ahead', neighbours: 'trade', split: 'adaptive', hunt: 'need', share: true, deputy: true, ration: 'adaptive', sellPowder: false, expedition: false, raidRival: false,
    envoy: 'parley', pact: 'equal', fortress: false, factions: 'hear', concede: true, ...o };
  if (o.parley === false) o.envoy = 'none';
  return {
    opts: o,
    summer(v) {
      const stance = {}, sell = {};
      // the partisan picks the nation that likes him best and stands by it. Its enemies he leaves alone, or raids when
      // hungry; with the rest he trades.
      const friend = v.pact || [...v.nations].sort((a, b) => b.rel - a.rel)[0].id;
      const foe = (n) => n.feuds[friend] > 40;
      for (const n of v.nations) {
        // the one who plays them off spends his gifts on the envoy, not on nations that will not trade
        if (o.envoy === 'playoff' && n.rel < -10 && o.neighbours === 'trade') stance[n.id] = 'ignore';
        else if (o.neighbours === 'partisan') stance[n.id] = n.id === friend ? (v.goods >= 2 ? 'ally' : 'ignore') : !foe(n) ? (v.goods >= 2 ? 'trade' : 'ignore') : o.raidRival && v.food < v.pop * 1.6 && v.powder >= 6 && n.corn > 40 && n.rel < 0 ? 'raid' : 'ignore';
        else if (o.neighbours === 'trade') { stance[n.id] = v.goods >= 2 ? 'trade' : 'ignore'; if (o.sellPowder && v.food < v.pop * 1.2 && v.powder > 8) sell[n.id] = 3; }
        else if (o.neighbours === 'raid') stance[n.id] = v.food < v.pop * 1.6 && v.powder >= 3 && n.corn > 40 ? 'raid' : 'ignore';
        else stance[n.id] = 'ignore';
      }
      const build = v.fields < 6 ? 'fields' : v.store < 2 ? 'store' : !v.mill && v.craft >= 6 ? 'mill' : 'fields';
      return {
        split: o.split === 'adaptive' ? adaptive(v, o) : SPLITS[o.split], stance, sellPowder: sell, share: o.share,
        tradeGoods: ((k) => Math.min(v.goods * 0.8 / k, Math.max(2, v.friendshipPrice / k)))(Math.max(1, Object.values(stance).filter((x) => x === 'trade' || x === 'ally').length)),
        envoy: envoy(v, o), pactKind: o.pact, buyLand: o.neighbours === 'trade' || o.neighbours === 'partisan', build, press: v.food < v.pop * 0.8,
        answerCall: o.answerCall !== false, payTribute: o.payTribute !== false,
        // march only on a neighbour already at war with us, and only with a quarter more than his town can put up
        expedition: o.expedition ? v.nations.find((n) => n.rel < -30 && v.force + n.allyMarch > n.home * 1.25 && v.powder >= 10)?.id : undefined,
        letter: letter(v, o.order, o),
      };
    },
    winter(v) {
      const short = v.food < v.pop * 1.0;
      const hunt = o.hunt === 'always' ? 99 : o.hunt === 'early' ? (v.year < 6 ? 99 : short ? Math.max(0, v.powder - P(v) * 0.6) : 0)
        : o.hunt === 'never' ? 0 : short ? Math.max(0, Math.min((v.pop - v.food) / 7, v.powder - P(v) * 0.5)) : 0;
      return {
        hunt, buyCorn: (o.neighbours === 'trade' || o.neighbours === 'partisan') && v.food < v.pop * 1.3 ? v.pop * 1.3 - v.food : 0,
        ration: o.ration === 'full' ? 'full' : v.food < v.pop * 0.85 ? 'short' : 'full',
        attend: attend(v, o),
        concede: Object.fromEntries(Object.keys(v.griev).map((f) => [f, !!o.concede])),
      };
    },
  };
}

// ---- the envoy, one errand a summer ---------------------------------------------------------
//   parley:   a truce from the worst neighbour at or near war
//   playoff:  set the nations that threaten the colony on each other; parley with one that is beaten
//   mediate:  cool a feud between two friends (and parley when there is war)
function envoy(v, o) {
  if (o.envoy === 'none') return undefined;
  const worst = [...v.nations].filter((n) => n.rel < -20 && !(n.truce > 0)).sort((a, b) => a.rel - b.rel);
  const parley = worst[0] && v.goods >= 8 ? { kind: 'parley', a: worst[0].id } : undefined;
  if (o.envoy === 'parley') return parley;
  if (o.envoy === 'playoff') {
    const beaten = worst.find((n) => n.beaten > 0);
    if (beaten) return { kind: 'parley', a: beaten.id };
    // the threat is the strongest nation that wishes the colony ill; the tool is the nation most
    // ready to fight it. Best of all, a second enemy: then two that wish the colony ill are busy.
    const threat = [...v.nations].filter((n) => n.rel < -10 && !(n.engaged > 0)).sort((a, b) => b.strength - a.strength)[0];
    if (threat) {
      const score = (n) => n.feuds[threat.id] + (n.rel < -10 ? 30 : 0) + (n.near ? 10 : 0);
      const tool = [...v.nations].filter((n) => n !== threat && n.rel >= -75 && (n.feuds[threat.id] ?? 0) < 95).sort((a, b) => score(b) - score(a))[0];
      if (tool && (v.goods >= 5 || v.powder >= P(v) * 0.5 + 2)) return { kind: 'incite', a: tool.id, b: threat.id, pay: v.goods >= 5 ? 'goods' : 'powder' };
    }
    return parley;
  }
  if (o.envoy === 'mediate') {
    if (parley) return parley;
    const friends = v.nations.filter((n) => n.rel >= 10);
    let best = null;
    for (const a of friends) for (const b of friends) if (a.id < b.id && a.feuds[b.id] > 60 && (!best || a.feuds[b.id] > best.f)) best = { a: a.id, b: b.id, f: a.feuds[b.id] };
    return best ? { kind: 'mediate', a: best.a, b: best.b } : undefined;
  }
  return undefined;
}

// ---- whom the governor hears, each winter -----------------------------------------------------
//   hear:   the most aggrieved faction, once it is past 40; otherwise as below
//   colony: the colony as a whole, every winter he is not training a deputy
//   ignore: never; he trains the deputy and minds his health
function attend(v, o) {
  const [f, g] = Object.entries(v.griev).filter(([k]) => v.shares[k] > 0.03).sort((a, b) => b[1] - a[1])[0] || [];
  if (o.factions === 'hear' && g >= 40) return 'faction:' + f;
  if (o.factions !== 'ignore' && v.morale < 42) return 'colony';
  if (o.deputy && v.year >= 6 && v.deputy < 1) return 'deputy';
  if (v.year >= 18) return 'health';
  return o.factions === 'ignore' ? 'health' : 'colony';
}

// The two the spec names. Careful: orders ahead, trades, buys land, shares cures, trains a
// deputy, hunts only to fill a hungry winter, parleys, hears the most aggrieved faction and
// gives it what it asks when it can. Careless: an even split, orders for today,
// ignores the neighbours, hunts every winter, full rations, no deputy, no nursing.
export const careful = policy();
export const careless = policy({ order: 'today', neighbours: 'ignore', split: 'even', hunt: 'always', share: false, deputy: false, ration: 'full', envoy: 'none', factions: 'colony', concede: false });
