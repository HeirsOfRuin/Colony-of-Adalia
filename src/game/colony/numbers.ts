// The colony's numbers, validated: every rule reads its numbers from here and nowhere else.
// Source: content/colony/numbers.yaml (compiled by tools/build-colony.ts).
import raw from './numbers.json';
import { NumbersSchema, type Numbers } from './schema';

export * from './schema';
export const N: Numbers = NumbersSchema.parse(raw);
