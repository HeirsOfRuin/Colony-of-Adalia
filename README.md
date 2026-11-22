# Colony of Adalia

A governor's life on a new shore, and the wait for the next ship.

Working title. Status: scaffolded 2026-11-22 (game-scaffold shape C, with the
game-narrative story engine). What plays today is the kit's placeholder story,
not this game. The design is `docs/SPEC.md`; the numbers model that has to pass
before any screen is drawn is `prototypes/killgate/` (`docs/KILLGATE.md`).

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
npm run check     # content build, typecheck, build, tests, a 200-story bot batch, the site check, the phone smoke test
```

Must pass before every commit.

## Instruments

| Command | Question |
|---|---|
| `npm test` | Is it true? Invariants and the save contract |
| `npm run sim -- --runs=200 --by=difficulty` | Is it balanced? Batch runs by cell, ±1 SE (game-measure) |
| `npm run sim -- --trace --seed=3` | One game, turn by turn |
| `npm run smoke` | Does the real page work at 390px? |

## Layout

```
content/      YAML scenes (compiled to src/content/bundle.json)
src/content/  schema (Zod) and the compiled bundle
src/engine/   pure: story facade, rng
src/ui/       Preact screens; read the engine, compute nothing
tools/        build-content, bot, smoke, check-bundle, icons, stamp
tests/        Vitest
```

## Sources
<!-- Real figures and their sources; "rounded for a game, do not cite". -->
