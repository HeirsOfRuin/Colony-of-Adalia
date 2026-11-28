// Writes tests/fixtures/colony-v<SAVE_VERSION>.json: a careful colony ten turns in (seed 12345), from the
// current build. Run once per save version, BEFORE the version rises, and commit it. A shipped
// fixture is never rewritten: it is the proof that old saves load.
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { newColony, step, toSave, SAVE_VERSION } from '../src/game/colony';
import { careful, careless } from '../sim/policies';

const file = join(import.meta.dirname, '..', 'tests', 'fixtures', `colony-v${SAVE_VERSION}.json`);
if (existsSync(file) && !process.argv.includes('--force')) { console.error(`${file} exists: a shipped fixture is never rewritten (--force if it never shipped)`); process.exit(1); }
const s = newColony(12345, {});
while (s.t < 10 && !s.ended) step(s, careful, s.deputy, careless);
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, JSON.stringify(toSave(s), null, 1) + '\n');
console.log(`wrote ${file} (turn ${s.t})`);
