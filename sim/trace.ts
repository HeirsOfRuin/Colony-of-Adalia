// One life, turn by turn: reading one bad run beats reading a batch average.
//   npm run trace -- [seed=1] [careful|careless] [company|crown] [site]
import { newColony, step, popOf, standsNow, type Charter, type Site } from '../src/game/colony';
import { careful, careless } from './policies';

const [seedArg, polArg, charterArg, siteArg] = process.argv.slice(2);
const seed = Number(seedArg || 1), gov = polArg === 'careless' ? careless : careful;
const s = newColony(seed, { charter: (charterArg as Charter) || 'company', site: (siteArg as Site) || null });
console.log('t   yr season ship pop  food powder iron salt goods cargo walls fld morale favour    n1   n2   f1   f2  dep  griev(g/l/s/f)');
while (!s.ended && !standsNow(s)) {
  step(s, gov, s.deputy, careless);
  const f = (x: number, w = 5) => x.toFixed(0).padStart(w);
  const t = s.t - 1, win = t % 2 === 1;
  console.log(`${String(t).padStart(2)} ${String(Math.floor(t / 2)).padStart(3)} ${win ? 'winter' : 'summer'} ${win ? '    ' : s.shipHere ? 'SHIP' : ' -- '}${f(popOf(s), 4)}${f(s.food)}${f(s.powder, 6)}${f(s.iron)}${f(s.salt)}${f(s.goods, 6)}${f(s.cargo, 6)}${s.walls.toFixed(1).padStart(6)}${f(s.fields, 4)}${f(s.morale, 7)}${f(s.favour, 7)}${s.nations.map((n) => f(n.rel)).join('')}${s.deputy.toFixed(2).padStart(5)}  ${Object.values(s.griev).map((g) => g.toFixed(0)).join('/')}${s.govAlive ? '' : '  (no governor)'}`);
}
console.log(s.ended ? `ended: ${s.ended.why} at turn ${s.ended.t}` : 'stands');
