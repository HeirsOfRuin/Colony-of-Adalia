# Frame: war, beside trade and diplomacy

Status: **accepted to be built and measured, 2026-11-23; amended by the
author's answers of 2026-11-24** (section 8, and quoted in `SPEC.md`). Nothing
is on a screen. The numbers side is round 4 of the kill gate
(`docs/KILLGATE.md`); what is measured and what is still only designed is
marked below.

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

### 8. The author's answers (2026-11-24): deeper diplomacy, pawns and equals, ties that pay

> Make it possible to play the hostile nations off each other. Diplomacy should
> be very deep and versatile, since war could be near catastrophe given the
> limited resources. That's not to say don't make it useful, because some
> players would love to replay Jamestown or others and fight off the natives
> who swarm the palisade.

> Allies should be useful pawns if handled right, like most colonizers viewed
> them. Treating them as equals could be good to, but it won't likely lead to
> you being top dog

> Ties should buy easier trade, diplomacy, and support

**The envoy: one errand a summer.** Diplomacy gets its own order beside the
military one, so the two compete for the governor's attention, not his hands.

| Errand | Costs | Does | Can go wrong | In the model |
|---|---|---|---|---|
| **Parley** | 8 goods | A truce with a nation at or near war, three years | Refused; likelier with a long grudge, less likely if a nation he trusts speaks for you | Yes |
| **Incite** | 5 goods, or 2 kegs (which arm him) | Gifts and tales to one nation about another: their feud heats, and if it is hot enough they go at each other this summer. A nation at war with its neighbour is engaged for three turns: a third as likely at the colony's wall, and its men out of the colony's fields | Found out (about one time in seven): the nation talked about turns harder against the colony, and the one used resents it | Yes |
| **Mediate** | 6 goods | Cools a feud between two nations that both like the colony; both credit it | Nothing, but it can cool a feud the colony needed hot | Yes |

The envoy can approach a hostile nation (down to -75), so **two enemies can be
set on each other**, which is the author's "play the hostile nations off each
other". On the palisade shore that is the difference between 14.2% and 36.2%.

**War stays near catastrophe and becomes useful.** Raiding for food wins 3.1%
of lives and ends in the colony overrun 59% of the time. But a wall that throws
back an attack with half as much again to spare is a **bloody repulse**: the
attacker loses more, every other nation thinks better of the colony, and the
Crown is pleased. The Jamestown game, holding the palisade, is the Crown's: its
soldiers are cheap, its ships carry their victuals, and it rewards a flag kept
flying. A Crown fortress under a soldier's background wins 43.9% on the
palisade shore, the best of eight approaches there. A company fortress wins
3.5%: soldiers are the company's dearest freight.

**Two kinds of pact.**

| | Equal | Client (a pawn) |
|---|---|---|
| His calls | Answered with men and powder; each answered call is a march he owes you at full strength | Answered with powder only: his war is your errand |
| His warriors | Behind your wall; on your march against his own enemies, or any enemy when he owes you | On any march you send him on, in front. His dead are his |
| What you take | Corn, plunder | Land: a carried march on a near nation with a client in front takes 18 land |
| What it costs | Your men in his wars | A keg a summer to arm him, and his resentment (the tie falls 2.5 a summer). He sets on your enemies automatically |
| How it ends | Rarely: 65% of pacts last to the end | Often: 47% last. A resentful client breaks it, armed with your powder |
| Measured | 47.7% win; 146 land; the near nations 415 people | 36.8% win; **199 land; the near nations 338 people** |

The author's "won't likely lead to you being top dog" is what the numbers say.
The client is also what the governor's death undoes: his successor cannot hold
a pawn the governor held by fear and powder. That is the trade.

**What a tie buys.** Read through the tie above nothing, out of 100: furs half
as good again from a friend at 100; land up to half price; a parley helped by
the best word among the enemy's friends; an incitement that lands twice as
hard on a nation that trusts the colony; corn in a hungry winter and a few
warriors at the wall from any nation above 25, not only from an ally. Nursing
the neighbours' sick, the deepest tie the SPEC names, no longer costs wins
(+1.6 ±1.4, was -4.5).

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

## What the numbers say (round 4, 1,000 seeds an arm, ±1 SE)

| Question | Result |
|---|---|
| Is one way of dealing with the neighbours simply right? | No. Best on a seed: play them off 32%, equal pact 20%, mediate 15%, parley 11%, client 11%, keep apart 7%, raid 4% |
| Does the landing site change the right answer? | Yes. Sheltered: equal pact best (60.4%). Contested: play them off (45.4%). Palisade: a Crown fortress under a soldier (43.9%), then play them off (36.2%) |
| Is playing them off worth it? | Yes: +13.7 ±1.8 points over no envoy; +22.0 ±1.7 on the palisade. 7.4 incitements a life, 1.1 found out, 5.3 fights set going |
| Is a pawn worth more than an equal? | In land and in the neighbours' weakness, yes (199 land against 146; near nations 338 people against 415). In outlasting the governor, no: -10.9 ±1.6 points |
| Is war a catastrophe? | Raiding for food: 3.1% wins, overrun 59%. Holding a wall: not if it is the Crown's |
| Does the watch matter? | Yes (round 3: no watch costs 9.8 ±1.3 points; not re-measured alone in round 4) |

## Faults fixed since the outline

1. **The expedition had no risk.** The governor's reckoning of a town is wrong
   by up to half until the country is ranged.
2. **The watch was nearly decoration.** Under a hostile neighbour with no watch,
   the summer's work loses 35% and men are picked off.
3. **A hostile neighbour had no way out.** Parley, and now the envoy.
4. **The nations could be fought to nothing.** A fight cools the feud; a nation
   at half strength makes peace.
5. **Answering an ally's call was the wrong choice** (round 3, -2.8). An
   answered call is now a march owed. The equal pact that marches wins 47.7%,
   the best single policy on a sheltered landing.
6. **Playing nations off did nothing** (first try in round 4: the envoy waited
   for goods a hostile-shore colony never has, about 2 in its first ten years,
   because its careful governor gave them away as gifts to nations that would
   not trade). Incitement can be paid in powder and can start a fight that
   summer; the one who plays them off keeps his goods for the envoy.

## Faults still open

1. **Both near nations hostile is still the hard start,** by the author's
   choice now: a visible difficulty. The careful governor wins 14.2% there.
2. **Not modelled:** the three beats (the model resolves a fight in one step,
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
