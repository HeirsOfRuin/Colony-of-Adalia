# Kill gate: results

**Where the build is (2026-11-23):** Stage 2 of the game-building workflow, two
rounds run. The repo is scaffolded (Stage 4's instruments exist, with the kit's
placeholder story in them). No design document is written, no screen is drawn
and no scene is written. **The next step is the author's: read round 2 below,
`docs/FRAME-war.md`, and the questions at the end of each.**

The kill gate is a numbers-only model of one governor's colony: ships, hands,
food, powder, two nations and their feud, war, sickness, eight named settlers,
the backers, the governor's death and the ten years after it. No names of
places or peoples, no prose, no UI. It answers the question `SPEC.md` set: are
the decisions interesting as a table of numbers, and do the eight claims under
"Proof before screens" hold?

Round 2 is the current model and the current verdict. Round 1 is kept below it
as the record: its tables are from the model as it was on 2026-11-22 and
`npm run gate` no longer reproduces them.

## Round 2 (2026-11-23): no claim plainly fails; two are not yet clean

The author, shown round 1: "Go with recommendations, also outline how military
actions and play out will work along the other systems of trade and diplomacy".
The recommendation was to deal with the two failed claims first: politics
between the nations (claim 3) and a small named cast so that hunger costs
something (claim 4). Both are in. So is a military layer, whose design is
`docs/FRAME-war.md`.

29 arms × 1,000 seeds = **29,000 runs**, every arm on the same seeds, ±1 SE.

| # | Claim | Round 1 | Round 2 | The number |
|---|---|---|---|---|
| 1 | The wait is the game | Half | **Holds over a life; still thin at ten years** | Perfect ships beat real ships by 27.3 ±1.7 points of win rate (was 8.7), but by 3.5 ±0.6 at ten years. Ordering ahead beats ordering for today by 35.2 ±1.5 |
| 2 | Powder is a clock | Holds | **Holds** | Hunting every winter: 141 starved a life against 173, and 1.64 breaches against 1.04. Wins 39.6 against 38.6 |
| 3 | The neighbours are not a hazard table | Fails | **Improved, not clean** | Best on a seed: trade with both 34%, trade and sell powder 23%, take a side 21%, side and raid the rival 14%, keep apart 7%, raid 2%. Trading was 91% |
| 4 | No best job | Fails | **Improved, not clean** | No fixed split beats the careful rule any more (the best, 60% on food, wins 27.4% against 38.6%). But 60% on food is still the best fixed split on 58% of seeds (was 79%) |
| 5 | The middle is not dead | Holds, by a proxy | **Holds, by the same proxy** | Years ten to twenty: 7.4% of turns with nothing pressing, 68.8% with two things or more |
| 6 | Winning is reachable and uncommon | A little easy | **Holds** | Careful 38.6 ±1.5%. Careless 1.7 ±0.4% |
| 7 | Crown and company both worth choosing | Holds | **Holds** | Crown 40.8%, company 38.6%, gap 2.2 ±1.8 (noise). Company best on 61% of seeds |
| 8 | Sickness cuts both ways and ends nobody | Holds | **Holds** | Both peoples hit in 91.3% of lives. Sharing cures: ties +17.1 ±0.8; no effect on winning (-0.1 ±1.4) |

**The careful governor now:** alive and in office at year ten in 96.1 ±0.6% of
lives; wins 38.6 ±1.5%. He ends by mutiny after his death 26%, recalled 18%,
mutiny in office 10%, abandoned after his death 6%.

### What changed in the model

Each is a rule the real engine would have to keep. Numbers are in `data.js`.

1. **The nations have a feud of their own** (0 to 100, different on every seed,
   drifting). Above 55 they fight. What the colony gains in standing with one
   it loses with the other, in proportion to the feud.
2. **Friendship has a price that grows with the colony.** A trading season wins
   no standing unless the goods given keep pace with the colony's size.
3. **A pact.** With a nation whose tie is 30 or better: its warriors behind the
   wall, corn at six tenths the price, its rival's attacks half again as
   likely, and a call to its war every year or two. An ally who outgrows his
   rival by six tenths names a tribute.
4. **Neutrality is worth something.** While the two fight each other they leave
   a colony with no pact alone, in proportion to the feud.
5. **The watch,** a sixth job: men under arms cover the field hands against a
   hostile neighbour and drill the settlers.
6. **The expedition:** the one fight the governor starts, on a nation already
   at war with the colony, with an ally's warriors if there is a pact.
7. **Eight named settlers,** one to a place (surgeon, smith, carpenter,
   captain, interpreter, minister, husbandman, factor), each worth a stated
   bonus. They die at the rate everyone dies. A replacement is asked for in the
   letter and found one time in two.
8. **Food takes fewer hands.** In round 1 the year's food took more than every
   hand the colony had until the fields were built up, so there was nothing
   left to choose with. It now takes about two hands in three at landing and
   one in three with the fields built. The company's demand, the nations' size
   and the backers' budget were tightened to keep the colony as hard to hold.
9. **A mutiny after the governor's death is a loss.** In round 1 a colony that
   turned on his successor still counted as standing.
10. **The best-trained deputy decides as the governor would four turns in
    five,** not five in five. A trained deputy is now worth 19.2 ±1.7 points of
    win rate (was 10.7).

### Round 2 tables

Endings are % of runs; `+` means after the governor's death.

**The neighbours (claim 3)**

| Dealings | Ten years | Win | Attacks | Breaches | Years in a pact | Endings |
|---|---|---|---|---|---|---|
| Trade with both | 96.1 ±0.6 | 38.6 ±1.5 | 1.9 | 1.04 | 0 | stands 39, mutiny+ 26, recalled 18, mutiny 10 |
| Trade, sell powder when hungry | 96.2 ±0.6 | 36.1 ±1.5 | 2.2 | 1.39 | 0 | stands 36, mutiny+ 25, recalled 20 |
| Take a side | 95.4 ±0.7 | 28.2 ±1.4 | 6.0 | 2.19 | 12.5 | stands 28, mutiny 23, mutiny+ 23, recalled 18 |
| Take a side and march with the ally | 95.3 ±0.7 | 38.2 ±1.5 | 4.0 | 1.66 | — | stands 38, mutiny+ 23, mutiny 18, recalled 14 |
| Take a side, raid the rival | 78.2 ±1.3 | 23.0 ±1.3 | 9.4 | 4.43 | 13.4 | mutiny 43, stands 23, mutiny+ 15 |
| Keep apart | 92.5 ±0.8 | 13.9 ±1.1 | 3.3 | 2.05 | 0 | recalled 37, mutiny+ 22, mutiny 17, stands 14 |
| Raid when hungry | 41.3 ±1.6 | 1.5 ±0.4 | 5.9 | 5.66 | 0 | mutiny 51, overrun 31 |

By the feud at landing (win %):

| Feud | Seeds | Trade with both | Take a side | Side, raid the rival | Keep apart |
|---|---|---|---|---|---|
| Cold (under 40) | 375 | 42.4 ±2.6 | 30.9 ±2.4 | 16.8 ±1.9 | 11.7 ±1.7 |
| Hot (over 60) | 354 | 34.7 ±2.5 | 26.6 ±2.3 | 31.1 ±2.5 | 13.6 ±1.8 |

The feud does what it was put in to do: siding and raiding the rival nearly
doubles when the two nations are at each other's throats, and trading with both
loses eight points. It does not yet make keeping apart or plain raiding a
colony anyone would choose.

**The hands (claim 4)**

| Split | Ten years | Win | Endings |
|---|---|---|---|
| The careful rule | 96.1 ±0.6 | 38.6 ±1.5 | stands 39, mutiny+ 26, recalled 18, mutiny 10 |
| Plough: 60% food | 96.5 ±0.6 | 27.4 ±1.4 | recalled 42, stands 27, mutiny+ 18 |
| Build: 35% food, 35% building | 67.0 ±1.5 | 13.2 ±1.1 | mutiny 48, mutiny+ 26 |
| Cargo: 35% food, 40% cargo | 70.3 ±1.4 | 7.8 ±0.8 | mutiny 66 |
| Arms: 35% food, 24% on the watch | 64.9 ±1.5 | 6.9 ±0.8 | mutiny 67 |
| Wall: 35% food, 33% walls | 61.6 ±1.5 | 5.6 ±0.7 | mutiny 68 |
| Even sixths | 32.6 ±1.5 | 2.2 ±0.5 | mutiny 63, abandoned 24 |

Best fixed split on a seed: plough 58%, build 20%, cargo 12%, arms 6%, wall 3%,
even 2%. With the careful rule in the comparison: careful 47%, plough 27%.
The governor who only ploughs is now recalled 42% of the time. In round 1 he
was recalled 1% of the time and won more than anyone.

**War** (design and the reading of these in `docs/FRAME-war.md`)

| | Win | Attacks | Breaches | Killed | Marches (carried, routed) |
|---|---|---|---|---|---|
| Careful | 38.6 ±1.5 | 1.9 | 1.04 | 19 | 0 |
| Careful, marches on a hostile neighbour | 40.2 ±1.6 | 1.4 | 0.84 | 15 | 1.02 (1.00, 0.00) |
| Careful, keeps no watch | 36.5 ±1.5 | 1.0 | 0.95 | 20 | 0 |
| Takes a side, answers the call | 28.2 ±1.4 | 6.0 | 2.19 | 34 | 0 |
| Takes a side, refuses the call | 27.9 ±1.4 | 3.5 | 2.03 | 30 | 0 |
| Takes a side and marches | 38.2 ±1.5 | 4.0 | 1.66 | 33 | 3.70 (3.64, 0.00) |

Paired gaps in win rate: marching with an ally over a pact that never marches,
**+10.0 ±1.2**. Marching alone over not, +1.6 ±0.7. No watch, -2.1 ±1.3 `~`.
Answering the call over refusing it, +0.3 ±1.0 `~`.

**The named few**

| | Win | Starved a life | Named dead | Sent to replace | Places filled at the end |
|---|---|---|---|---|---|
| Careful, eight named | 38.6 ±1.5 | 173 | 7.8 | 3.5 | 3.7 of 8 |
| Careful, nobody named | 24.0 ±1.4 | 148 | 0 | 0 | 0 |
| Careful, the named cannot die | 53.6 ±1.6 | | 0 | | 8 of 8 |
| Plough, eight named | 27.4 ±1.4 | 74 | 5.6 | 1.7 | 4.1 of 8 |

Having the eight is worth 14.6 ±1.5 points. Their being mortal costs
**15.0 ±1.3** points. That is the price of a death in this model, and round 1
had none: every settler was a share of a number.

**The start**

Win %, by the near nation's temper on landing:

| Temper | Seeds | Trade with both | Take a side | Side and march | Keep apart |
|---|---|---|---|---|---|
| Below -15 | 374 | 12.0 ±1.7 | 8.8 ±1.5 | 13.4 ±1.8 | 5.6 ±1.2 |
| -15 to 10 | 327 | 53.5 ±2.8 | 31.2 ±2.6 | 44.6 ±2.7 | 15.6 ±2.0 |
| Above 10 | 299 | 55.5 ±2.9 | 49.2 ±2.9 | 62.2 ±2.8 | 22.4 ±2.4 |

**Crown and company, the wait, powder, sickness, the middle:** the numbers are
in the verdict table above; `npm run gate` prints the full rows.

### What round 2 found and fixed on the way

1. **The expedition was decoration.** As first written it needed half as much
   again as a whole nation could put up at home; `check.js` reported it changed
   5 seeds in 60 and failed the build. An expedition now falls on one town, and
   an ally's warriors march with it.
2. **"Nobody named" was not a clean comparison.** The letter kept asking for
   specialists and the empty places filled up. The arm now has no places.
3. **A measure that lied.** Sorting lives by how hungry they were showed the
   hungriest third winning most (55% against 22%): long-lived colonies simply
   have more winters to starve in. Dropped, and replaced by the direct test in
   the table above (the named cannot die).

### Faults open after round 2

Letters carry over from round 1 where the fault is the same one.

**A. Trading is still the safest answer** (claim 3). It is no longer the only
one: a third of seeds go to a pact. But keeping apart wins 13.9% and is best on
7% of seeds, and plain raiding is a way to lose. Keeping apart is recalled 37%
of the time: with no trade there are no furs and the company's demand cannot be
met by hands alone.

**B. Food-first is still the best thing to do without thinking** (claim 4):
best fixed split on 58% of seeds. Walls, arms and cargo are each best on 12% or
fewer. It no longer beats thinking.

**C. The ship's lateness is thin in the first ten years** (3.5 ±0.6 points),
which is the whole of the first playable. Over a life it is 27.3.

**D. The start still decides too much.** A hostile nearest neighbour: 12.0
±1.7% against 55.5 ±2.9%. Siding with the far nation and marching does not
rescue it (13.4 ±1.8%). Not addressed in round 2; the author has not ruled on
whether this should be a harder game or a different one.

**E. Mutiny is still the commonest end,** now mostly after the governor's
death (26%). Morale is still one number.

**G. Claim 5 is still a proxy.**

**I. Three military decisions do nothing measurable:** the watch, answering an
ally's call, and marching without an ally. And no march is ever lost. Detail
and proposed fixes in `docs/FRAME-war.md`.

**J. Sharing cures no longer helps the colony win** (-0.1 ±1.4; it was +4.6 in
round 1). It still improves ties by 17. If nursing the neighbours is to be the
way the deepest ties are made, the tie has to buy something.

**K. Hunger itself is still cheap; it is the named who are dear.** 173 starve
in a careful life. The cost of that now arrives through eight people. A colony
of forty named settlers, as the spec's first playable has, would carry it
further; the model cannot say how far.

Closed since round 1: **F** (the win was a little easy: now 38.6% against a
third). **H** in part (a named cast is in; factions, marriage, a third nation
and the dynasty code are not).

### Questions for the author after round 2

1. **Is this enough to write the design?** No claim plainly fails. Claims 3 and
   4 are not clean. My recommendation: yes, start `docs/DESIGN.md`, and carry A,
   B, D and I into it as named risks with their numbers, because what is left of
   each is content (the nations' politics, parley, the captain) more than
   arithmetic, and a third round of tuning would be tuning a bot.
2. **The war frame** (`docs/FRAME-war.md`) has four questions of its own.
3. **The hostile start** (fault D) is still yours to rule on.
4. **The canon sheet.** The feud between the two nations is now load-bearing.
   It needs names and a quarrel before a scene is written.

## Round 1 (2026-11-22): five claims held, one half-held, two failed

*The record of the first round. Superseded by round 2 above.*


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

## Round 1: how it was measured

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

## Round 1: the tables

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

## Round 1: what the gate found and fixed on the way

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

## Round 1: faults open at the time

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

## Round 1: questions put to the author

*Answered 2026-11-23 for questions 2 and 3 ("Go with recommendations"); 1 and 4 are still open.*

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

