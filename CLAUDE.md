# MuleHunter — working notes

## The five sections

Shared vocabulary. These names are **for discussion only** — none of them is shown
to a player. Use these exact terms.

| # | Name | What the player sees | Where it lives |
|---|------|----------------------|----------------|
| 1 | **Landing Page** | The mule, the MULEHUNTER wordmark, "click anywhere to start" | `components/SplashScreen/` |
| 2 | **Home Page** | Wordmark, the brief card, the three steps, the name field, START | `app/page.client.tsx` + `app/home.css` |
| 3 | **4 Pattern Identification** | The four pattern rounds: a tutorial card, then the board of accounts on the 80-second clock | `components/RoundIntro/` (the tutorials), `app/game/` (the board), `AccountNode`, `NetworkLayer`, `AnimatedTransaction`, `PatternReminder`, `Scorecard`, `ScoreBar`, `Leaderboard`, `DemoAnim*` |
| 4 | **World Map** | The world outside the bank: ONE bank, and the houses of the people being investigated | `components/WorldMap/` + `lib/worldMap.ts` |
| 5 | **Investigation Cards** | A person's file on their doorstep, and the FREEZE / LET GO decision | `components/PersonProfile/`; `components/EddVisit/` runs the visits, `lib/eddCases.ts` holds the cases |

Order: **1 → 2 → 3 → 4 → 5 → result.**

Each owning file carries a `SECTION n —` marker: `grep -rn "SECTION [0-9] —" src`

## Rules

**Never use the word "mission."** Anywhere — copy, class names, comments.

**The World Map is not a transaction network.** It is the world outside the
bank. One bank, and houses belonging to individual people. Houses are never
called banks or nodes in anything a player reads. It must not read as a
flowchart, and the houses must not have a brightness hierarchy between them.

**Colour hierarchy**

| Colour | Means |
|---|---|
| Purple | infrastructure / system / network |
| Red | suspicious / risky / negative |
| Lime | successful / detected / confirmed / positive |
| Off-white | general information |
| Dark grey | secondary information |

Red is never a decorative accent — it has to mean risk.

**Exception:** the World Map's multicoloured route lines are intentional and are
exempt from the hierarchy. Do not recolour them.

**Contrast facts, verified, not guessed**
- Purple `#4C1D95` is 1.8:1 on the field — a colour to fill *with*, never to draw *in*.
- White on lime is 1.2:1 and on teal 1.7:1 — those fills only ever take dark ink.

## Instruction cards

Every instruction, tutorial and decision card is one system: `styles/instruction-card.css`,
class prefix `icard`. Structure:

```
CONTEXT LABEL  →  SHORT EXPLANATION  →  RELEVANT VISUAL  →  ONE CLEAR ACTION
```

Copy is short, direct, human. Not childish, not corporate, no filler.

## Shared assets

`components/BankMark/BankMark.tsx` holds `BankMark` and `HouseMark`. Every bank
and every house in the game comes from there — the board, all four pattern
tutorials, the World Map, the results screen. If one changes, it changes
everywhere by construction. Do not reintroduce a raster copy of either.

## Shortcuts for checking changes

These already existed in `app/game/page.client.tsx`. They skip the 80-second
round so a screen can be looked at directly. A run started this way is marked as
a preview and is NOT written to the leaderboard.

| URL | Lands on |
|---|---|
| `localhost:3000/game?preview=edd` | **World Map**, with the field brief up. Press GO OUT INTO THE FIELD for the map itself, the arrow, and the Investigation Cards |
| `localhost:3000/game?preview=end` | The results screen |
| `localhost:3000/` | Home Page (the Landing Page shows first — click anywhere) |
| `localhost:3000/game` | 4 Pattern Identification, first tutorial |

Extra knobs on `?preview=`:

- `&score=N` — how many accounts were caught (default 24). Changes the brief's
  first line and what the visits are drawn from.
- `&verdicts=N` — for `preview=end` only, how many field visits were called
  right (default 2). `&verdicts=none` for a run where the visits were skipped.
- `&edd=off` — skip the World Map and Investigation Cards entirely.

Example: `localhost:3000/game?preview=edd&score=3`
