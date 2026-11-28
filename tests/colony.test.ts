// The colony's rules (src/game/colony): the numbers are what the YAML says, the play is what it was
// when the fingerprint was taken, saves load and play on. sim/check.ts (in `npm run check`) adds the
// determinism, save-every-turn and inert-part checks over many seeds.
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { N, NumbersSchema, newColony, play, step, standsNow, fromSave, toSave, popOf, SAVE_VERSION, view, defenceOf, strengthOf } from '../src/game/colony';
import { careful, careless } from '../sim/policies';
import { fingerprint, FILE } from '../tools/colony-fingerprint';

const root = join(import.meta.dirname, '..');

describe('the colony', () => {
  it('reads the numbers the YAML says, and the compiled JSON is up to date', () => {
    const fromYaml = NumbersSchema.parse(parse(readFileSync(join(root, 'content/colony/numbers.yaml'), 'utf8')));
    expect(N).toEqual(fromYaml);
    expect(N.huntKegsPerHead).toBe(1 / 14);   // fractions are read exactly
  });

  it('plays as it did when the fingerprint was taken (run tools/colony-fingerprint.ts --write only for a change meant to move play)', () => {
    expect(fingerprint()).toEqual(JSON.parse(readFileSync(FILE, 'utf8')));
  });

  it('is deterministic and ends', () => {
    const a = play(7, { governor: careful, fallback: careless }), b = play(7, { governor: careful, fallback: careless });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.ended).not.toBeNull();
    expect(a.stats.live.length).toBe(a.t);
  });

  it('shows the number it resolves with: the view and the fight share one derivation', () => {
    const s = newColony(3, {});
    const v = view(s);
    expect(v.defence).toBe(defenceOf(s));
    expect(v.nations.map((n) => n.strength)).toEqual(s.nations.map(strengthOf));
  });

  it('reads the landing site into the near nations only', () => {
    const plain = newColony(11, {}), pal = newColony(11, { site: 'palisade' });
    expect(pal.nations.filter((n) => n.near).every((n) => n.base >= -60 && n.base <= -30)).toBe(true);
    expect(pal.nations.filter((n) => !n.near).map((n) => n.base)).toEqual(plain.nations.filter((n) => !n.near).map((n) => n.base));
    expect(pal.feuds).toEqual(plain.feuds);   // the site has its own stream
  });

  const dir = join(root, 'tests', 'fixtures');
  for (const f of readdirSync(dir).filter((x) => /^colony-v\d+\.json$/.test(x))) {
    it(`loads ${f} and plays on to an ending`, () => {
      const s = fromSave(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      let turns = 0;
      while (!s.ended && !standsNow(s) && turns < 200) { step(s, careful, s.deputy, careless); turns++; }
      expect(s.ended || standsNow(s)).toBeTruthy();
      expect(Number.isFinite(popOf(s))).toBe(true);
    });
  }

  it('has a fixture for the current save version', () => {
    expect(readdirSync(dir)).toContain(`colony-v${SAVE_VERSION}.json`);
  });

  it('refuses a save from a newer build, and anything that is not a colony save', () => {
    const s = toSave(newColony(1, {}));
    expect(() => fromSave({ ...s, version: SAVE_VERSION + 1 })).toThrow(/newer build/);
    expect(() => fromSave({ format: 'house-of-adalia-save' })).toThrow(/not a Colony of Adalia/);
  });
});
