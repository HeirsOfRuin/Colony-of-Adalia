# Colony of Adalia (working title): Phase 0 design proposal

Stage 3 of the workflow: stack, architecture, the turn, screens, scope and
build plan. **For the author's approval before any game code.** Written
2026-11-23 on the instruction "Go with recommendations and suggestions. Expand
nations to 4 total, 2 near and 2 a bit further".

Inputs, in the order they win: `SPEC.md`'s decisions table, `KILLGATE.md`
round 3 (the numbers), `FRAME-war.md` (war beside trade and diplomacy),
`SPEC.md`'s text.

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
| The kill gate is passed at round 3 with five named risks | `KILLGATE.md` |

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

## 9. The dynasty code

- **`KOAD1.` is read.** It is plain data with display names (the house's name,
  the founder's station and renown, traits, wealth, the people he knew and what
  they felt). Proposed mapping, to be measured as the SPEC's bonuses:
  station and renown become standing with the backers; coin becomes credit
  (the purse the letter spends); traits carry; people whose affection was
  negative become enemies among the investors or at court.
- **House of Adalia has no dynasty code.** Its ending offers its whole save as
  `HOA1.`, 13,000 to 21,000 characters, shaped like that game's insides. Reading
  it means depending on another game's save format. **Proposed: not in the
  first playable.** The clean fix is a small export added to House of Adalia,
  which is a decision about that game.
- **Without a code:** four backgrounds give the same four things (standing,
  credit, a trait, an enemy).

## 10. Scope: where this pushes back on the SPEC

| SPEC says | Proposed | Why |
|---|---|---|
| "Two nations" in the first playable (now four, the author) | All four in the numbers from the start; the two near nations fully written first, the two far ones as trading and warring partners with fewer scenes | Six feuds and four peoples is the largest writing cost in the game |
| "About forty named settlers over three waves" | Twelve named at landing, each wave adding named people to a cap of forty. The eight places first; the rest have temper and faction but no trade bonus | The gate measured eight and they carry 18.8 points of win rate. Forty at once on a phone is a list, not a cast |
| "The governorship: offices, council, petitions" carried over from House of Adalia | Designed here, in the feature loop, after the slice | It does not exist in House of Adalia's code (`KILLGATE.md`). The gate has no council and passes without one |
| "No succession test yet" in the first playable | Kept out of the first playable, but the engine is built for the whole life | The win cannot be judged in ten years; the gate ran the whole life |
| "The code read" in the first playable | `KOAD1.` only | Section 9 |

## 11. Risks carried from the kill gate

Each with its number (round 3, 1,000 seeds an arm, ±1 SE) and what the design
does about it. None is tuned away.

| # | Risk | Number | What the design does |
|---|---|---|---|
| R1 | A late ship barely matters in the first ten years, which is the first playable | 4.1 ±0.8 points at ten years; 35.9 ±1.7 over a life | The ship carries what cannot be stockpiled: named people, letters, the verdict. Measured again when followers are in |
| R2 | Both near nations hostile on landing is close to a lost game, 15% of starts | 13.0% to 17.8% wins, against 40% to 50% | The start shows the tempers before the charter is chosen. Whether this is a hard start the player picks or a fault to tune is **for the author** (section 14) |
| R3 | Answering an ally's call is slightly the wrong choice | -2.8 ±1.3 points | The call must buy something of its own: a say in the terms, warriors owed in return. A frame before it is built |
| R4 | Nursing the neighbours' sick costs wins | -4.5 ±1.4 points; ties +13.9 | The tie has to buy what the SPEC says it buys: a healer, corn in a famine, a marriage. A frame before it is built |
| R5 | Mutiny ends a third of careful lives and morale is one number | 33% in office or after | Factions among named followers replace the one number. This is the largest piece of design not yet done |
| | One fixed split of hands is the best fixed split on half of seeds | 54% | Accepted: a thinking governor beats it by 11 points |
| | 114 people starve in a careful life | | The cost arrives through the named. Watched in playtest, not tuned |

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
| **1. The engine port** | `src/game/colony/` in TypeScript from the gate model; numbers in YAML; the bot and `check` ported; saves | The port reproduces round 3's tables within their error on the same seeds. The prototype is then retired |
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

1. **Approve this, or mark what is wrong.** Phase 1 is the port and touches no
   words and no look, so it can start on a yes to sections 3 to 5.
2. **The hostile start (R2).** A start the player can see and choose, or a
   fault to tune out?
3. **The canon sheet.** Four nations, six possible feuds, a coast. Nothing is
   named until it exists; Phase 4 cannot start without it.
4. **A title.**
5. **House of Adalia's code (section 9).** Leave it out of the first playable?

## 15. Decisions log

Newest first. The author's words are quoted; the SPEC's table holds the same
decisions in full.

| Date | Decision |
|---|---|
| 2026-11-23 | Design proposal written; four nations; the war frame accepted. "Go with recommendations and suggestions. Expand nations to 4 total, 2 near and 2 a bit further". Measured: kill gate round 3, 30,000 runs, careful 30.2 ±1.5%, careless 1.7 ±0.4% |
| 2026-11-23 | Politics, a named cast and war into the gate. "Go with recommendations, also outline how military actions and play out will work along the other systems of trade and diplomacy". Measured: round 2, 29,000 runs |
| 2026-11-22 | Scaffolded (shape C, the story engine); kill gate round 1, 20,000 runs: two claims failed |
