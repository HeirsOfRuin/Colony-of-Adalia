// One run, turn by turn: reading one bad run beats reading a batch average.
//   node prototypes/killgate/trace.js [seed=1] [careful|careless] [company|crown]
import { newColony, step, popOf } from './model.js';
import { careful, careless } from './policies.js';
import { D } from './data.js';
const seed = Number(process.argv[2] || 1), pol = process.argv[3] === 'careless' ? careless : careful;
const s = newColony(seed, { charter: process.argv[4] || 'company' });
console.log('t   yr season ship pop  food powder iron salt goods cargo walls fld morale favour  near  far  dep');
while (!s.ended && !(!s.govAlive && s.t >= s.govDiedAt + 1 + D.after)) {
  step(s, pol, s.deputy, careless);
  const f = (x, n = 5) => x.toFixed(0).padStart(n);
  console.log(`${String(s.t - 1).padStart(2)} ${String(Math.floor((s.t - 1) / 2)).padStart(3)} ${(s.t - 1) % 2 ? 'winter' : 'summer'} ${(s.t - 1) % 2 ? '    ' : s.shipHere ? 'SHIP' : ' -- '}${f(popOf(s), 4)}${f(s.food)}${f(s.powder, 6)}${f(s.iron)}${f(s.salt)}${f(s.goods, 6)}${f(s.cargo, 6)}${s.walls.toFixed(1).padStart(6)}${f(s.fields, 4)}${f(s.morale, 7)}${f(s.favour, 7)}${f(s.nations[0].rel, 6)}${f(s.nations[1].rel)}${s.deputy.toFixed(2).padStart(6)}${s.govAlive ? '' : '  (no governor)'}`);
}
console.log(s.ended ? `ended: ${s.ended.why} at turn ${s.ended.t}` : 'stands');
