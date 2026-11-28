# Kill-gate prototype: retired

The Stage 2 numbers model (`docs/KILLGATE.md`, rounds 1 to 4b, 2026-11-22 to 11-28). Retired on
2026-11-28, when Phase 1 ported it into the game as `src/game/colony/` (rules), `content/colony/numbers.yaml`
(its numbers) and `sim/` (the reference governors, the gate, the check).

The port was proved before this was retired, not after:

- the same end state, compared field by field, in all 5,000 runs tried (25 kinds of life x 200 seeds);
- the same gate tables to the last printed digit at 1,000 seeds an arm (67 arms, 67,000 runs);
- a fingerprint of 25 arms x 30 seeds, taken then, is in `tests/fixtures/colony-fingerprint.json`
  and `npm run check` fails if play moves from it.

Kept as the record of how the targets were first met; not run, not maintained. Two models drift.
Measure the game with `npm run gate`; read one life with `npm run trace`.
