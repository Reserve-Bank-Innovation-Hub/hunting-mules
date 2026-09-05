# Hunting Mules

An interactive game that teaches people about money laundering through mule accounts. Players watch money flow through a
banking network in real-time and try to identify and freeze mule accounts before they drain all the money from the
system.

### What is this?

This is an educational game about financial crime detection. You see a grid of bank accounts with money constantly
flowing between them. Some accounts are secretly "mules" that launder money by splitting and redistributing it. Your job
is to spot these mules and click to freeze them before they steal all the money.

When transactions hit mule accounts, they don't disappear - they get broken into smaller amounts and sent to other
mules, just like real money laundering. This creates a complex web that makes the money harder to trace.

### How to play

1. **Walk into the branch**: The game opens on a world map. You are the bank's investigator; the bank is the building you tap first
2. **Watch the transactions**: Money flows between accounts automatically
3. **Spot suspicious patterns**: Look for accounts that seem to be redistributing money
4. **Click to freeze mules**: Click suspected mule accounts to lock them
5. **Race against time**: Find all mules before they launder all the money
6. **Win or lose**: Stop all mules to win, or watch your money disappear
7. **Go and investigate**: When time is up you are sent back out to the map. Knock on each of the three houses, meet the person who lives there, read the field-verification report and decide which freezes stand

### The world map

Everything outside the dashboard happens on one map, and it is the same map both
times you are on it — walking in at the start, and going door to door at the end.

It is a ground plane tipped back with a CSS 3D transform, with every building,
person and animal standing on it as an upright billboard that counter-rotates by
exactly the angle the ground was tipped by. The roads converge, the far houses
are genuinely smaller, and none of it costs a mesh, a texture or a byte of WebGL
— which matters on a kiosk that has to come up instantly and stay up all day.
The geometry is derived in the header comment of `world-map.css`; the four
numbers it balances cannot be changed one at a time.

The layout is a tree, not a hub. The bank stands in the foreground at the bottom
of the screen, about three times the width of a house, with the player beside it.
One road leaves it and forks twice, and the three houses hang off three different
branches at three different distances — 58%, 44% and 36% of the way up the screen
against a horizon at 30%. It is one continuous piece of ground: no tiers, no
floating layers. The player walks the curve of the road itself rather than cutting
between points.

It is night, which is what puts the lit windows to work — they are what point at
the buildings, so the map needs no labels to say where to go.

Pixel is carried deliberately and in only four places, all of them documented at
the top of `WorldArt.tsx`: stepped diagonals, three flat tones per solid, dither
at the tone boundaries, and one controlled outline weight. Everything else stays
dimensional. The target is a 3D object drawn by somebody who likes 16-bit
graphics, not a 3D object with a pixel filter over it.

The site plan pinned in the corner reads its coordinates and its road curves from
`lib/worldMap.ts`, the same file the world does, so a house further into the world
is further up the sheet. There is no second layout and no second map system.

The three houses are the three field visits. House N holds visit N — the cases,
how they are drawn and how a verdict is judged are exactly what they were when
the visits were a stack of cards; only where you read them has changed.

The field visits are optional. A player can skip them from the brief card. A kiosk can run without them by being opened at `/?edd=off` (the setting is carried from screen to screen), or permanently by setting `EDD_ENABLED` to `false` in `src/lib/gameConfig.ts`.

### Game features

- **A world to move through**: A colourful 3D cartoon map with a bank, three houses and the people who live in them
- **Real-time transactions**: Money flows between accounts every 0.5 seconds
- **Smart money laundering**: Mules split incoming money into 2-3 parts and redistribute
- **Visual feedback**: Ripple effects show transaction activity
- **Responsive scoring**: Track money in circulation vs money lost to mules
- **Victory conditions**: Find all mules or lose all your money
- **Adaptive grid**: Works on any screen size with optimal layout

### Project structure

This codebase is organized into clean, reusable modules:

```
src/
├── components/              # UI components
│   ├── AccountNode/          # Individual bank account chips
│   ├── AnimatedTransaction/  # Flying transaction cards
│   ├── AnimationOverlay/     # Container for all animations
│   ├── EddVisit/             # The field visits after the round (enhanced due diligence)
│   ├── NodeRippleEffect/     # Ripple animations on accounts
│   ├── PersonProfile/        # The field-verification report, read on a doorstep
│   ├── Scorecard/            # Money tracking display
│   └── WorldMap/             # The world outside the bank
│       ├── WorldMap.tsx      #   The tipped-back ground plane and everything on it
│       ├── WorldArt.tsx      #   Every building, person, mule and prop, as inline SVG
│       └── BlueprintMap.tsx  #   The site plan in the corner, from the same data
├── hooks/                   # Custom React hooks
│   ├── useGameFlow.ts       # Phase transitions, the clock and pattern unlocks
│   ├── useGameState.ts      # Central state management
│   ├── useGridLayout.ts     # Grid calculation and setup
│   ├── useNodeInteractions.ts # Click handling and mule detection
│   └── useTransactions.ts   # Transaction creation and completion
├── lib/                     # Utilities and configuration
│   ├── eddCases.ts          # Field-verification cases, drawn three at a time after the round
│   ├── gameConfig.ts        # Game settings and constants
│   ├── gameTypes.ts         # TypeScript type definitions
│   ├── gridCalculations.ts  # Grid layout algorithms
│   ├── transactionUtils.ts  # Money formatting helpers
│   └── worldMap.ts          # Where the bank, the houses and the paths are
├── styles/
│   └── world-theme.css      # Every colour and surface in the game, in one place
└── app/game/               # Main game page
    ├── page.client.tsx     # Game component
    └── game-page.css       # The bank's interior
```

### Built with modern tech

- **React 18** with TypeScript for type safety
- **Framer Motion** for smooth animations
- **ReactFlow** for the account grid visualization
- **Fictoan React** for UI components
- **Next.js 15** for the framework
- **No 3D library**: the world map is CSS 3D transforms and inline SVG

### Getting started

```bash
yarn && yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) to play the game.

### Architecture highlights

This project showcases clean React architecture with:

- **Modular components**: Each UI element is self-contained with its own styles
- **Custom hooks**: Game logic is separated into focused, reusable hooks
- **TypeScript throughout**: Full type safety with comprehensive interfaces
- **Performance optimized**: Proper memoization and stable function references
- **Maintainable**: 83% reduction in main component size through proper separation of concerns

The refactoring reduced the main game component from over 1000 lines to just 175 lines while maintaining identical
functionality.
