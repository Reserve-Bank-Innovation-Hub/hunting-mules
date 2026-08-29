// LIB =================================================================================================================
import { GridOverrides } from "./gameConfig";

// The three patterns the kiosk teaches. Definitions are taken verbatim from the
// verified MuleHunter deck and must not drift:
//   Fan-in          Many credits consolidated, then moved out in a single transaction.
//   Fan-out         A single inflow dispersed across many destinations.
//   Gather-scatter  Brief aggregation followed by rapid redistribution.
// (The deck also defines Cyclic transfers; it is deliberately not part of this game.)
export type PatternBehaviour = "fan-in" | "fan-out" | "gather-scatter" | "low-balance";

// Retained for the older call sites that still speak in rounds
export type RoundBehaviour = PatternBehaviour;

export interface RoundConfig {
    behaviour     : PatternBehaviour;
    duration      : number;         // Seconds of play, intros are not on the clock
    muleCount     : number;         // Mules planted this pattern, clamped to what the board can hold
    heading       : string;
    title         : string;
    description   : string;         // One line. This is a kiosk, not a manual.
    reminder      : string;         // Stays on screen for the whole pattern
    burstInterval : number;
    gridOverrides : GridOverrides;
}

export const ROUNDS : RoundConfig[] = [
    {
        behaviour     : "fan-in",
        duration      : 25,
        muleCount     : 6,
        heading       : "PATTERN 1",
        title         : "FAN IN",
        description   : "Many accounts pay one account. It sends the whole lot onward in a single transfer.",
        reminder      : "MANY → ONE",
        burstInterval : 2600,
        gridOverrides : {},
    },
    {
        behaviour     : "fan-out",
        duration      : 25,
        muleCount     : 6,
        heading       : "PATTERN 2",
        title         : "FAN OUT",
        description   : "One large payment lands, then splits away across many accounts at once.",
        reminder      : "ONE → MANY",
        burstInterval : 2800,
        gridOverrides : {},
    },
    {
        behaviour     : "gather-scatter",
        duration      : 25,
        muleCount     : 6,
        heading       : "PATTERN 3",
        title         : "GATHER & SCATTER",
        description   : "Money pools for a moment, then scatters straight back out to different accounts.",
        reminder      : "IN → OUT, FAST",
        burstInterval : 2600,
        gridOverrides : {},
    },
];

export const TOTAL_ROUNDS = ROUNDS.length;
export const TOTAL_PATTERNS = ROUNDS.length;

export const TOTAL_GAME_SECONDS = ROUNDS.reduce((sum, round) => sum + round.duration, 0);
