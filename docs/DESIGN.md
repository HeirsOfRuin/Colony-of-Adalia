# Colony of Adalia: design

Stage 3 of the workflow: stack, architecture, the turn, screens, scope and
build plan. **Approved 2026-11-28.** The author: "Go ahead with your
recommendations. Colony of Adalia keeps it tied to the trilogy". Phase 1 is
built: section 16. Written
2026-11-23 on the instruction "Go with recommendations and suggestions. Expand
nations to 4 total, 2 near and 2 a bit further"; amended 2026-11-24 with the
author's answers to the five risks and on the start (section 1, and the SPEC's
table).

Inputs, in the order they win: `SPEC.md`'s decisions table, `KILLGATE.md`
round 4 (the numbers), `FRAME-war.md` (war beside trade and diplomacy),
`FRAME-start.md` (codes, the house's story, background, site), `SPEC.md`'s text.

Where a later "as built" section differs from the plan above it, the later
section wins.

---

## 1. Decisions already made

| Decision | Source |
|---|---|
| One governor's life, about thirty years in half-year turns; the win is the colony standing ten years after him | SPEC, the author, 2026-11-22 |
| Crown or company, proposed by the background and open to the player | SPEC, the author, 2026-11-22 |
| Sickness both ways, softer than the real history, and the game says so once | SPEC, the author, 2026-11-22 |
| Four nations: two near, two a bit further | The author, 2026-11-23 |
| War spends the colony's own hands, powder and goods; no separate army; three beats to a fight; parley | `FRAME-war.md`, accepted 2026-11-23 |
| Phone first, installable, offline, no accounts, turn-based | All previous builds |
| Vite + Preact + TypeScript (strict) + YAML content + Zod, with the Knight of Adalia story engine | SPEC's handoff; scaffolded 2026-11-22 |
| The first ten years are the crux and hang on the ships: an unknown land, a new route, a colony that may sail home | The author, 2026-11-24; `KILLGATE.md` round 4 |
| The landing site is a visible choice of difficulty | The author, 2026-11-24; `FRAME-start.md` |
| Diplomacy deep and versatile: the envoy (parley, incite, mediate); hostile nations can be played off each other | The author, 2026-11-24; `FRAME-war.md` section 8 |
| War near catastrophe but useful; the palisade can be held | The author, 2026-11-24 |
| Two kinds of pact: a client (pawn) makes you top dog, an equal does not | The author, 2026-11-24 |
| A tie buys easier trade, diplomacy and support | The author, 2026-11-24 |
| Four factions with grievances; one lever a winter (whom you hear) and a faction's demand; no sliders | The author, 2026-11-24: "real threats, but not to the point of micromanagement" |
| A House of Adalia code is the preferred way in; a Knight of Adalia code works with forced quick choices for House of Adalia's story | The author, 2026-11-24; `FRAME-start.md` |
| The kill gate at round 4: seven of the author's answers hold; claim 4 fails again (a fault in the bot's rule, not yet the game's) | `KILLGATE.md` |

## 2. What kind of game this is, in one paragraph

A management game with a story inside it, not a story with upkeep. Knight of
Adalia is scenes with a calendar behind them; this is the other way round. The
clock is the colony's half-year turn, the player's main work is five desks
(the ship, the hands, the neighbours, the letter, the winter), and scenes
arrive because of what the colony's numbers are: a fever, a parley, a
gentleman's grievance, a ship with a letter from home. That decides the
architecture below. It is the shape In the Trenches settled on (a war layer
that owns the clock, the story engine for what happens in it).

## 3. Stack

| Choice | Decision | Why |
|---|---|---|
| Shape | Vite + Preact + TypeScript (strict) + YAML + Zod | Scaffolded; the story engine needs it |
| Story | `packages/engine`, unchanged; the game's rules in `src/game/` | The engine is the kit's; it is never edited per game |
| Colony rules | A pure TypeScript layer, `src/game/colony/`, ported from the kill-gate model | One model. The prototype is retired the day the port reproduces it |
| Numbers | `content/colony/*.yaml` tables, validated by Zod, compiled into the bundle | Content separate from logic; the gate's `data.js` becomes these |
| Saves | Guarded localStorage, versioned key `colony-of-adalia.save.v1`, migrations, a fixture per version, save code `COLA1.` | The contract every build keeps |
| Dynasty code | Reads `KOAD1.`; a copy of the contract file from the Knight of Adalia repo | It is the only dynasty contract that exists (see section 9) |
| Tests | `npm run check`: build, tests, validate, style, continuity, render scan, bot, gate, bundle, phone smoke | Scaffolded and passing |
| Deploy | Pages from the default branch; itch.io zip later | game-release |
| Runtime dependencies | preact, yaml, zod (as scaffolded) | |

## 4. Architecture

```
content/
  colony/         numbers: jobs, ships, backers, nations, sickness, war, roles    (YAML)
  scenes/ events/ registry/ starts/                                               (YAML, the story)
packages/engine   the story engine: scenes, choices, checks, effects, calendar, saves   (kit, not edited)
src/game/
  colony/
    state.ts      ColonyState: stores, people, named followers, nations, feuds, ships at sea
    derive.ts     EVERY number a screen shows: strength behind the wall, force in the field,
                  what a nation can send, a town's reckoned strength, next winter's food, what the
                  company wants, what a job will yield
    turn.ts       the half-year pipeline in a written order; returns the new state and a record
    orders.ts     the player's orders as data: hands, stances, the letter, winter, a military order
    fight.ts      the three beats; one resolver for played and delegated fights
    ledger.ts     every movement of goods, powder, food and cargo, with its reason
  module.ts       the game module: registers the colony's paths, effects and text variables with
                  the engine, and calls turn.ts from the calendar
  director.ts     which scenes the colony's state calls for this season
  dynasty.ts      reads a KOAD1 code or a quick background into a start
src/ui/           desks and the scene panel; reads derive.ts, computes nothing
sim/              the reference bot (the gate's policies, ported) and the game-measure adapter
tests/            invariants, save contract, engine tests on a test arc
```

Import direction: `ui → game → engine`, and `game/colony` imports nothing from
`ui` or the DOM. No `Math.random`, no `Date.now` in `src/game/`.

**The join between the two halves.** The colony layer owns the clock. A turn
runs, and its record (what landed, who died, which nation turned, what is
pressing) goes to `director.ts`, which asks the engine for the scenes that
record calls for. A scene's choices reach back through a small set of effects
the module registers (`colony.add`, `colony.tie`, `colony.order`, `follower.*`).
Scenes never write colony numbers directly, and the colony never writes prose.

**Three rules the gate paid for, built in from the first commit.**
1. One derivation per number. The gate's `defenceOf`, `strengthOf`, `forceOf`
   and `homeOf` become `derive.ts`; the fight and the screen both call them.
2. The turn's order is written down and tested. Three of the gate's seven
   round 1 faults were order: the colony ate only in winter, attacks came behind
   the ship, the backers decided only when a ship called.
3. Nothing declared is decoration. The gate's `check.js` (every policy part
   changes the end state) is ported with the bot and runs in `npm run check`.
   It failed the first expedition rule as inert; that is what it is for.

## 5. The turn

One turn is half a year. Summer is the sailing season; nothing comes in winter.

**Summer**
1. **The ship, or no ship.** Settlers, stores, letters, the backers' verdict, a
   fever one summer in three. If none: the colony knows it by the day.
2. **Eat the summer** out of the store, before the harvest.
3. **The hands.** Six jobs: food, walls, cargo, building, ranging, the watch.
4. **The neighbours.** A stance to each of four nations (trade, gift, pact,
   keep apart, raid), land bought, and at most one military order: march,
   answer or refuse a call, parley.
5. **The nations' own summer.** Their harvest, their feuds, their fights.
6. **The letter.** What is asked for sails with the ship that is here. With no
   ship there is no letter, and the backers load what they think fit.

**Winter**
7. **The store.** Rations, hunting (powder), corn bought.
8. **The attack,** if a nation has turned: after the hunting, months before any
   ship.
9. **Eat the winter.** Then spoilage, which salt slows.
10. **The colony's own trouble,** and the governor's attention: the colony, his
    deputy, or his health.
11. **The governor's life.** Age, the deputy, death.

Scenes come between steps, at most two a turn, most turns none or one.

## 6. Content

**Numbers** live in `content/colony/`. Example, as it would be ported from the
gate (values are round 3's, tuned and not sourced):

```yaml
# content/colony/nations.yaml
nations:
  - id: n1          # ids until the canon sheet names them
    near: true
    people: 330
    temper: [-45, 35]   # the tie on landing is drawn from this range
    corn: 1.18
  - id: f1
    near: false
    people: 420
far:                 # what being further off changes
  attack: 0.5        # comes to the wall half as often
  furs: 1.5          # half as many furs again per good traded
  land: 0.3          # minds the colony's fields a third as much
```

**Followers** are structured, not prose: a name, a trade (one of the eight
places, or none), a temper, a faction, a wave. A follower's lines in scenes are
drawn by trade and temper through tokens, so a dead man is never named after
his death by construction, and the continuity tool checks it.

**Scenes** use the engine's format unchanged (`docs/CONTENT.md`). A scene is
called by a condition on colony state:

```yaml
- id: e_fever_far_bank
  kind: pool
  when: "colony.fever.nation == true and colony.tie.sick >= 10"
  text: |
    {interpreter.name} comes back from the upper town without the furs. [break]
    There is a sickness there the old women have no name for.
  choices:
    - id: send_surgeon
      text: Send {surgeon.name} and four to nurse them.
      requires: "follower.surgeon.alive"
      effects: [ { colony.order: { nurse: sick } } ]   # costs a tenth of the summer's hands
    - id: keep_the_gate
      text: Shut the gate until it has passed.
      effects: [ { colony.tie: { sick: -10 } } ]
```

The stake line under each choice is computed from the effect, not typed.

**Nothing is named yet.** No nation, place or person appears in content until
the canon sheet is approved (CLAUDE.md). Phase 1 uses `n1`, `n2`, `f1`, `f2`
and the engine's test arc.

## 7. Screens

Phone first, 390 px wide, one thumb. Every number shown comes from `derive.ts`.

| Screen | What it does | The one thing it must make plain |
|---|---|---|
| **Start** | A `KOAD1.` code or four quick backgrounds; sex and name; Crown or company, proposed and open | What the choice of backer sends and wants |
| **The shore** (home) | Season and year, the store, the magazine, the people, the backers' favour, the wall, the four nations at a glance, what is pressing | How many winters of food and powder there are |
| **The ship** | The manifest against the letter that asked for it; who came; the backers' verdict | What was asked for, what came, what did not |
| **The hands** | Six jobs, a share each; what each share will yield this summer | Next winter's food before and after the change |
| **The neighbours** | Four nations: the tie and why it moved, their feuds with each other, what each could send, the stance | What dealing with one costs with another |
| **The muster** | Strength behind the wall and in the field; the military order; a fight's three beats | What the order costs in powder and who is at risk |
| **The letter** | The requisition against the backers' purse; what is already at sea | That it lands in a year at the soonest |
| **Winter** | Rations, hunting, corn, the governor's attention | Kegs left after the hunt, against what an attack would take |
| **The people** | The named followers: trade, temper, faction, health; empty places | Who would be missed, and the deputy's training |
| **The chronicle** | What happened, by year; the grudges and who holds them | Why a nation feels as it does |
| **A scene** | The story panel: prose, choices, the stake under each | (the engine's) |
| **The ten years after** | Played as chronicle, year by year, with nobody at the helm | Whether it needed you |
| **Menu** | Save code, copy, the notes (sources; the plain statement about sickness) | |

Every empty or locked state says why and what would change it (rule 6): "They
will not trade: the tie is -22 and trade opens at -10. A gift moves it 6."

## 8. Look

Not designed. The scaffold's placeholder colours (pine and slate) are not a
decision. A style tile and the first three scenes are the calibration round
(Phase 3), for the author's verdict on voice, look and how much is on a screen.
One constraint is known now: it must look nothing like Knight of Adalia, whose
engine it shares.

## 9. The start: codes, the house's story, background, site

Designed in `FRAME-start.md`, waiting for the author. In short:

- **A House of Adalia code (`HOA1.`) is the preferred way in.** It is that
  game's whole save; it can be read with Node's zlib alone (raw deflate,
  base64url). Its ending, last head, money and debt, rival houses, church and
  arms become the colony's standing, credit, enemies at home, backer and flag.
  House of Adalia records no house name; the player names the house.
- **A Knight of Adalia code (`KOAD1.`) works,** after six forced quick choices
  that stand in for House of Adalia's story (opening, house law, plague, great
  match, rising, war of cousins). It can reach every start but the very best.
- **No code:** the four backgrounds. Measured: none is best everywhere.
- **The landing site** is chosen in the open as the difficulty: sheltered,
  contested, palisade (careful governor 53%, 35%, 14%), or "where the ship is
  driven", at random.

## 9a. The factions

Gentlemen, labourers and servants, soldiers, families. Each has a grievance
that rises from what happens to it, never from a slider, and settles by
itself. The player's levers:

- **Whom the governor hears each winter** (one faction, the colony as a whole,
  his deputy, or his own health). That is the only routine faction control.
- **A faction's demand**, when its grievance passes the line: a scene with a
  stake (land, goods, powder), answered yes or no.
- Everything else the governor does already moves them: pressing gentlemen to
  dig, short rations, a breach, a fever, an empty magazine.

A faction past the mutiny line and large enough may rise and remove him. The
measured threat: a governor who hears no one and grants nothing ends in mutiny
in 64.6% of lives; one who hears the angriest ends in mutiny in 6.7%, all of
them after his death. The named followers each belong to a faction and give
its grievance a face; the engine shows the faction's mood through them, not as
a bar.

## 10. Scope: where this pushes back on the SPEC

| SPEC says | Proposed | Why |
|---|---|---|
| "Two nations" in the first playable (now four, the author) | All four in the numbers from the start; the two near nations fully written first, the two far ones as trading and warring partners with fewer scenes | Six feuds and four peoples is the largest writing cost in the game |
| "About forty named settlers over three waves" | Twelve named at landing, each wave adding named people to a cap of forty. The eight places first; the rest have temper and faction but no trade bonus | The gate measured eight and they carry 18.8 points of win rate. Forty at once on a phone is a list, not a cast |
| "The governorship: offices, council, petitions" carried over from House of Adalia | Designed here, in the feature loop, after the slice | It does not exist in House of Adalia's code (`KILLGATE.md`). The gate has no council and passes without one |
| "No succession test yet" in the first playable | Kept out of the first playable, but the engine is built for the whole life | The win cannot be judged in ten years; the gate ran the whole life |
| "The code read" in the first playable | `HOA1.`, `KOAD1.` with the forced choices, and the backgrounds: the author's preference (2026-11-24) | Section 9; `FRAME-start.md` |
| "Two or three nations" with "their own leaders, rivalries" | Four, six feuds, and the envoy as a second summer order beside the military one | The author, 2026-11-23 and 2026-11-24 |

## 11. Risks carried from the kill gate

Round 3's five risks, and what the author's answers of 2026-11-24 made of them
(round 4, 1,000 seeds an arm, ±1 SE):

| # | Round 3 risk | The author | Round 4 |
|---|---|---|---|
| R1 | A late ship barely mattered in the first ten years | "the first 10 years should be the most crucial and just reliant on ships" | **Closed.** Perfect ships: +12.6 ±1.6 alive at ten years, and 83 people there against 45. 44% of all losses fall in the first ten years |
| R2 | Both near nations hostile was nearly a lost game | "a visible choice, a good way to control difficulty" | **Closed by design.** The palisade shore is chosen openly: 14.2% careful, 36.2% playing them off, 43.9% a Crown fortress under a soldier |
| R3 | Answering an ally's call was the wrong choice | "Allies should be useful pawns if handled right" | **Closed.** Equal and client pacts. The client takes land (199 against 146) and weakens the neighbours, and wins 10.9 points less: he turns when the governor dies |
| R4 | Nursing the sick cost wins | "Ties should buy easier trade, diplomacy, and support" | **Closed.** +1.6 ±1.4 `~` (was -4.5) |
| R5 | Mutiny was a third of lives, from one number | "real threats, but not to the point of micromanagement" | **Closed.** Four factions; ignoring them: 64.6% mutiny; hearing them: 6.7% |

Open after round 4 (detail in `KILLGATE.md`):

| | Fault | Number | What the design does |
|---|---|---|---|
| A | A fixed 60% of hands on food beats the careful rule | 46.2% against 41.4% | The bot's cargo rule is at fault (a wider food margin made it worse). Give it a cargo floor and measure again before blaming the jobs |
| B | The win is a little easy | 41.4% against a third | Left until A is settled |
| C | The gentlemen never rise | Every mutiny measured is the labourers' | Their grievance needs teeth: idle and not rich is not enough |
| D | Granting a demand is worth little | +0.8 ±0.5 `~` | Revisit when the demand scenes are framed |
| E | The soldier's background is weak except where it fits | 34.1% company, 43.9% palisade fortress | Check with the fortress in more places |

## 12. Instruments

| Tool | Question it answers | Must assert |
|---|---|---|
| `npm run gate` | Do the eight claims still hold? | Every arm on the same seeds; the clock moved; numbers finite |
| `npm run gate:check` | Is it deterministic, and is anything decoration? | Byte-identical on repeat; every order changes the end state |
| `sim/` bot and adapter | What do N lives look like in the real game? | `progress()`: refuses a run that did not advance |
| `tests/invariants` | What can never be true? | No store below nothing; the dead stay dead; the ledger equals the store |
| `tests/save-contract` | Does every old save load and play on? | One fixture per save version |
| `npm run validate`, `continuity`, `scan` | Are the scenes sound? | No dead link, no dead man speaking, no raw token |
| `tools/smoke.mjs` | Does the real page work at 390 px? | The turn advances through the UI |
| `npm run trace` | What happened in this one life? | (for reading; it found two of the gate's faults) |

## 13. Build plan

| Phase | Delivers | Exit |
|---|---|---|
| **1. The engine port** (done, section 16) | `src/game/colony/` in TypeScript from the gate model; numbers in YAML; the bot and `check` ported; saves | The port reproduces the gate's tables on the same seeds (round 4b, as it turned out: the gate had two more rounds before the port). The prototype is then retired |
| **2. The desks** | The screens of section 7 with placeholder words, no art | The bot and a person can each play a whole life on a phone; smoke clean |
| **3. Calibration** | A style tile; three scenes at full polish (a ship, a fever, a parley); one fight in three beats; the letter screen | The author's verdict on voice, look, density, option count |
| **4. The slice** | Landing to the end of year three, written: two near nations, twelve named followers, the first ship that does not come | The author plays it and wants year four |
| **5. The first playable** | The first ten years, four nations, the waves, `KOAD1.` read | The SPEC's first playable scope, as amended in section 10 |
| **6. The life** | Years ten to thirty, the deputy, death, the ten years after | The win can be reached and is measured in the real game |
| **7. Features, each with a frame** | Factions (R5), the call (R3), what a tie buys (R4), the council and petitions, the captain's temper | Each frame's claims measured |
| **8. Release** | game-release | `pre-public.mjs` clean; played from the uploaded draft |

Not started and not blocked by this document: checking the history marked
"from memory" (Jamestown, Quebec, Plymouth) before it shapes a number or a
scene, and the canon sheet.

## 14. For the author

1. **The canon sheet.** Four nations, six possible feuds, a coast. Nothing is
   named until it exists; Phase 4 cannot start without it. Phases 2 and 3 can.
2. **Phase 2 next**, the desks: the screens of section 7 with placeholder
   words and no art, joined to the story engine. No question blocks it.

## 15. Decisions log

Newest first. The author's words are quoted; the SPEC's table holds the same
decisions in full.

| Date | Decision |
|---|---|
| 2026-11-28 | Approved; the title is *Colony of Adalia*. "Go ahead with your recommendations. Colony of Adalia keeps it tied to the trilogy". The recommendations: the cargo floor (round 4b), difficulty by site, `FRAME-start.md`'s answers, Phase 1. Phase 1 built: the port plays the same 5,000 of 5,000 runs as the prototype, and the gate's tables are identical at 67,000 runs |
| 2026-11-24 | The author's answers to the five risks and on the start, quoted in the SPEC's table. Built into the gate as round 4 and into this document (sections 1, 9, 9a, 10, 11) and `FRAME-start.md`. Measured: 67,000 runs, careful 41.4 ±1.6%, careless 0.3 ±0.2% |
| 2026-11-23 | Design proposal written; four nations; the war frame accepted. "Go with recommendations and suggestions. Expand nations to 4 total, 2 near and 2 a bit further". Measured: kill gate round 3, 30,000 runs, careful 30.2 ±1.5%, careless 1.7 ±0.4% |
| 2026-11-23 | Politics, a named cast and war into the gate. "Go with recommendations, also outline how military actions and play out will work along the other systems of trade and diplomacy". Measured: round 2, 29,000 runs |
| 2026-11-22 | Scaffolded (shape C, the story engine); kill gate round 1, 20,000 runs: two claims failed |

## 16. As built: Phase 1, the port (2026-11-28)

Where this section differs from the plan above it, this section wins.

**What exists.**

| Path | What |
|---|---|
| `content/colony/numbers.yaml` | Every number of the colony's rules: 230 numbers and tables, all tuned, none sourced. Fractions written "1/14" and read exactly |
| `src/game/colony/schema.ts`, `numbers.ts` | The Zod schema, strict (a misspelt or missing number fails the build); the validated table `N` |
| `src/game/colony/rng.ts` | Named streams (the prototype's mulberry32, unchanged), not the story engine's sfc32 cursor: a stream is rebuilt from (seed, turn, system), so the save holds only the seed and a draw added to one system never shifts another |
| `src/game/colony/types.ts` | The state (plain data, saved whole), the summer and winter plans, the view |
| `src/game/colony/derive.ts` | Every number a screen shows and the turn resolves with: `defenceOf`, `strengthOf`, `forceOf`, `homeOf`, `allyMarchOf`, `reckonedHome`, `knowOf`, `tieGood`, `standingOf`, and `view()` |
| `src/game/colony/turn.ts` | `newColony`, `step`, `play`: the half-year in the written order of section 5 |
| `src/game/colony/save.ts` | Versioned save (format `colony-of-adalia/colony`, version 1), a migration chain (empty), `tests/fixtures/colony-v1.json` |
| `sim/policies.ts` | The reference governors (careful, careless, and every part the gate swaps) |
| `sim/gate.ts`, `sim/check.ts`, `sim/trace.ts` | `npm run gate`, `npm run gate:check` (in `npm run check`), `npm run trace` |
| `tools/build-colony.ts`, `tools/colony-fingerprint.ts`, `tools/make-colony-fixture.ts` | YAML to JSON; the fingerprint; the save fixture |
| `tests/colony.test.ts` | The numbers match the YAML; the fingerprint holds; the view and the fight share one derivation; the site moves only the near nations; every save fixture loads and plays on; a newer or foreign save is refused |

**How it was proved.** Exactly, not within error:
- the port and the prototype gave the same end state, compared as sorted-key
  JSON field by field, in **5,000 of 5,000 runs** (25 kinds of life x 200
  seeds, the first comparison run);
- `npm run gate` on the port printed **the prototype's round 4b tables to the
  last digit** (67 arms x 1,000 seeds = 67,000 runs; `diff` empty);
- a fingerprint (a hash of the end states of 25 arms x 30 seeds) is committed
  and tested, so the proof outlives the prototype, now retired
  (`prototypes/killgate/README.md`);
- `sim/check.ts` adds what the prototype never checked: 20 lives saved to JSON
  text and reloaded before every turn (951 reloads) play exactly as lives never
  saved.

The only differences between the two models were bookkeeping: four
statistics the prototype created lazily, two fields it never read (`letter`,
`cargoHome`), and seven numbers nothing read (listed at the head of
`numbers.yaml`), all dropped or given a starting value in the port.

**Not in Phase 1, by the plan.** The colony is not yet joined to the story
engine: `src/game/module.ts` and the browser still play the kit's placeholder
story, and no screen shows a colony. That join is Phase 2 (the desks, and
`director.ts`, which turns a turn's record into scenes). The game-measure batch
runner (`run.js` with an adapter) is not installed; `sim/gate.ts` does its work
for now.

**Measured (round 4b, unchanged by the port):** careful governor 49.3 ±1.6%
(company, random landing), 47.4 ±1.6% (Crown); careless 0.3 ±0.2%; by site
55.9 / 45.5 / 25.8%. `docs/KILLGATE.md` has the rest.
