# Hunting Mules - Transaction Visualization Game

## Overview
A real-time transaction visualization game that displays animated money transfers between bank accounts on a responsive grid.

## Features

### Dynamic Grid System
- **Responsive Layout**: Grid size automatically adapts to screen dimensions
- **Smart Sizing**: Calculates optimal rows/columns (5x5 to 15x12) based on available space
- **Perfect Centering**: Grid is always centered with optimal spacing

### Account Types
- **Regular Accounts**: Gray circles representing normal bank accounts
- **Mule Accounts**: Red circles representing suspicious accounts (up to 25 or 25% of total)

### Animated Transactions
- **Random Transfers**: Transactions spawn between random accounts every 500ms (2 per second)
- **Smooth Animation**: Cards scale from 0→1, fly between nodes, then scale to 0
- **Random Amounts**: Transaction values between ₹1,000 - ₹1,00,000
- **Performance Optimized**: Maximum 10 concurrent animations

### Configuration
- **Transaction Rate**: 2 per second (configurable)
- **Animation Timing**: 500ms scale + 2000ms flight + 500ms disappear
- **Amount Range**: ₹1,000 to ₹1,00,000
- **Concurrent Limit**: 10 active transactions

## Tech Stack
- **React + TypeScript**
- **ReactFlow**: Grid visualization
- **Framer Motion**: Smooth animations
- **Fictoan React**: UI components

## Performance
- GPU-accelerated animations using `transform` and `scale`
- Transaction pooling prevents performance issues
- Responsive design works on all screen sizes
- No hardcoded dimensions - fully adaptive

---

## Getting Started

First, run the development server:

```bash
yarn && yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
