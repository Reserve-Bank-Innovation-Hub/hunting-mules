// REACT CORE ==========================================================================================================
import { Node } from "reactflow";
import { useState, useCallback } from "react";

// LIB =================================================================================================================
import { TRANSACTION_CONFIG } from "$lib/gameConfig";
import { ROUNDS } from "$lib/roundConfig";
import { TransactionInstance, NodeRipple, GridDimensions, GamePhase, UseGameStateReturn } from "$lib/gameTypes";
import { Network } from "$lib/network";

export const useGameState = () : UseGameStateReturn => {
    const [ activeTransactions, setActiveTransactions ] = useState<TransactionInstance[]>([]);
    const [ isGridReady, setIsGridReady ] = useState(false);
    const [ totalMoneyInCirculation, setTotalMoneyInCirculation ] = useState(TRANSACTION_CONFIG.STARTING_AMOUNT);
    const [ moneyLostToMules, setMoneyLostToMules ] = useState(0);
    const [ activeRipples, setActiveRipples ] = useState<NodeRipple[]>([]);
    const [ pendingMoneyLoss, setPendingMoneyLoss ] = useState<Map<string, number>>(new Map());
    const [ lockedNodes, setLockedNodes ] = useState<Set<string>>(new Set());
    const [ shakingNodes, setShakingNodes ] = useState<Set<string>>(new Set());
    const [ muleIndices, setMuleIndices ] = useState<Set<number> | null>(null);
    const [ baseNodes, setBaseNodes ] = useState<Node[]>([]);
    const [ mulesFoundCount, setMulesFoundCount ] = useState(0);
    const [ actualMuleCount, setActualMuleCount ] = useState(0);
    const [ gridDimensions, setGridDimensions ] = useState<GridDimensions | null>(null);
    const [ gameOverModalShown, setGameOverModalShown ] = useState(false);
    const [ victoryModalShown, setVictoryModalShown ] = useState(false);
    const [ gameOverReason, setGameOverReason ] = useState<"money" | "time" | null>(null);

    // ROUNDS ==========================================================================================================
    // The game opens on the first round's intro card, which is not on the clock
    const [ phase, setPhase ] = useState<GamePhase>("intro");
    const [ roundIndex, setRoundIndex ] = useState(0);
    const [ roundTimeLeft, setRoundTimeLeft ] = useState(ROUNDS[0].duration);
    // Mules planted so far across every round played, so the scorecard can span the whole game
    const [ totalMuleCount, setTotalMuleCount ] = useState(0);

    // LOW BALANCE =====================================================================================================
    const [ nodeBalances, setNodeBalances ] = useState<Map<string, number>>(new Map());
    const [ surgingNodes, setSurgingNodes ] = useState<Set<string>>(new Set());

    // NETWORK =========================================================================================================
    // Which accounts are joined to which, and which of those paths are lit right now
    const [ network, setNetwork ] = useState<Network | null>(null);
    const [ activeEdges, setActiveEdges ] = useState<Map<string, number>>(new Map());

    // Optimized setters using useCallback for stable references
    const stableSetters = {
        setActiveTransactions      : useCallback(setActiveTransactions, []),
        setIsGridReady             : useCallback(setIsGridReady, []),
        setTotalMoneyInCirculation : useCallback(setTotalMoneyInCirculation, []),
        setMoneyLostToMules        : useCallback(setMoneyLostToMules, []),
        setActiveRipples           : useCallback(setActiveRipples, []),
        setPendingMoneyLoss        : useCallback(setPendingMoneyLoss, []),
        setLockedNodes             : useCallback(setLockedNodes, []),
        setShakingNodes            : useCallback(setShakingNodes, []),
        setMuleIndices             : useCallback(setMuleIndices, []),
        setBaseNodes               : useCallback(setBaseNodes, []),
        setMulesFoundCount         : useCallback(setMulesFoundCount, []),
        setActualMuleCount         : useCallback(setActualMuleCount, []),
        setGridDimensions          : useCallback(setGridDimensions, []),
        setGameOverModalShown      : useCallback(setGameOverModalShown, []),
        setVictoryModalShown       : useCallback(setVictoryModalShown, []),
        setRoundTimeLeft           : useCallback(setRoundTimeLeft, []),
        setGameOverReason          : useCallback(setGameOverReason, []),
        setPhase                   : useCallback(setPhase, []),
        setRoundIndex              : useCallback(setRoundIndex, []),
        setTotalMuleCount          : useCallback(setTotalMuleCount, []),
        setNodeBalances            : useCallback(setNodeBalances, []),
        setSurgingNodes            : useCallback(setSurgingNodes, []),
        setNetwork                 : useCallback(setNetwork, []),
        setActiveEdges             : useCallback(setActiveEdges, []),
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
        roundTimeLeft,
        gameOverReason,
        phase,
        roundIndex,
        totalMuleCount,
        nodeBalances,
        surgingNodes,
        network,
        activeEdges,
        // Stable setters
        ...stableSetters,
    };
};
