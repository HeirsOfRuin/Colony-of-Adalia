// Fixed policies, each a written rule, built from parts so one part can be swapped on the
// same seeds. A policy sees only view(s) (model.js) and returns a plan; it holds no state.
//   policy({ order, neighbours, split, hunt, share, deputy, ration, sellPowder })

const P = (v) => 10 + v.pop / 6 + (v.nations.some((n) => n.rel < -15) ? 10 : 0);   // powder the governor wants in the magazine

// ---- the letter home ------------------------------------------------------------------------
// today: ask for whatever is short on the day the ship sails.
// ahead: ask for what will be short when the answer lands a year on, and for a second year
//        in case that ship is late or lost.
function letter(v, mode) {
  const use = v.used, L = {};
  const gap = (have, want, yearly) => Math.max(0, mode === 'ahead' ? want + 2 * yearly - (have - yearly) : want - have);
  L.powder = v.mill ? 0 : gap(v.powder, P(v), Math.max(4, use.powder));
  L.iron = gap(v.iron, 3, Math.max(2, use.iron));
  L.salt = gap(v.salt, 2, Math.max(2, use.salt));
  L.goods = gap(v.goods, 6, Math.max(4, use.goods));
  L.food = mode === 'ahead' ? Math.max(0, v.pop * 2 * (v.fields < 5 ? 0.35 : 0.1)) : Math.max(0, v.pop * 1.2 - v.food);
  let left = v.budget - ['powder', 'iron', 'salt', 'goods', 'food'].reduce((q, k) => q + L[k] * v.price[k], 0);
  if (left > 0) {
    const war = v.nations.some((n) => n.rel < -15);
    L.craft = v.craft < 9 ? Math.min(4, left * 0.25 / v.price.craft) : 0; left -= L.craft * v.price.craft;
    L.sold = war && v.sold < 25 ? left * 0.35 / v.price.sold : 0; left -= L.sold * v.price.sold;
    L.fam = v.year >= 5 ? left * 0.4 / v.price.fam : 0; left -= L.fam * v.price.fam;
    L.lab = Math.max(0, left) / v.price.lab;
  }
  return L;
}

// ---- the hands ------------------------------------------------------------------------------
export const SPLITS = {
  even:   { food: 0.2, walls: 0.2, cargo: 0.2, build: 0.2, range: 0.2 },
  plough: { food: 0.6, walls: 0.1, cargo: 0.15, build: 0.1, range: 0.05 },
  wall:   { food: 0.35, walls: 0.35, cargo: 0.15, build: 0.1, range: 0.05 },
  cargo:  { food: 0.35, walls: 0.1, cargo: 0.4, build: 0.1, range: 0.05 },
  build:  { food: 0.35, walls: 0.1, cargo: 0.15, build: 0.35, range: 0.05 },
};
function adaptive(v, o) {
  // feed the year first, then guard against the worst neighbour, then pay the backers, then build
  // In that order: each job takes from what the one before it left. (Fourth run of the gate:
  // the shares were worked out separately and scaled down together, so a colony that needed
  // 74% of its hands on food set 55% and starved; a fixed 60% beat it on 61% of seeds.)
  let left = 1; const take = (x) => { const y = Math.max(0, Math.min(left, x)); left -= y; return y; };
  const need = Math.max(0, v.pop * 2 * 1.15 - Math.max(0, v.food - v.pop));   // the summer is eaten before the harvest
  const food = take(Math.min(0.85, need / Math.max(1, v.hands * v.foodPerHand * (v.hostile ? 0.75 : 1))));
  // walls to stand off the worst neighbour as he is today, with a third to spare; cargo
  // jumps the queue when the backers are losing patience
  const flagShort = v.charter === 'crown' && v.walls < v.flagWalls + 0.5;
  const wallShare = () => take(v.defence < v.threat * 1.3 ? 0.22 : flagShort ? 0.18 : v.walls < 1.5 ? 0.08 : 0.04);
  const cargoFirst = v.charter === 'company' && v.favour < 50;
  let walls = cargoFirst ? 0 : wallShare();
  const cargoNeed = Math.max(0, (v.wants - v.cargo) * (v.charter === 'crown' ? 0.6 : 1.15)) / (v.hostile ? 0.75 : 1);
  const cargo = take(Math.min(0.5, cargoNeed / Math.max(1, v.hands * (1 + v.range))));
  if (cargoFirst) walls = wallShare();
  const range = take(v.range < 1 ? Math.min(0.08, left * 0.4) : 0);
  return { food, walls, cargo, build: left, range };
}

export function policy(o = {}) {
  o = { order: 'ahead', neighbours: 'trade', split: 'adaptive', hunt: 'need', share: true, deputy: true, ration: 'adaptive', sellPowder: false, ...o };
  return {
    opts: o,
    summer(v) {
      const stance = {}, sell = {};
      for (const n of v.nations) {
        if (o.neighbours === 'trade') { stance[n.id] = v.goods >= 2 ? 'trade' : 'ignore'; if (o.sellPowder && v.food < v.pop * 1.2 && v.powder > 8) sell[n.id] = 3; }
        else if (o.neighbours === 'raid') stance[n.id] = v.food < v.pop * 1.6 && v.powder >= 3 && n.corn > 40 ? 'raid' : 'ignore';
        else stance[n.id] = 'ignore';
      }
      const build = v.fields < 6 ? 'fields' : v.store < 2 ? 'store' : !v.mill && v.craft >= 6 ? 'mill' : 'fields';
      return {
        split: o.split === 'adaptive' ? adaptive(v, o) : SPLITS[o.split], stance, sellPowder: sell, share: o.share,
        tradeGoods: Math.min(6, v.goods * 0.35), buyLand: o.neighbours === 'trade', build, press: v.food < v.pop * 0.8,
        letter: letter(v, o.order),
      };
    },
    winter(v) {
      const short = v.food < v.pop * 1.0;
      const hunt = o.hunt === 'always' ? 99 : o.hunt === 'early' ? (v.year < 6 ? 99 : short ? Math.max(0, v.powder - P(v) * 0.6) : 0)
        : o.hunt === 'never' ? 0 : short ? Math.max(0, Math.min((v.pop - v.food) / 7, v.powder - P(v) * 0.5)) : 0;
      return {
        hunt, buyCorn: o.neighbours === 'trade' && v.food < v.pop * 1.3 ? v.pop * 1.3 - v.food : 0,
        ration: o.ration === 'full' ? 'full' : v.food < v.pop * 0.85 ? 'short' : 'full',
        attend: v.morale < 42 ? 'colony' : o.deputy && v.year >= 6 && v.deputy < 1 ? 'deputy' : v.year >= 18 ? 'health' : 'colony',
      };
    },
  };
}

// The two the spec names. Careful: orders ahead, trades, buys land, shares cures, trains a
// deputy, hunts only to fill a hungry winter. Careless: an even split, orders for today,
// ignores the neighbours, hunts every winter, full rations, no deputy, no nursing.
export const careful = policy();
export const careless = policy({ order: 'today', neighbours: 'ignore', split: 'even', hunt: 'always', share: false, deputy: false, ration: 'full' });
