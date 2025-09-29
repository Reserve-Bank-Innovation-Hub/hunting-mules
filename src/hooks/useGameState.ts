import { useState, useCallback } from "react";
import { Node } from "reactflow";
import { TransactionInstance, NodeRipple, GridDimensions, UseGameStateReturn } from "../lib/gameTypes";
import { TRANSACTION_CONFIG } from "../lib/gameConfig";

export const useGameState = (): UseGameStateReturn => {
    const [activeTransactions, setActiveTransactions] = useState<TransactionInstance[]>([]);
    const [isGridReady, setIsGridReady] = useState(false);
    const [totalMoneyInCirculation, setTotalMoneyInCirculation] = useState(TRANSACTION_CONFIG.STARTING_AMOUNT);
    const [moneyLostToMules, setMoneyLostToMules] = useState(0);
    const [activeRipples, setActiveRipples] = useState<NodeRipple[]>([]);
    const [pendingMoneyLoss, setPendingMoneyLoss] = useState<Map<string, number>>(new Map());
    const [lockedNodes, setLockedNodes] = useState<Set<string>>(new Set());
    const [shakingNodes, setShakingNodes] = useState<Set<string>>(new Set());
    const [muleIndices, setMuleIndices] = useState<Set<number> | null>(null);
    const [baseNodes, setBaseNodes] = useState<Node[]>([]);
    const [mulesFoundCount, setMulesFoundCount] = useState(0);
    const [actualMuleCount, setActualMuleCount] = useState(0);
    const [gridDimensions, setGridDimensions] = useState<GridDimensions | null>(null);
    const [gameOverModalShown, setGameOverModalShown] = useState(false);
    const [victoryModalShown, setVictoryModalShown] = useState(false);

    // Optimized setters using useCallback for stable references
    const stableSetters = {
        setActiveTransactions: useCallback(setActiveTransactions, []),
        setIsGridReady: useCallback(setIsGridReady, []),
        setTotalMoneyInCirculation: useCallback(setTotalMoneyInCirculation, []),
        setMoneyLostToMules: useCallback(setMoneyLostToMules, []),
        setActiveRipples: useCallback(setActiveRipples, []),
        setPendingMoneyLoss: useCallback(setPendingMoneyLoss, []),
        setLockedNodes: useCallback(setLockedNodes, []),
        setShakingNodes: useCallback(setShakingNodes, []),
        setMuleIndices: useCallback(setMuleIndices, []),
        setBaseNodes: useCallback(setBaseNodes, []),
        setMulesFoundCount: useCallback(setMulesFoundCount, []),
        setActualMuleCount: useCallback(setActualMuleCount, []),
        setGridDimensions: useCallback(setGridDimensions, []),
        setGameOverModalShown: useCallback(setGameOverModalShown, []),
        setVictoryModalShown: useCallback(setVictoryModalShown, []),
    };

    return {
        // State values
        activeTransactions,
        isGridReady,
        totalMoneyInCirculation,
        moneyLostToMules,
        activeRipples,
        pendingMoneyLoss,
        lockedNodes,
        shakingNodes,
        muleIndices,
        baseNodes,
        mulesFoundCount,
        actualMuleCount,
        gridDimensions,
        gameOverModalShown,
        victoryModalShown,
        // Stable setters
        ...stableSetters,
    };
};