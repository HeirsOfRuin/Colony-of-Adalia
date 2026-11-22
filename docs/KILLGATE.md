# Kill gate: results

**Where the build is (2026-11-22):** Stage 2 of the game-building workflow, first
round run. The repo is scaffolded (Stage 4's instruments exist, with the kit's
placeholder story in them). No design document is written, no screen is drawn
and no scene is written. **The next step is the author's: read the verdict and
the four questions at the end.**

The kill gate is a numbers-only model of one governor's colony: ships, hands,
food, powder, two nations, sickness, the backers, the governor's death and the
ten years after it. No names, no prose, no UI. It answers the question
`SPEC.md` set: are the decisions interesting as a table of numbers, and do the
eight claims under "Proof before screens" hold?

## Verdict: not passed yet. Five claims hold, one half-holds, two fail

| # | Claim | Verdict | The number |
|---|---|---|---|
| 1 | The wait is the game | **Half** | Ordering ahead beats ordering for today by 30.4 ±1.5 points at ten years. But real ships against perfect ships is only 2.4 ±0.9 points at ten years (8.7 ±1.7 over a life) |
| 2 | Powder is a clock | **Holds** | Hunting every winter: 179 starved a life against 229, and 1.89 walls breached against 0.76. Wins 45.1 against 41.8, neither clear |
| 3 | The neighbours are not a hazard table | **Fails** | Three different colonies, yes. But trading is the best choice on 91% of seeds; raiding on 2%, ignoring on 8% |
| 4 | No best job | **Fails** | A fixed 60% of hands on food wins 51.0% and is the best fixed split on 79% of seeds. It also beats the careful rule (41.8%) |
| 5 | The middle is not dead | **Holds, by a proxy** | In years ten to twenty, 2.7% of turns have nothing pressing; 79.2% have two things or more |
| 6 | Winning is reachable and uncommon | **Holds, a little easy** | Careful 41.8 ±1.6% (the target was about a third). Careless 3.7 ±0.6% |
| 7 | Crown and company both worth choosing | **Holds** | 43.9% against 41.8%, a gap of 2.1 ±1.9 (noise). Company is best on 54% of seeds, Crown on 46% |
| 8 | Sickness cuts both ways and ends nobody | **Holds** | Both peoples are hit in 89.3% of lives. The smallest a nation ever got was 151 of 220. Sharing cures: ties +15.8 ±0.9, wins +4.6 ±1.4 |

`SPEC.md` says: "If claim 1 fails, the game is House of Adalia with trees and
should stop here." It has not failed. The year between the letter and the
answer is plainly the game: a governor who orders for today instead of for next
year loses 36 points of win rate. What is weak is the other half, the ship
being late, short or lost. A governor who orders a second year's stores "in
case" is almost immune to it. Whether that is the game working (insurance is
the skill) or a hole in it is the author's call, and it is question 1 below.

The two failures are real and are not tuned away. Both say the same thing:
**two of the governor's five choices have a right answer.** Trade with the
neighbours, and put the hands on food. A screen built on this model would ask
the player questions the numbers have already answered.

## How it was measured

All files are in `prototypes/killgate/`. `rng.js` is game-scaffold's and
`stats.js` is game-measure's, both copied unchanged.

| File | What | Command |
|---|---|---|
| `data.js` | Every tunable number. All tuned, none sourced | |
| `model.js` | The rules. Deterministic: named RNG streams, no `Math.random` | |
| `policies.js` | Fixed policies, each a written rule, built from parts | |
| `gate.js` | The eight tables | `npm run gate` (1,000 seeds per arm) |
| `check.js` | Determinism, invariants, and that no part is decoration | `npm run gate:check` |
| `trace.js` | One run, turn by turn | `npm run trace -- 5 careful company` |

The tables below are 20 arms × 1,000 seeds = **20,000 runs**, every arm on the
same seeds. Every rate carries one standard error (±). A gap between two arms is
paired on seeds and counts as real past twice its error; a gap that does not is
marked `~`.

`check.js`, 60 seeds: 480 runs byte-identical when repeated, all ended, every
clock moved, every number finite. Every policy part and world switch changes
the end state: the weakest are "full rations" and "the successor's fallback"
(24 of 60 seeds each) and "never hunt" (33 of 60).

**The two policies the spec names.**

| | Careful | Careless |
|---|---|---|
| Hands | Food for the year first, then walls to stand off the worst neighbour with a third to spare, then the backers' cargo, then building. Cargo jumps ahead of walls when the company's favour is under 50 | An even fifth to each job |
| The letter | For what will be short a year on, plus a second year in case | For what is short today |
| Neighbours | Trades, buys land, gives a gift where they will not trade yet | Ignores them |
| Powder | Hunts only to fill a hungry winter, keeping half the magazine | Hunts every winter |
| Sickness | Nurses their sick, asks for their healer | Neither |
| Winter | Short rations when the store is thin. Trains a deputy from year six | Full rations. No deputy |

Every other arm is the careful policy with one part swapped.

**What "win" means here.** The governor dies (the hazard rises with age; the
median last turn among those who die in office is 39, about year twenty) or
lays the office down at year thirty. The colony then plays twenty more turns
under a successor who decides as the careful policy with probability equal to
the deputy's training, and as the careless one otherwise. If it is still there,
that is a win. Removed by mutiny or recall, or the colony dead or abandoned, is
a loss. "Ten yrs" is the first-playable window: alive and in office at year ten.

## The tables

Endings are % of runs; `+` means after the governor's death.

### Claim 1: the wait

| Arm | Ten years | Win | People at year ten | Endings |
|---|---|---|---|---|
| Careful, real ships | 93.6 ±0.8 | 41.8 ±1.6 | 147 | stands 42, mutiny 24, abandoned+ 17, recalled 15 |
| Careful, perfect ships | 96.0 ±0.6 | 50.5 ±1.6 | 198 | stands 51, recalled 40, abandoned+ 10 |
| Orders for today, real ships | 63.2 ±1.5 | 6.1 ±0.8 | 94 | mutiny 52, recalled 27, abandoned+ 13 |
| Orders for today, perfect ships | 30.6 ±1.5 | 1.1 ±0.3 | 122 | recalled 85, abandoned+ 11 |

"Perfect ships" is a ship every year, whole and in season. The letter still
takes a year to answer.

- Ahead minus today, real ships: **+30.4 ±1.5** at ten years, **+35.7 ±1.6** wins.
- Perfect minus real, careful: **+2.4 ±0.9** at ten years, **+8.7 ±1.7** wins.
- A ship every year makes the today-orderer *worse* at ten years (30.6 against
  63.2). More ships land more settlers, the company's demand is counted per
  head, and he is recalled 85% of the time. See fault C.

### Claim 2: powder

| Hunting | Win | Hungry winters | Starved | Kegs hunted | Attacks met short of powder | Walls breached | Killed |
|---|---|---|---|---|---|---|---|
| Only when hungry (careful) | 41.8 ±1.6 | 0.48 | 229 | 24 | 0.11 | 0.76 | 12 |
| Every winter to year six | 46.5 ±1.6 | 0.39 | 254 | 65 | 0.28 | 0.93 | 15 |
| Every winter | 45.1 ±1.6 | 0.39 | 179 | 199 | 1.35 | 1.89 | 62 |
| Never | 41.4 ±1.6 | 0.71 | 231 | 20 | 0.09 | 0.73 | 11 |

Best on a seed: early 36%, always 32%, when hungry 16%, never 16%. The trade
the spec asked for is there: the hunter eats better and is caught with an empty
magazine twelve times as often. Nobody wins outright. Note that "only when
hungry" hunts barely more than "never" (24 kegs against 20): the careful rule
is close to not hunting at all.

### Claim 3: the neighbours

| Dealings | Ten years | Win | People at year ten | Worst tie at year ten | Attacks | Breaches | Endings |
|---|---|---|---|---|---|---|---|
| Trade | 93.6 ±0.8 | 41.8 ±1.6 | 147 | -13 | 2.2 | 0.76 | stands 42, mutiny 24, abandoned+ 17, recalled 15 |
| Trade and sell powder when hungry | 93.4 ±0.8 | 38.4 ±1.5 | 146 | -15 | 2.4 | 1.27 | stands 38, mutiny 27, recalled 17 |
| Raid when short of food | 24.8 ±1.4 | 0.6 ±0.2 | 40 | -89 | 6.8 | 6.70 | mutiny 51, overrun 36 |
| Ignore | 72.6 ±1.4 | 7.1 ±0.8 | 111 | -41 | 2.1 | 1.56 | recalled 49, mutiny 29 |

Best on a seed: trade 51%, sell 40%, ignore 8%, raid 2%. They are three
different colonies and they die three different deaths (the raider is overrun,
the one who ignores is recalled for want of furs, the trader is brought down by
his own people). But one of them is simply right. Selling powder does what the
spec said: breaches rise from 0.76 to 1.27.

### Claim 4: the hands

| Split | Ten years | Win | Endings |
|---|---|---|---|
| The careful rule | 93.6 ±0.8 | 41.8 ±1.6 | stands 42, mutiny 24, abandoned+ 17, recalled 15 |
| Plough: 60% food | 92.8 ±0.8 | **51.0 ±1.6** | stands 51, mutiny 28, abandoned+ 18, recalled 1 |
| Build: 35% food, 35% building | 53.4 ±1.6 | 12.6 ±1.0 | mutiny 77 |
| Cargo: 35% food, 40% cargo | 52.5 ±1.6 | 7.0 ±0.8 | mutiny 79 |
| Wall: 35% food, 35% walls | 53.0 ±1.6 | 6.7 ±0.8 | mutiny 79 |
| Even fifths | 33.0 ±1.5 | 5.7 ±0.7 | mutiny 66, abandoned 22 |

Best fixed split on a seed: plough 79%, build 11%, cargo 4%, even 3%, wall 3%.

### Claim 5: the middle

Share of the careful governor's turns with something pressing. "Pressing" is
any of: less than a turn and a half of food in the store, a nation within 15 points of
war, the colony within 5 people of the land it has leave to use, the backers'
favour under 35, the magazine low, morale under 40, a fever.

| Years | Governor-turns | Nothing pressing | One thing | Two or more |
|---|---|---|---|---|
| 0 to 10 | 18,932 | 6.5 ±0.2 | 27.8 ±0.3 | 65.7 ±0.3 |
| 10 to 20 | 12,441 | 2.7 ±0.1 | 18.0 ±0.3 | 79.2 ±0.4 |
| 20 to 30 | 4,862 | 3.5 ±0.3 | 20.4 ±0.6 | 76.1 ±0.6 |

**What this does not show.** It counts pressure, not decisions. A turn with
three things pressing and one obvious answer is still a dead turn, and claims 3
and 4 say some answers are obvious. It also shows a colony that is never at
rest: under 7% of turns in any decade are quiet. That may be the opposite fault.

### Claim 6: winning

| Policy | Ten years | Win |
|---|---|---|
| Careful | 93.6 ±0.8 | 41.8 ±1.6 |
| Careful, no deputy trained | 93.9 ±0.8 | 31.1 ±1.5 |
| Careless | 22.0 ±1.3 | 3.7 ±0.6 |

The careful governor reaches his own death in office in 60.5 ±1.5% of lives,
and of those colonies 69.1 ±1.9% stand ten years later. Training a deputy is
worth **10.7 ±1.6** points of win rate. The win asks what the spec wanted it to
ask: whether the colony needed him.

### Claim 7: Crown or company

| | Ten years | Win | People at year ten | Endings |
|---|---|---|---|---|
| Company, careful | 93.6 ±0.8 | 41.8 ±1.6 | 147 | stands 42, mutiny 24, abandoned+ 17, recalled 15 |
| Crown, careful | 91.3 ±0.9 | 43.9 ±1.6 | 89 | stands 44, abandoned+ 24, mutiny 21, recalled 10 |
| Company, careless | 22.0 ±1.3 | 3.7 ±0.6 | 80 | abandoned 51, mutiny 36 |
| Crown, careless | 18.8 ±1.2 | 2.8 ±0.5 | 35 | abandoned 44, mutiny 41 |

Company is best on 54% of seeds, Crown on 46%. They differ as the spec's table
said they should: the company's colony is two thirds larger at year ten and its
governor is recalled more often; the Crown's is small, keeps its governor, and
fails more often after him.

### Claim 8: sickness

| | Win | Waves on the colony | Waves on the nations | Colony dead of fever | Nations' dead of fever | Smallest a nation ever got | Mean tie at the end |
|---|---|---|---|---|---|---|---|
| Shares cures | 41.8 ±1.6 | 8.4 | 4.1 | 67 | 49 | 151 | -5 |
| Does not | 37.2 ±1.5 | 7.2 | 3.8 | 80 | 80 | 89 | -21 |

The nations start at 320 and 220 people. The "smallest ever" column includes
war losses, so sickness alone does less than it shows.

## What the gate found and fixed on the way

Each of these was a fault in the model, found by a table or by reading one run,
and fixed before the numbers above. They are listed because each is a rule the
real engine has to keep.

1. **One missed ship meant no ship ever again.** The backers decided on next
   year's ship only when a ship called to carry the letter. First run: 2.5
   landings in a whole life. They now decide every summer; with no ship they
   have no letter and load what they think fit.
2. **The colony only ate in winter.** Every colony needed half the food the
   design says, and a careless Crown governor won 64.5 ±3.4% (200 runs). Found
   by reading one run: 99 people, 87 rations, nobody hungry. The summer is now
   eaten out of the store before the harvest is in.
3. **The careful rule starved itself.** It worked out each job's share
   separately and scaled them down together, so a colony needing 74% of its
   hands on food set 55%. Each job now takes from what the one before left.
4. **Powder was not a clock.** Attacks came in summer, behind the ship, so a
   magazine emptied on deer was full again before it was needed. Hunting every
   winter won 53% against 33% (150 runs). Attacks now come in winter.
5. **The dead were replaced free.** A fixed 60% on food starved 369 people a
   life and out-won the careful rule, because the next ship made the number up.
   Settlers now refuse to sail in proportion to last year's deaths. This
   narrowed the fault and did not close it (fault B).
6. **The company asked the impossible from the first summer.** 64% of careful
   governors were recalled (200 runs) with the colony otherwise sound. The
   first four years' cargo is now forgiven on a rising scale.
7. **A comment swallowed two numbers in `data.js`.** The finite-number check in
   `gate.js` caught it on the first run. That check is why it is there.

## Faults still open

**A. Trading has no rival** (claim 3). Nothing in the model makes a seed where
leaving the neighbours alone, or taking their corn, is the better colony. Trade
brings furs for the backers, corn for the winter and land by treaty, and its
only cost is a fever one season in seven. What the spec describes and the model
lacks: a nation that uses the colony against its rival, a trade that binds the
colony to a side, a price for friendship.

**B. Hunger is cheap, and food-first is right** (claim 4). The careful governor
loses 229 people to hunger in a life, in a colony that peaks near 240, and still
wins 42%. A fixed 60% on food beats every other fixed split on 79% of seeds.
Walls, cargo and building never win a seed in ten. The model has no settler
anyone would miss: this is the strongest argument in the numbers for the spec's
named followers.

**C. The ship's lateness barely matters; the company's arithmetic does**
(claim 1). Perfect ships are worth 2.4 points at ten years. And because the
company counts its demand per head, more ships can mean a faster recall.

**D. The start decides too much.** Not one of the eight claims, found by
reading runs. The careful governor's win rate by the near nation's temper on
landing (1,000 runs): below -15, **11.8 ±1.7%** (374 runs); -15 to 10, 53.2
±2.8% (327); above 10, 66.9 ±2.7% (299). One roll before the first turn is
worth 55 points. A hostile neighbour will not trade, so there are no furs, so
the company recalls him.

**E. Mutiny is the careful governor's most common end** (24%). Morale here is
one number pushed down by deaths and missed ships. It has no factions and no
gentlemen with a grievance, and it is the crudest part of the model.

**F. The win is a little easy:** 41.8% against a target of about a third. Left
alone; it will move when A to E are dealt with.

**G. Claim 5 is measured by a proxy,** and the proxy shows a colony with almost
no quiet turns.

**H. The model leaves out** what the spec's first playable includes and a
numbers gate cannot judge: named settlers and their factions, marriage, the
governor's family, a third nation, the dynasty code. None of those is tested.

## What was read in House of Adalia

`SPEC.md` asked for this before the design. Read on branch
`ccr-a949bd8d-5d4llu` of the Knight of Adalia repo, `games/house`.

- **It exports no dynasty code.** Its ending offers the ordinary save code,
  prefix `HOA1.`, with the line "a future game can begin from it"
  (`src/ui/Release.tsx`). That code is the whole save: 13,000 to 21,000
  characters, and its shape is the game's internal state, not a contract. The
  only dynasty contract is `KOAD1.` (`packages/dynasty/src/contract.ts`),
  written by Knight of Adalia.
- **It has no governorship to carry over.** There are no petitions and no
  council in code. What exists is three household officers (steward, captain,
  clerk; `src/game/officers.ts`), filled from old companions, then family, then
  strangers, each worth ±5% on rents, charges or raids. The spec's "the
  governorship: offices, council, petitions, from House of Adalia" has to be
  designed here, not copied.

## Questions for the author

1. **The late ship.** A governor who orders two years ahead is nearly immune to
   a lost ship. Is that the skill the game teaches, or should a missed ship hurt
   whoever you are? The second needs something the letter cannot insure:
   people, news, the backers' patience.
2. **The neighbours.** Trading is always right in this model. The fix is
   politics between the nations, which is content and canon as much as numbers.
   It wants the canon sheet (open question 2 in the SPEC) before a second round.
3. **Hunger.** The numbers say a governor can starve a third of his people and
   win. Named settlers would change that. Should the second round of the gate
   carry a small named cast, so that it can be measured?
4. **The start.** Should a hostile nearest neighbour be a harder game (now: 12%
   against 67%) or a different one?

A second round of the gate follows the answers. `docs/DESIGN.md` is not started
and should not be until claims 3 and 4 hold.
