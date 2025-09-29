# Hunting mules

This is an interactive game that teaches people about money laundering and how mule accounts work in the financial system.

## The concept

Imagine you're watching money flow through a banking network in real-time. There are regular bank accounts and hidden "mule accounts" that launder money. Your job is to spot the mules and stop them before they drain all the money from the system.

When transactions hit mule accounts, they don't just disappear - they get split up and sent to other mule accounts to make the money harder to trace. This creates a complex web of money movement that mimics how real money laundering works.

## How it works

You see a grid of bank account nodes with money transactions flying between them constantly. Some of these accounts are secretly mule accounts, but they look exactly like normal accounts at first.

Your mission is to click on accounts you suspect are mules to "freeze" them. When you click a mule account, it gets locked with a mule icon and can't receive transactions anymore. If transactions try to reach a frozen mule, they bounce back to where they came from.

The challenge is that you need to find all the mules before they launder all the money. Each transaction that successfully reaches a mule gets split and redistributed to other mules, making the money disappear from legitimate circulation.

## The learning experience

This game shows how:
- Mule accounts look identical to legitimate accounts from the outside
- Money laundering involves splitting and moving funds through multiple accounts
- Detection requires careful observation of transaction patterns
- Time pressure exists in real anti-money laundering work
- Even when you catch some mules, others might still be operating

It's both educational and engaging, helping people understand the complexity of financial crime detection while having fun trying to "hunt" the mules.

## Built with modern tech

The game uses React, TypeScript, and Framer Motion for smooth animations. It's built with a clean, modular architecture that makes it easy to maintain and extend with new features.