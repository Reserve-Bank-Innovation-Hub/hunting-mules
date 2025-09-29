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

1. **Watch the transactions**: Money flows between accounts automatically
2. **Spot suspicious patterns**: Look for accounts that seem to be redistributing money
3. **Click to freeze mules**: Click suspected mule accounts to lock them
4. **Race against time**: Find all mules before they launder all the money
5. **Win or lose**: Stop all mules to win, or watch your money disappear

### Game features

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
│   ├── AccountNode/          # Individual bank account circles
│   ├── AnimatedTransaction/  # Flying transaction cards
│   ├── AnimationOverlay/     # Container for all animations
│   ├── GameModals/          # Victory and game over screens
│   ├── NodeRippleEffect/    # Ripple animations on accounts
│   └── Scorecard/           # Money tracking display
├── hooks/                   # Custom React hooks
│   ├── useGameFlow.ts       # Game state and modal management
│   ├── useGameState.ts      # Central state management
│   ├── useGridLayout.ts     # Grid calculation and setup
│   ├── useNodeInteractions.ts # Click handling and mule detection
│   └── useTransactions.ts   # Transaction creation and completion
├── lib/                     # Utilities and configuration
│   ├── gameConfig.ts        # Game settings and constants
│   ├── gameTypes.ts         # TypeScript type definitions
│   ├── gridCalculations.ts  # Grid layout algorithms
│   └── transactionUtils.ts  # Money formatting helpers
└── app/game/               # Main game page
    ├── page.client.tsx     # Game component (175 lines, down from 1000+)
    └── game-page.css       # Game styles
```

### Built with modern tech

- **React 18** with TypeScript for type safety
- **Framer Motion** for smooth animations
- **ReactFlow** for the account grid visualization
- **Fictoan React** for UI components
- **Next.js 15** for the framework

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
