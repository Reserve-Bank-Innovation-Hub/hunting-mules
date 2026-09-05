// The four patterns the kiosk teaches. The first three are taken verbatim from the
// verified MuleHunter deck and must not drift:
//   Fan-in          Many credits consolidated, then moved out in a single transaction.
//   Fan-out         A single inflow dispersed across many destinations.
//   Gather-scatter  Brief aggregation followed by rapid redistribution.
//   Low balance     An account that idles at a few hundred rupees handles a sum a
//                   hundred times its size, and passes almost all of it straight on.
// (The deck also defines Cyclic transfers; it is deliberately not part of this game.)
export type PatternBehaviour = "fan-in" | "fan-out" | "gather-scatter" | "low-balance";

export interface PatternConfig {
    behaviour     : PatternBehaviour;
    unlockAt      : number;         // Seconds into the round at which this joins the game
    heading       : string;
    title         : string;
    description   : string;         // One line. This is a kiosk, not a manual.
    reminder      : string;         // Sits in the strip above the board for the rest of the round
    /**
     * The pattern's shape, as two short lines. Sits in the hint bar along the
     * bottom of the board — the one cell of the three that changes with the
     * pattern, so the player always has its shape in front of them.
     */
    shape         : [ string, string ];
    burstInterval : number;         // Before the stage density ramp is applied
}

export const PATTERNS : PatternConfig[] = [
    {
        behaviour     : "fan-in",
        unlockAt      : 0,
        heading       : "PATTERN 1",
        title         : "FAN IN",
        description   : "Many accounts pay one account. It sends the whole lot onward in a single transfer.",
        reminder      : "MANY → ONE",
        shape         : [ "Many senders", "One receiver" ],
        burstInterval : 2600,
    },
    {
        behaviour     : "fan-out",
        unlockAt      : 20,
        heading       : "PATTERN 2",
        title         : "FAN OUT",
        description   : "One large payment lands, then splits away across many accounts at once.",
        reminder      : "ONE → MANY",
        shape         : [ "One sender", "Many receivers" ],
        burstInterval : 2800,
    },
    {
        behaviour     : "gather-scatter",
        unlockAt      : 40,
        heading       : "PATTERN 3",
        title         : "GATHER & SCATTER",
        description   : "Money pools for a moment, then scatters straight back out to different accounts.",
        reminder      : "IN → OUT",
        shape         : [ "Money pools in", "Then scatters out" ],
        burstInterval : 2600,
    },
    {
        behaviour     : "low-balance",
        unlockAt      : 60,
        heading       : "PATTERN 4",
        title         : "LOW BALANCE",
        description   : "An account sitting on a few hundred rupees takes in lakhs, then passes almost all of it on.",
        reminder      : "HUGE IN → ALMOST ALL OUT",
        shape         : [ "A small account", "Huge amounts through" ],
        burstInterval : 2700,
    },
];

export const TOTAL_PATTERNS = PATTERNS.length;
