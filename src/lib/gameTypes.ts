import { Node } from "reactflow";

export interface NodeData {
    isMule? : boolean;
    isLocked? : boolean;
    isShaking? : boolean;
    onNodeClick? : (nodeId : string, isMule : boolean) => void;
}

export interface TransactionInstance {
    id : string;
    fromNode : Node;
    toNode : Node;
    amount : string;
    isSecondaryMuleTransaction? : boolean;
    originalAmount? : number;
}

export interface NodeRipple {
    id : string;
    nodeId : string;
    x : number;
    y : number;
    isLocked? : boolean;
}

export interface GridDimensions {
    rows : number;
    columns : number;
    spacingX : number;
    spacingY : number;
    startX : number;
    startY : number;
}

// Game State Types
export interface GameMetrics {
    totalMoneyInCirculation: number;
    moneyLostToMules: number;
    mulesFoundCount: number;
    actualMuleCount: number;
}

export interface GameModalState {
    gameOverModalShown: boolean;
    victoryModalShown: boolean;
}

export interface GameFlowCallbacks {
    createRipple: (nodeId: string, x: number, y: number, isLocked?: boolean) => void;
    handleRippleComplete: (rippleId: string) => void;
    handleTransactionComplete: (transactionId: string) => void;
    handleNodeClick: (nodeId: string, isMule: boolean) => void;
}

// Hook Return Types
export interface UseGameStateReturn {
    // State values
    activeTransactions: TransactionInstance[];
    isGridReady: boolean;
    totalMoneyInCirculation: number;
    moneyLostToMules: number;
    activeRipples: NodeRipple[];
    pendingMoneyLoss: Map<string, number>;
    lockedNodes: Set<string>;
    shakingNodes: Set<string>;
    muleIndices: Set<number> | null;
    baseNodes: Node[];
    mulesFoundCount: number;
    actualMuleCount: number;
    gridDimensions: GridDimensions | null;
    gameOverModalShown: boolean;
    victoryModalShown: boolean;
    // State setters
    setActiveTransactions: (updater: (prev: TransactionInstance[]) => TransactionInstance[]) => void;
    setIsGridReady: (ready: boolean) => void;
    setTotalMoneyInCirculation: (updater: (prev: number) => number) => void;
    setMoneyLostToMules: (updater: (prev: number) => number) => void;
    setActiveRipples: (updater: (prev: NodeRipple[]) => NodeRipple[]) => void;
    setPendingMoneyLoss: (updater: (prev: Map<string, number>) => Map<string, number>) => void;
    setLockedNodes: (updater: (prev: Set<string>) => Set<string>) => void;
    setShakingNodes: (updater: (prev: Set<string>) => Set<string>) => void;
    setMuleIndices: (indices: Set<number>) => void;
    setBaseNodes: (nodes: Node[]) => void;
    setMulesFoundCount: (updater: (prev: number) => number) => void;
    setActualMuleCount: (count: number) => void;
    setGridDimensions: (dimensions: GridDimensions | null) => void;
    setGameOverModalShown: (shown: boolean) => void;
    setVictoryModalShown: (shown: boolean) => void;
}