// REACT CORE ==========================================================================================================
import { Node } from "reactflow";
import { Network } from "./network";
export interface NodeData {
    isMule      ? : boolean;
    isLocked    ? : boolean;
    isShaking   ? : boolean;
    balance     ? : number;    // Only rendered in the low-balance round
    showBalance ? : boolean;
    isSurging   ? : boolean;   // Holding far more than its resting balance right now
    onNodeClick ? : (nodeId : string, isMule : boolean) => void;
}

// Intros are not on the clock, so the game sits in "intro" between rounds
export type GamePhase = "intro" | "playing" | "finished";

export interface TransactionInstance {
    id                           : string;
    fromNode                     : Node;
    toNode                       : Node;
    amount                       : string;
    amountValue                ? : number;    // The same figure unformatted, so it never needs re-parsing
    isMuleInflow               ? : boolean;   // Part of a mule's gather step
    isMuleOutflow              ? : boolean;   // Part of a mule's pay-away step, this is the money that gets laundered
    muleId                     ? : string;
    isSecondaryMuleTransaction ? : boolean;
    originalAmount             ? : number;
    isBounced                  ? : boolean;   // Turned around mid-flight, already on screen and scaled up
    isReturnLeg                ? : boolean;   // Born as a return journey, so it animates in from scratch
    startTime                  ? : number;
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

// Game State Types
export interface GameMetrics {
    totalMoneyInCirculation : number;
    moneyLostToMules        : number;
    mulesFoundCount         : number;
    actualMuleCount         : number;
}

export interface GameModalState {
    gameOverModalShown : boolean;
    victoryModalShown  : boolean;
}

export interface GameFlowCallbacks {
    createRipple              : (nodeId : string, x : number, y : number, isLocked? : boolean, isMuleReceiving? : boolean) => void;
    handleRippleComplete      : (rippleId : string) => void;
    handleTransactionComplete : (transactionId : string) => void;
    handleNodeClick           : (nodeId : string, isMule : boolean) => void;
}

// Hook Return Types
export interface UseGameStateReturn {
    activeTransactions         : TransactionInstance[];
    isGridReady                : boolean;
    totalMoneyInCirculation    : number;
    moneyLostToMules           : number;
    activeRipples              : NodeRipple[];
    pendingMoneyLoss           : Map<string, number>;
    lockedNodes                : Set<string>;
    shakingNodes               : Set<string>;
    muleIndices                : Set<number> | null;
    baseNodes                  : Node[];
    mulesFoundCount            : number;
    actualMuleCount            : number;
    gridDimensions             : GridDimensions | null;
    gameOverModalShown         : boolean;
    victoryModalShown          : boolean;
    roundTimeLeft              : number;
    gameOverReason             : "money" | "time" | null;
    phase                      : GamePhase;
    roundIndex                 : number;
    totalMuleCount             : number;
    nodeBalances               : Map<string, number>;
    surgingNodes               : Set<string>;
    network                    : Network | null;
    activeEdges                : Map<string, number>;   // Edge id -> how many live bursts are using it
    setActiveTransactions      : (updater : (prev : TransactionInstance[]) => TransactionInstance[]) => void;
    setIsGridReady             : (ready : boolean) => void;
    setTotalMoneyInCirculation : (updater : (prev : number) => number) => void;
    setMoneyLostToMules        : (updater : (prev : number) => number) => void;
    setActiveRipples           : (updater : (prev : NodeRipple[]) => NodeRipple[]) => void;
    setPendingMoneyLoss        : (updater : (prev : Map<string, number>) => Map<string, number>) => void;
    setLockedNodes             : (updater : (prev : Set<string>) => Set<string>) => void;
    setShakingNodes            : (updater : (prev : Set<string>) => Set<string>) => void;
    setMuleIndices             : (indices : Set<number> | null) => void;
    setBaseNodes               : (nodes : Node[]) => void;
    setMulesFoundCount         : (updater : (prev : number) => number) => void;
    setActualMuleCount         : (count : number) => void;
    setGridDimensions          : (dimensions : GridDimensions | null) => void;
    setGameOverModalShown      : (shown : boolean) => void;
    setVictoryModalShown       : (shown : boolean) => void;
    setRoundTimeLeft           : (updater : (prev : number) => number) => void;
    setGameOverReason          : (reason : "money" | "time" | null) => void;
    setPhase                   : (phase : GamePhase) => void;
    setRoundIndex              : (updater : (prev : number) => number) => void;
    setTotalMuleCount          : (updater : (prev : number) => number) => void;
    setNodeBalances            : (updater : (prev : Map<string, number>) => Map<string, number>) => void;
    setSurgingNodes            : (updater : (prev : Set<string>) => Set<string>) => void;
    setNetwork                 : (network : Network | null) => void;
    setActiveEdges             : (updater : (prev : Map<string, number>) => Map<string, number>) => void;
}