# Frame: war, beside trade and diplomacy

Status: **accepted to be built and measured, 2026-11-23.** The author, shown
this frame: "Go with recommendations and suggestions. Expand nations to 4
total, 2 near and 2 a bit further". The rule, the three beats, parley, the
hidden strength of a town and the captain's temper are accepted on that
instruction. Nothing is on a screen. The numbers side has been through round 3
of the kill gate (`docs/KILLGATE.md`); what is measured and what is still only
designed is marked below.

## The request

The author, 2026-11-23: "outline how military actions and play out will work
along the other systems of trade and diplomacy".

## The problem

Round 1 of the gate had one military rule: a hostile nation attacks in winter,
the colony's walls and powder stand it off or do not. The governor never
started a fight, never chose how one was fought, and war touched trade and
diplomacy only by closing them. Trading was the right answer on 91% of seeds
because nothing else was a policy; it was just the absence of one.

The failure this frame guards against is the usual one: a battle screen bolted
on beside the game, with its own resources and its own logic, that the rest of
the colony does not feel. The Company's first prototype had exactly that
(raiding priced below upkeep and 100% fatal, found by its kill gate).

## The design rule

**War is the third way of dealing with a neighbour, and it spends what the
other two spend.** There is no army separate from the colony. The men who
march are the hands that would have ploughed. The powder is the powder that
hunts, salutes and buys friends. The goods that ransom a captive are the goods
that buy corn. Every military choice shows, before it is made, what it costs in
trade and what it costs in standing with each nation and with the backers.

Three consequences follow, and each is a rule for the build:

1. **No fight without a reason the player can read.** A nation attacks because
   its tie has fallen below war, and the screen says why it fell: land, a raid
   remembered, guns sold to its rival, a call answered against it.
2. **The world fights by the same rules.** The four nations have feuds of their
   own. They raid each other for the same reason the colony raids (hunger),
   call their allies out, and make terms when they are losing.
3. **A battle is short and decides something else.** No fight is longer than
   three decisions, and what it changes is a tie, a store of corn, a list of
   the living, and a grudge.

## The pieces

### 1. Who fights

| | Where they come from | What they cost | In the numbers model |
|---|---|---|---|
| Soldiers | The letter home. The Crown sends them cheaply, the company dearly | Rations, and half a hand each: they guard more than they dig | Yes |
| The trained band | The colony's own men, drilled | Hands on the watch every summer; the drill fades if it stops | Yes: the sixth job |
| Allies | A pact with one nation | Trade kept up, calls answered, and the other nation's enmity | Yes |
| The captain | One named settler | A temper of his own (see "What a captain does") | Yes, as a bonus only |

The colony's strength behind its walls and its strength in the field are two
numbers from one set of functions (`defenceOf`, `forceOf` in the model). The
screen shows them beside what each nation could send against the wall and what
each could put up at home. The fight resolves with the same four numbers
(game-building rule 1).

### 2. The watch: the sixth job

The spec's first playable has six jobs and names five. The sixth is **the
watch**: men under arms through the summer. It does two things.

- **It covers the field.** A hostile nation does not need to storm the wall to
  starve the colony; it picks off men at the plough. Uncovered, food and cargo
  work lose 35% of the summer and up to three men. Eight men under arms in a
  hundred covers it.
- **It drills.** Each summer on the watch raises the trained band; a summer off
  it loses a tenth.

Measured in round 3: keeping no watch costs 9.8 ±1.3 points of win rate.

### 3. The magazine

Powder is still the clock. It is spent five ways and the screen should list all
five each winter beside the stock: hunting, standing off an attack, an
expedition (5 kegs), an ally's call (3 kegs), and as a gift or a sale to a
nation. A keg sold arms that nation in every later fight, against the colony
and against its rival.

### 4. What the governor can order

One military order a summer. Winter is for standing to.

| Order | When | Costs | Does to trade | Does to diplomacy | In the model |
|---|---|---|---|---|---|
| **Keep the watch** | Every summer, as a share of hands | Hands | Keeps cargo and food work whole under a hostile neighbour | None | Yes |
| **Stand to** | When attacked (winter) | Powder by the size of the attack; lives if the wall goes | A breach loses stores | A repulse earns a little respect | Yes |
| **Raid for corn** | Any summer | 3 kegs, a few men | Corn now. Ends trade with that nation | Tie -50, a grudge that lasts decades. Its rival approves if their feud is hot | Yes |
| **March on a town** | Only on a nation already at war with the colony | 5 kegs, the men for a summer | Their corn; opens the road again | Forces them back from war. A grudge all the same | Yes |
| **March with an ally** | When the ally calls, or on the ally's rival | 3 to 5 kegs, men | The ally's corn at six tenths the price | Binds the colony to a side: the rival's tie -20 | Yes |
| **Refuse the call** | When the ally calls | Nothing today | Loses the cheap corn | The pact ends, tie -20 | Yes |
| **Escort the traders** | A trading season | Soldiers off the wall | Protects furs and men on the road | Seen as a threat by a wary nation | Proposed |
| **Hold a blockhouse** | Once land is bought or taken | Men garrisoned away, powder split | A trading post; a second place to lose | A claim on the land, read as one | Proposed |
| **Parley** | With a nation at or near war | 8 goods; in the game also hostages or a marriage | A truce long enough to buy land | Three years' truce; the grudge stays. A nation lately beaten listens, one long wronged does not | Yes (goods only) |

### 5. How a fight plays out

Three beats, one order each. Each order states what it does and what it costs;
it never promises a result (the workshop's rule for combat). The roll moves the
odds by about a fifth; it never decides what beats what. Handing the fight to
the captain uses the same resolver with his choices.

| Beat | Orders | What the order trades |
|---|---|---|
| **The approach** | *By stealth*: needs the country ranged, or an ally's guide. *In force*: drums and colours, no surprise, and they may ask terms before a shot. *Wait behind the wall*: defence only | Surprise against a way out. Ranging and allies pay here |
| **The meeting** | *Volley and hold*: heavy on powder, light on lives. *Close with steel*: light on powder, heavy on lives. *Fall back*: give up the object, keep the men | The magazine against the muster roll |
| **The morning after** | *Press it*: burn the corn, take captives. *Offer terms*: tribute, hostages, the road reopened. *Withdraw* | Plunder now against the grudge later |

The result is one of five bands of the ratio between the two strengths: routed,
thrown back, stood off, carried, overwhelmed. Between bands, what changes is
who is dead, how much powder is left, and what the nation remembers.

Named settlers are in each beat. A fight is where the colony loses people it
cannot write home for, and round 2 measured what that is worth: a colony whose
eight named settlers cannot die wins 15.0 ±1.3 points more often.

### 6. What a captain does (proposed)

The captain is a named follower with a trade, a temper and a faction, as the
spec has it. In the model he is a 15% bonus. In the game his temper should be
able to override the third beat: a hard man burns the town when told to offer
terms; a cautious one falls back when told to hold. The player picks the
captain knowing this. It makes "who do I send" a decision, and it is the
gentlemen-who-will-not-dig problem carried into war.

### 7. How it joins the other two systems

**Trade.** Friendship has a price that rises with the colony: a trading season
wins no tie unless the goods given keep pace with the colony's size (a fortieth
of a good a head a year in the model). Trade needs the road open, so a hostile
nation costs furs as well as safety. An ally sells corn cheaper. Powder is a
trade good and a weapon in the same keg.

**Diplomacy.** There are four nations, two near and two further off, and each
pair has a feud of its own: six of them, different on every start. What the
colony gains with one nation it loses with that nation's enemies, in
proportion to how hot their feud is. The far nations come to the wall half as
often, hold the best furs, and are harder to reckon before the country is
ranged. That makes three stances, not one:

- **Trade with all.** Best while the feuds are cold. Where one is hot, each
  season's gain with one side is nearly cancelled with the other. The price of
  friendship is shared among everyone traded with, so four friends are thin ones.
- **Take a side.** A pact with one nation. The colony goes on trading with
  anyone who is not that nation's enemy. The ally's warriors behind the wall
  and on the march (against his own enemies only), cheap corn, and the rival's attacks come half again as often. An ally
  who grows much stronger than his rival begins to name a tribute.
- **Keep apart.** While the nations are busy with each other they leave a neutral
  colony alone, in proportion to the feud. No furs, no corn, no fevers from the
  trading season, and no one to call on.

**The backers.** A carried expedition pleases the Crown (the flag is seen to be
kept) and costs favour with a company (powder and men spent on no cargo).

**Sickness.** A nation weakened by a fever is easier to march on and easier to
make a friend of by nursing. That choice should be offered in the same scene.

**Memory.** Every raid, every burned town and every call answered leaves a
grudge that fades at one part in a hundred a turn. A raid in year two is two
thirds there in year twenty.

## A worked example

The figures are the model's own, from `defenceOf`, `strengthOf`, `forceOf`,
`homeOf` and `allyMarchOf` in `prototypes/killgate/model.js`.

Year six. The colony is 110 people, 10 of them soldiers, the trained band
barely drilled, the wall at 2, the country a third ranged. The larger near
nation's tie is -70 after a raid for corn in the second winter. The larger far
nation's is +38, and those two have been at feud for years.

The screen shows: behind the wall the colony can stand off 43. The near nation
could send 83, give or take three tenths. It will come this winter or next and
the wall will go.

- **Trade** with that nation is closed: it will not trade below -10.
- **Parley.** Eight goods. Its grudge is long and it has not been beaten: about
  one chance in six of a truce, and that with the interpreter alive.
- **A pact with the far nation** puts 53 of its warriors behind the wall: 96
  against 83. It costs the near nation's tie a further slide every season the
  pact is kept, and a call every few years.
- **March with them on the near nation's town.** The colony's field strength is
  25; the ally brings 26; the town can put up 29, give or take a fifth. But the
  country is a third ranged, so the governor's reckoning of that 29 may be out
  by 10 either way. Fifty-one against a true 35 at worst is carried. Without
  the ally, 25 against 29 is not, and a governor whose reckoning said 19 would
  have marched. Five kegs from the magazine either way. Carried, the town is
  beaten: now it will listen to a parley.
- **Keep apart and build the wall** from 2 to 6 raises the 43 to 57, still
  short of 83, and takes a fifth of the hands for several summers.

The march and the parley are one plan, in that order. That is the join between
war and diplomacy the frame is after.

## What the numbers say (round 3, 1,000 seeds an arm, ±1 SE)

| Question | Result |
|---|---|
| Is one way of dealing with the neighbours simply right? | No. Best on a seed: trade and parley 24%, take a side 21%, side and raid his enemies 18%, trade with all 15%, trade and sell powder 11%, keep apart 10%, raid 1% |
| Is a pact worth having without marching? | No: 29.2 ±1.4% against 30.2 ±1.5% for trading with all |
| Is marching with an ally worth it? | Yes: +9.1 ±1.6 points over a pact that never marches. It is the strongest single policy measured: 38.3 ±1.5% |
| Is parley worth its goods? | Yes: +4.3 ±1.1 points, from about two parleys and one truce a life |
| Does the watch matter? | Yes, since round 3: no watch costs 9.8 ±1.3 points |
| Can a march be lost? | Yes, since round 3: 0.30 routs in 2.91 marches a life |
| Is marching without an ally worth it? | Not measurably: +1.4 ±1.1 |
| Does answering an ally's call pay? | No: 2.8 ±1.3 points *worse* than refusing |

## Faults fixed since the outline

1. **The expedition had no risk.** The governor's reckoning of a town is now
   wrong by up to half until the country is ranged. Ranging has a military use.
2. **The watch was nearly decoration.** Under a hostile neighbour with no watch
   kept, the summer's work loses 35% and men are picked off at the plough.
3. **A hostile neighbour had no way out.** Parley is in.
4. **The nations could be fought to nothing.** A fight now cools the feud, and
   a nation at half its strength makes peace.

## Faults still open

1. **Answering an ally's call is the wrong choice by a little.** It costs
   powder, men and another nation's enmity, and all it buys is the pact, which
   is worth nothing unless the colony also marches. The call needs to buy
   something of its own: a say in the terms, a share of what is taken, the
   ally's warriors owed in return.
2. **Marching alone does nothing measurable.** The colony is rarely strong
   enough to take a town by itself, which is true to the period and makes the
   ally the point. Left as it is.
3. **Both near nations hostile is still close to a lost game:** 13.0% to 17.8%,
   against 40% to 50% with neither.
4. **Not modelled:** the three beats (the model resolves a fight in one step,
   always pressed), the captain's temper, escorts, blockhouses, hostages and
   marriage as terms. These are for the engine and the content.

## Still for the author

1. The four nations' names, and what each pair's quarrel is about. Six feuds is
   a lot of history; some pairs may simply have none.
2. Whether a marriage as a term of peace is the governor's own, a child's, or a
   follower's.

## History, as far as it shaped this

From memory and unchecked, as `SPEC.md` warns: the early English and French
colonies fought with a handful of soldiers and a trained band of settlers,
behind palisades, short of powder; raided their neighbours' corn in hungry
years; and survived in part by taking a side in wars that were already going on
when they landed. Peace was made by hostages and by marriage as often as by
battle. None of this has been checked against a source, and no number here
comes from one.
