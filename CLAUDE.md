# Colony of Adalia: working rules

The third of the Adalian games, after Knight of Adalia and House of Adalia.

- Read `docs/SPEC.md` first in every new session (the design and every decision
  in the author's words), then `docs/KILLGATE.md` (what the numbers showed, and
  the faults still open), then `docs/DESIGN.md` (approved 2026-11-28; section 16
  is what Phase 1 built). Do not re-derive any of it from chat.
- Built with the HeirsOfRuin game-building skills (`Game-Workshop/skills/`).
  Read `game-building/SKILL.md` before writing game logic. Follow its stages
  and gates; skipping a stage is allowed, skipping it silently is not.
- `docs/FRAME-war.md` is the accepted design of war beside trade and diplomacy:
  four nations, six feuds, the watch, the envoy, two kinds of pact.
  `docs/FRAME-start.md` (codes, the house's story, landing site) is approved on
  the recommendations. The nations are `n1`, `n2`, `f1`, `f2` until the canon
  sheet names them.
- The colony's rules are `src/game/colony/`, pure: no DOM, no `Math.random`, no
  `Date.now`. Every draw comes from a named stream (`rng.ts`). Every number a
  screen shows comes from `derive.ts`, the same function the turn resolves with.
- Every number is in `content/colony/numbers.yaml`; `npm run content` compiles it.
  A number nothing reads is deleted, not kept.
- After any change to `src/game/colony/`, `content/colony/numbers.yaml` or
  `sim/policies.ts`: `npm run fingerprint`. If play moved and was meant to,
  `npm run fingerprint -- --write`, run `npm run gate`, and put the numbers, with
  their run counts and ± error, in the commit message. If it moved and was not
  meant to, it is a bug. A refactor is neutral only if the fingerprint says so.
- `npm run gate:check` (in `npm run check`) fails on nondeterminism, on a save
  that does not reload exactly, and on any policy part, site or background that
  changes nothing. An inert part is rewritten or deleted, never excused.
- Saves are contracts: the colony save is versioned (`src/game/colony/save.ts`);
  before the version rises, `tools/make-colony-fixture.ts` writes the fixture for
  the version that shipped, and every fixture must load and play on.
- The kill-gate prototype (`prototypes/killgate/`) is retired (2026-11-28): the
  record of rounds 1 to 4b, not run, not maintained. Two models drift.
- Every commit runs `npm run check` first. Numbers in a commit message carry
  their run counts.
- No screen is drawn without a frame for it, and no scene is written until the
  canon sheet is approved: the world across the Grey Ocean is new canon, and no
  nation, place or person is named in content before then.
- The placeholder story (the river crossing in `content/`) is the narrative
  kit's example, not this game. It stays until the first real chapter replaces
  it, so that every instrument has something to prove.
- `packages/engine`, `packages/tools` and `tools/narrative/` are the
  game-narrative kit's and are not edited here; refresh them with the kit's
  `install.mjs --upgrade`. The game's own rules go in `src/game/`.
- The history (Jamestown, Quebec, Plymouth) is from memory until checked.
  Numbers in `content/colony/numbers.yaml` are marked tuned, not sourced.
- Sickness is deliberately softer here than in the real history (the author's
  decision, in the SPEC). The game says so once, plainly, in its notes.
- Decisions go in the SPEC's dated table with the author's words quoted.
- Scratch files are `tools/_*.mjs`, `tools/_*.ts` or `*.tmp.*` and are never
  committed. `dist/`, `out/`, `release/` are output and never committed.
- Do not open a pull request unless the author asks.
- Write for a reader who was not there: plain words, the failure behind each
  rule, the number that was measured.
