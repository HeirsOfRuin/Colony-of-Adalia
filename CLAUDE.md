# Colony of Adalia (working title): working rules

- Read `docs/SPEC.md` first in every new session (the design and every decision
  in the author's words), then `docs/KILLGATE.md` (what the numbers model
  showed, and the faults still open). Do not re-derive either from chat.
- Built with the HeirsOfRuin game-building skills (`Game-Workshop/skills/`).
  Read `game-building/SKILL.md` before writing game logic. Follow its stages
  and gates; skipping a stage is allowed, skipping it silently is not.
- `docs/DESIGN.md` is the Phase 0 proposal and waits for the author's approval.
  Read it before touching `src/`. `docs/FRAME-war.md` is the accepted design of
  war beside trade and diplomacy: four nations, six feuds, the watch, the envoy,
  two kinds of pact. `docs/FRAME-start.md` (codes, the house's story, landing
  site) is not approved. The nations are `n1`, `n2`, `f1`, `f2` until the canon
  sheet names them.
- The stage this repo is at is written at the top of `docs/KILLGATE.md`. No
  screen is drawn and no scene is written until the author has read the kill
  gate and `docs/DESIGN.md` is approved.
- The kill-gate model is `prototypes/killgate/`. `npm run gate` prints its
  tables; `npm run gate:check` proves it is deterministic and that every run
  moved its clock. Re-run both after any change to `data.js`, `model.js` or
  `policies.js`, and put the numbers, with their run counts and ± error, in the
  commit message. When the real engine exists and reproduces it, retire the
  prototype; two models drift.
- Every commit runs `npm run check` first. Numbers in a commit message carry
  their run counts.
- The placeholder story (the river crossing in `content/`) is the narrative
  kit's example, not this game. It stays until the first real chapter replaces
  it, so that every instrument has something to prove.
- `packages/engine`, `packages/tools` and `tools/narrative/` are the
  game-narrative kit's and are not edited here; refresh them with the kit's
  `install.mjs --upgrade`. The game's own rules go in `src/game/`.
- The history (Jamestown, Quebec, Plymouth) is from memory until checked.
  Numbers in `prototypes/killgate/data.js` are marked tuned, not sourced.
- The world across the Grey Ocean is new canon. No nation, place or person is
  named in content until the author has approved a canon sheet.
- Sickness is deliberately softer here than in the real history (the author's
  decision, in the SPEC). The game says so once, plainly, in its notes.
- Decisions go in the SPEC's dated table with the author's words quoted.
- Scratch files are `tools/_*.mjs` or `*.tmp.*` and are never committed.
  `dist/`, `out/`, `release/` are output and never committed.
- Do not open a pull request unless the author asks.
- Write for a reader who was not there: plain words, the failure behind each
  rule, the number that was measured.
