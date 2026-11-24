# Frame: the start (codes, the house's story, background, landing site)

Status: **for the author, 2026-11-24. Not approved, nothing built.** The
numbers side of backgrounds and sites is measured in `KILLGATE.md` round 4;
the code reading below is designed from House of Adalia's source and has not
been run against a real code.

## The request

The author, 2026-11-24:

> Knight of Adalia codes should allow play for those who didn't play house of
> adalia, but some rapid fire choices should be forced before the game starts
> to simulate houses story. If prefer if you came in with an HoA save code.

And on difficulty: "a visible choice, a good way to control difficulty".

Read here as: **a House of Adalia code is the preferred way in**. A Knight of
Adalia code also works, but the player first makes a handful of forced, quick
choices that stand in for House of Adalia's story. With no code, the quick
backgrounds of the SPEC. The landing site is chosen in the open as the
difficulty.

## The problem

The colony is about 250 years after Knight of Adalia. Between them lies House
of Adalia (three generations, years of grace 912 to about 970) and then about
150 to 190 more years. A player who brings a code from an earlier game expects
it to matter ("heavily influenced added bonuses", SPEC). But:

- House of Adalia has **no dynasty export**. Its ending offers its whole save
  as `HOA1.`, 13,000 to 21,000 characters. The sequel has to read another
  game's save format.
- A Knight of Adalia code (`KOAD1.`) describes the house at 908. Everything
  House of Adalia would have decided (the house law, the great match, the war
  of cousins, the verdict) is missing.
- Neither game records a **house name**. The founder has a given name; children
  have given names only. A sequel about a descendant needs a surname.

## The design rule

**Every road in arrives at the same four things, and the code only changes how
they are reached:** the house (name, arms, and a short history in the
chronicle), its **standing** (how the court and investors see it), its
**credit** (the backers' purse), and its **friends and enemies** at home. In
the model these are the background's favour, budget, men and goods, measured to
be best somewhere and never best everywhere. Nothing a code gives is a
different game; it is a better or worse start in the same one.

## The three roads in

### 1. A House of Adalia code (preferred)

The player pastes `HOA1.…`. It is read without the game:
`JSON.parse(zlib.inflateRawSync(Buffer.from(code.slice(5).replace(/\s+/g, ''), 'base64url')))`
gives `{ format: 'house-of-adalia-save', saveVersion, contentHash, state }`.
(From House of Adalia's `packages/engine/src/savecode.ts`: raw deflate,
base64url without padding. Not yet run on a real code.) Versions 1 to 3 have
the same state shape and are all accepted.

What is read, and what it becomes:

| From the code | Becomes |
|---|---|
| `ended.ending` (or, for a save made while playing on, the ending worked out from its flags as House of Adalia's `endings.ts` does) | The house's **standing**, the largest single bonus: `royal_line` and `power` high; `old_house` good; `fallen_house` and `foreign_house` low; `name_struck` the disgraced start; `extinct` refused with a plain message (no heir, no descendant) |
| `characters[hero]`: the last head's traits, station, renown | One trait carried to the governor; renown into standing |
| `res.coin`, `debt`, `brancale`, `holdings` | **Credit**: the purse the letter spends. Debt to the Lanzi bank is still owed, to the Lanzi's heirs: a hostile investor |
| `houses` (rival houses' temper; an enemy at -6 or below) | **Enemies at home**: each enemy house is an investor against you, or a voice at court against you if the colony is the Crown's |
| `rep.church`, `rep.merchants`, `rep.nobles` | Which backer is offered first: the merchants' company or the Crown |
| `realm.obedience` (Saint-Lys or Sarenza) | Which church the colony's minister answers to; flavour, and a faction's temper |
| `arms` | The colony's flag. If absent, drawn from the code's seed, as House of Adalia does |
| `chronicle` (one line per head) | Read back on the first page: the house's story in the player's own choices |
| `family.generation` | How many generations ago the house was founded; the 150 to 190 years after House of Adalia's end are covered by one short paragraph and one quick choice (below) |

**The house's name.** House of Adalia stores none. The player names the house
on the first page, offered the founder's name as a patronymic (Wat's house,
"Watson") or the name of the house's seat if it has one.

**The gap.** House of Adalia ends around 970; the colony sails around 1120 to
1160. One forced choice covers it: *what became of the house in the long
peace*: it kept its lands (standing), it went into trade (credit), it served
the Crown (men), or it spent itself (goods and a grudge). Each moves one of
the four things a little.

### 2. A Knight of Adalia code, with House of Adalia's story in quick choices

The player pastes `KOAD1.…` (read exactly as House of Adalia reads it,
`packages/dynasty/src/contract.ts`). Then, before the game starts, **six
forced choices, one screen each, no going back**, standing in for House of
Adalia's books. Each is a fork House of Adalia actually has:

1. **How the founder's house began** (House of Adalia's openings): a great
   lord with rivals / made someone else a king / took a crown / one holding
   left / a small court abroad / attainted, the name struck.
2. **The house law** (Book I): eldest of either sex / the male line / male
   preference / divided among the children.
3. **The plague** (Book I, the Second Mottle): shut the gates / nurse the town /
   flee to the country. Who lived is not the player's choice; the code's seed
   decides it, as the plague did.
4. **The great match** (Book II): a royal marriage won / lost / refused.
5. **The rising** (Book II): led it / backed it / crushed it / brokered it /
   kept out.
6. **The war of cousins** (Book III): pressed the claim / sold it / folded it /
   renounced it; and the verdict, which the choices before it make likely but
   the seed decides: rewarded, fined, attainted, fled abroad.

Then the long-peace choice of road 1. The answers are written as a short
chronicle, in House of Adalia's manner, and reduce to the same four things.
**A Knight of Adalia code with these choices can reach every start a House of
Adalia code can, except the very best:** the royal line needs the great match
won *and* the claim pressed *and* the verdict in the house's favour, and the
seed may refuse it. That is the preference for a House of Adalia code, made
into a rule rather than a lock.

### 3. No code

The four backgrounds of the SPEC, chosen openly: a younger child of an old
house, a merchant's heir, a soldier of the late wars, a house in disgrace. Plus
the house's name.

## Then: the landing site

Chosen in the open, after the house and before the charter, and shown as
difficulty. The two near nations' tempers are what the site fixes; the far two
are drawn as always.

| Site | What the player is told | Careful governor wins (round 4) |
|---|---|---|
| **A sheltered bay** | Both nations on this shore are curious, not hostile | 53.2% |
| **A contested river** | One nation wants you here; the other does not | 35.3% |
| **The palisade shore** | Both nations want you gone. Jamestown | 14.2% (playing them off 36.2%; a Crown fortress under a soldier 43.9%) |

A fourth choice, **"where the ship is driven"**, draws the site at random and
does not say which until landing: for a player who wants the round 1 game.

Then the charter: Crown or company, proposed by the start (a soldier and an
old house lean Crown; a merchant's heir leans company) and open to the player.

## What is measured, and what is not

Measured (round 4, 1,000 seeds an arm): the three sites, the four backgrounds
by charter and on the palisade. The best start differs by situation: old house
with the Crown (60.6%), merchant's heir with the company (47.7%), soldier on
the palisade under the Crown with a fortress (43.9%). The disgraced start is
the hardest everywhere but the palisade, as intended.

Not measured: the size of a code's bonus against a background's. The proposal
is that a House of Adalia code's best ending is worth about one and a half
times the best background, and its worst ending (`name_struck`) is the
disgraced start exactly. That needs a model arm per ending before it is built.

## Still for the author

1. **The house's name.** House of Adalia has none to read. Name it on the first
   page, offered from the founder's name?
2. **Six forced choices** for a Knight of Adalia code. Too many, too few, or
   the wrong six?
3. **The extinct ending.** A House of Adalia code that ended with the house
   extinct cannot have a descendant. Refuse it, or allow a cousin's line at
   the disgraced start?
4. **The random site.** Keep it as a fourth choice?
