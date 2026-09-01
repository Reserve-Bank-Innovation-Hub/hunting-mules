// REACT CORE ==========================================================================================================
import { Node } from "reactflow";
import { Network } from "./network";
import { PatternBehaviour } from "./roundConfig";

export interface NodeData {
    isMule         ? : boolean;
    isLocked       ? : boolean;
    isShaking      ? : boolean;
    balance        ? : number;
    // What this account was dealt at the start, and what it returns to once it has
    // been a mule and been cleaned up
    openingBalance ? : number;
    onNodeClick    ? : (nodeId : string, isMule : boolean) => void;
}

// A pattern intro takes the clock off, so the game sits in "intro" while one is up
export type GamePhase = "intro" | "playing" | "finished";

export interface TransactionInstance {
    id              : string;
    fromNode        : Node;
    toNode          : Node;
    amount          : string;
    amountValue   ? : number;    // The same figure unformatted, so it never needs re-parsing
    isMuleInflow  ? : boolean;   // Part of a mule's gather step
    isMuleOutflow ? : boolean;   // Part of a mule's pay-away step, the money that gets laundered
    muleId        ? : string;
    // Whether this leg moves the balance of the account at the middle of the routine,
    // and which way. Counterparties are deliberately left alone — see behaviours.ts.
    movesBalance      ? : boolean;
    isInflowToHolder  ? : boolean;
    isBounced     ? : boolean;   // Turned around mid-flight, already on screen and scaled up
    isReturnLeg   ? : boolean;   // Born as a return journey, so it animates in from scratch
    startTime     ? : number;
}

// A line that flashes along the route a pattern transaction is taking, and is gone
// again well before the money lands. Ordinary traffic never gets one.
export interface PatternFlash {
    id     : string;
    fromId : string;
    toId   : string;
}

export interface NodeRipple {
    id                : string;
    nodeId            : string;
    x                 : number;
    y                 : number;
    isLocked        ? : boolean;
    isMuleReceiving ? : boolean;
}

export interface GridDimensions {
    rows     : number;
    columns  : number;
    spacingX : number;
    spacingY : number;
    startX   : number;
    startY   : number;
}

// Hook Return Types
export interface UseGameStateReturn {
    activeTransactions         : TransactionInstance[];
    isGridReady                : boolean;
    totalMoneyInCirculation    : number;
    moneyLostToMules           : number;
    activeRipples              : NodeRipple[];
    patternFlashes             : PatternFlash[];
    lockedNodes                : Set<string>;
    shakingNodes               : Set<string>;
    baseNodes                  : Node[];
    // The accounts caught so far. The score is its size — see useGameState.
    caughtNodeIds              : Set<string>;
    mulesFoundCount            : number;
    gridDimensions             : GridDimensions | null;
    timeLeft                   : number;
    phase                      : GamePhase;
    // How many patterns have joined the game so far, and which one's intro is up
    unlockedPatterns           : number;
    introPatternIndex          : number | null;
    // Which account is running which pattern right now, keyed by node id
    muleRoles                  : Map<string, PatternBehaviour>;
    nodeBalances               : Map<string, number>;
    network                    : Network | null;
    setActiveTransactions      : (updater : (prev : TransactionInstance[]) => TransactionInstance[]) => void;
    setIsGridReady             : (ready : boolean) => void;
    setTotalMoneyInCirculation : (updater : (prev : number) => number) => void;
    setMoneyLostToMules        : (updater : (prev : number) => number) => void;
    setActiveRipples           : (updater : (prev : NodeRipple[]) => NodeRipple[]) => void;
    setPatternFlashes          : (updater : (prev : PatternFlash[]) => PatternFlash[]) => void;
    setLockedNodes             : (updater : (prev : Set<string>) => Set<string>) => void;
    setShakingNodes            : (updater : (prev : Set<string>) => Set<string>) => void;
    setBaseNodes               : (nodes : Node[]) => void;
    setCaughtNodeIds           : (updater : (prev : Set<string>) => Set<string>) => void;
    setGridDimensions          : (dimensions : GridDimensions | null) => void;
    setTimeLeft                : (updater : (prev : number) => number) => void;
    setPhase                   : (phase : GamePhase) => void;
    setUnlockedPatterns        : (updater : (prev : number) => number) => void;
    setIntroPatternIndex       : (index : number | null) => void;
    setMuleRoles               : (updater : (prev : Map<string, PatternBehaviour>) => Map<string, PatternBehaviour>) => void;
    setNodeBalances            : (updater : (prev : Map<string, number>) => Map<string, number>) => void;
    setNetwork                 : (network : Network | null) => void;
}
