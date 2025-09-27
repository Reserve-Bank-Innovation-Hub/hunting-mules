I’m trying to create a game to simulate mule account transactions, and the player assumes the role of a mule hunter,
trying to spot and flag mule accounts. Write a simple PRD/GDD for this in the root folder for this.

- Player sees a grid of 10x10 grey circles on the canvas. Each represents a bank account.
    - At the start of the game, about 10 of these are predefined as mules, unbeknownst to the player, and are randomly
      spread throughout the grid of circles.
- The game begins when we show transactions happening between random circles. If a transaction happens on a mule
  account circle, the txn then splits the txn amount into upto three other mule account circles. If a transaction
  happens on a non-mule account circle, the txn amount is transferred to another non-mule account circle.
-
- 
- 
- 
- 
- 
- 
- Yes. I currently have a 10x10 grid, and want to make instances of the TransactionCard start from 0 scale from the 
  centre of a randomly selected node circle, and translate to
  another randomly selected node’s centre, and scale to 0 again in its centre. Basically want to show transactions happening bettween accounts. I want to be able to control the
  number of transactions that can happen every second. 