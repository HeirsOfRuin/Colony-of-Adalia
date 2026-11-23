# Frame: war, beside trade and diplomacy

Status: **outline for the author, 2026-11-23. Not approved, nothing on a screen.**
The numbers side of it has been through round 2 of the kill gate
(`docs/KILLGATE.md`); what was measured is marked below, and what is only
proposed is marked too.

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
2. **The world fights by the same rules.** The two nations have a feud of their
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
  work lose a quarter of the summer. Eight men under arms in a hundred covers it.
- **It drills.** Each summer on the watch raises the trained band; a summer off
  it loses a tenth.

Measured: keeping no watch costs 2.1 ±1.3 points of win rate, which is noise.
See "What the numbers say" below. The watch is the weakest part of this frame.

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
| **Parley** | During any war | Goods, hostages, a marriage | Reopens trade on terms | Ends the war; the grudge stays | Proposed |

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

**Diplomacy.** The nations have a feud. What the colony gains with one it loses
with the other, in proportion to how hot the feud is. That makes three stances,
not one:

- **Trade with both.** Best while the feud is cold. When it is hot, each
  season's gain with one is nearly cancelled with the other.
- **Take a side.** A pact: the ally's warriors behind the wall and on the
  march, cheap corn, and the rival's attacks come half again as often. An ally
  who grows much stronger than his rival begins to name a tribute.
- **Keep apart.** While the two are busy with each other they leave a neutral
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

Year nine. The colony is 130 people, 16 of them soldiers, the trained band half
drilled, the wall at 5. The near nation's tie is -46 after three summers of the
colony spreading onto land it never sold; the far nation's is +38, and the two
have been fighting for two years.

The screen shows: behind the wall the colony can stand off 79. The near nation
could send 106, give or take three tenths. It will come this winter or next,
and more often than not the wall will go.

- **Trade with both** is closed: the near nation will not trade below -10.
- **A pact with the far nation** puts 50 of its warriors behind the wall: 129
  against 106. It costs the near nation's tie another slide every season the
  pact is kept, and a call every year or two.
- **March with them on the near nation's town.** The colony's field strength is
  42; the ally brings 25; the town can put up 49, give or take a fifth. Sixty-
  seven against at most 59 is carried. Five kegs from the magazine. *In force*,
  they may ask terms before a shot and the kegs are saved. *Press it* brings
  home 30 rations and a grudge of 12; *offer terms* brings none of the corn and
  half the grudge. (The beats are proposed; the model resolves the march in one
  step, always pressed.)
- **Keep apart and build the wall** from 5 to 9 raises the 79 to 92, still
  short, and takes a fifth of the hands for several summers that the company's
  cargo also needs.

None of these is free. One of them is too safe: sixty-seven against at most 59
cannot lose, which is fault 1 below.

## What the numbers say (round 2, 1,000 seeds an arm, ±1 SE)

| Question | Result |
|---|---|
| Is trading still simply right? | No longer. Best on a seed: trade with both 34%, trade and sell powder 23%, take a side 21%, side and raid the rival 14%, keep apart 7%, raid 2% |
| Does the feud change the answer? | Yes. With the feud hot at landing, siding and raiding the rival wins 31.1 ±2.5% against 16.8 ±1.9% when it is cold. Trading with both falls from 42.4 to 34.7 |
| Is a pact worth having without marching? | No. Taking a side and only answering calls wins 28.2 ±1.4%, against 38.6 ±1.5% for trading with both |
| Is marching with an ally worth it? | Yes: +10.0 ±1.2 points over a pact that never marches |
| Is the expedition worth it alone? | Barely: +1.6 ±0.7 points, one march a life |
| Does answering the call matter? | Not measurably: +0.3 ±1.0 over refusing |
| Does the watch matter? | Not measurably: no watch costs 2.1 ±1.3 points |
| Does a march ever fail? | Not in the model: 0.00 routs. The bot marches only with a quarter more than the town can put up, and at that margin the roll cannot lose it |

## Faults in this frame, found by the gate

1. **The expedition has no risk.** A cautious rule never loses one. Either the
   roll must be wider, or the nation's strength at home must be partly hidden
   until the country is ranged. The second is better: it gives ranging a
   military use and makes information worth something.
2. **Answering an ally's call is not a decision** in the numbers. The cost
   (3 kegs, a few men, the rival's enmity) and the gain (the pact kept) cancel.
   It needs a real stake: the ally losing its war if the colony stays home.
3. **The watch is nearly decoration.** A quarter of the summer's work is
   evidently not enough of a threat, or eight in a hundred is too cheap.
4. **A hostile nearest neighbour is still a lost game:** 12.0 ±1.7% for trading
   with both, 13.4 ±1.8% for siding with the far nation and marching. War does
   not yet rescue a bad start; parley, which is not modelled, is the missing
   way out.
5. **Parley, escorts and blockhouses are not modelled.** They are the proposed
   half of the table above.

## What the author is asked

1. Is the rule right: war as the third way of dealing with a neighbour, spending
   the colony's own hands, powder and goods, with no separate army?
2. Three beats to a fight, one order each. Enough, or too much for a game whose
   centre is the wait for a ship?
3. Should a captain's temper be able to override an order?
4. The nations' feud is new canon. It needs their names and their quarrel on
   the canon sheet before it is written into a scene.

## History, as far as it shaped this

From memory and unchecked, as `SPEC.md` warns: the early English and French
colonies fought with a handful of soldiers and a trained band of settlers,
behind palisades, short of powder; raided their neighbours' corn in hungry
years; and survived in part by taking a side in wars that were already going on
when they landed. Peace was made by hostages and by marriage as often as by
battle. None of this has been checked against a source, and no number here
comes from one.
