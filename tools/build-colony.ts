// content/colony/numbers.yaml -> src/game/colony/numbers.json, validated. Run by `npm run content`.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { NumbersSchema } from '../src/game/colony/schema';

const root = join(import.meta.dirname, '..');
const raw = parse(readFileSync(join(root, 'content/colony/numbers.yaml'), 'utf8'));
const got = NumbersSchema.safeParse(raw);
if (!got.success) {
  console.error('content/colony/numbers.yaml:\n' + got.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n'));
  process.exit(1);
}
writeFileSync(join(root, 'src/game/colony/numbers.json'), JSON.stringify(got.data, null, 1) + '\n');
console.log(`colony: ${Object.keys(got.data).length} numbers and tables`);
