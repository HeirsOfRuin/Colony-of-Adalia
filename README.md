# Colony of Adalia

A governor's life on a new shore, and the wait for the next ship.

The third of the Adalian games, after *Knight of Adalia* and *House of Adalia*.
Status (2026-11-28): Phase 1 built. The colony's rules are `src/game/colony/`,
their numbers `content/colony/numbers.yaml`, and `npm run gate` measures them
(`docs/KILLGATE.md`). No screen shows them yet: what plays in the browser is the
narrative kit's placeholder story. The design is `docs/DESIGN.md` (approved);
war beside trade and diplomacy is `docs/FRAME-war.md`; the start is
`docs/FRAME-start.md`.

## Play as an app

Once the Pages workflow has run on the default branch: open
https://heirsofruin.github.io/Colony-of-Adalia/ on a phone and choose Install (Chrome)
or Share → Add to Home Screen (Safari). It plays with the network off. Saves
live in that browser; Menu → Copy a save code moves a game anywhere.

## Run

```
npm install
npm run dev          # Vite dev server
npm run build        # dist/ (installable, build id stamped)
```

## Check

```
npm run check     # content, typecheck, build, tests (the colony's fingerprint and save fixture among them),
                  # validate, style, continuity, render scan, the story bot, the site check, the phone
                  # smoke test, and the colony's own check (determinism, save every turn, no inert part)
```

Must pass before every commit.

## Instruments

| Command | Question |
|---|---|
| `npm test` | Is it true? Invariants, save contracts, and the colony's fingerprint |
| `npm run gate` | Do the SPEC's claims and the author's answers still hold? 67 arms x 1,000 seeds, ±1 SE |
| `npm run gate:check` | Deterministic? Does a save and reload every turn change nothing? Is any part decoration? |
| `npm run trace -- 5 careful company palisade` | One life, turn by turn |
| `npm run fingerprint` | Has play moved since the fingerprint was taken? (`-- --write` only for a change meant to move it) |
| `npm run smoke` | Does the real page work at 390px? |

## Layout

```
content/colony/   the colony's numbers (YAML, compiled to src/game/colony/numbers.json)
content/          YAML scenes, the kit's placeholder story (compiled to src/content/bundle.json)
src/game/colony/  the colony's rules: pure, (state, governor) -> state; derive.ts is every number shown
src/game/         the story engine's game module (the placeholder's, until Phase 2)
src/ui/           Preact screens; read the engine, compute nothing
packages/         the story engine and its tools (game-narrative kit; not edited here)
sim/              the reference governors, the gate, the check, the trace
prototypes/       the retired kill-gate model: the record of rounds 1 to 4b
tools/            build-content, build-colony, fingerprint, fixtures, bot, smoke, icons, stamp
tests/            Vitest, and the save fixtures
```

## Sources
<!-- Real figures and their sources; "rounded for a game, do not cite". -->
