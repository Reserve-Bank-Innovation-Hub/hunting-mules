// REACT CORE ==========================================================================================================
import { Node } from "reactflow";
import { useState, useCallback } from "react";

// LIB =================================================================================================================
import { ROUND_DURATION, TRANSACTION_CONFIG } from "$lib/gameConfig";
import { PatternBehaviour } from "$lib/roundConfig";
import {
    TransactionInstance, NodeRipple, PatternFlash, GridDimensions, GamePhase, UseGameStateReturn,
} from "$lib/gameTypes";
import { Network } from "$lib/network";

export const useGameState = () : UseGameStateReturn => {
    const [ activeTransactions, setActiveTransactions ] = useState<TransactionInstance[]>([]);
    const [ isGridReady, setIsGridReady ] = useState(false);
    const [ totalMoneyInCirculation, setTotalMoneyInCirculation ] = useState(TRANSACTION_CONFIG.STARTING_AMOUNT);
    const [ moneyLostToMules, setMoneyLostToMules ] = useState(0);
    const [ activeRipples, setActiveRipples ] = useState<NodeRipple[]>([]);
    const [ patternFlashes, setPatternFlashes ] = useState<PatternFlash[]>([]);
    const [ lockedNodes, setLockedNodes ] = useState<Set<string>>(new Set());
    const [ shakingNodes, setShakingNodes ] = useState<Set<string>>(new Set());
    const [ baseNodes, setBaseNodes ] = useState<Node[]>([]);
    const [ gridDimensions, setGridDimensions ] = useState<GridDimensions | null>(null);

    // SCORE ===========================================================================================================
    // Held as the set of accounts caught, not as a running total. The score is its
    // size, so a catch that somehow registers twice — a double-fired click, an
    // updater React chose to run again — still counts once, because adding an id
    // already in the set changes nothing. A `count + 1` cannot make that promise.
    //
    // Node ids carry their round, so an account caught in round two can never be
    // confused with the one standing in the same place in round three. The set is
    // never cleared: the score runs the whole eighty seconds.
    const [ caughtNodeIds, setCaughtNodeIds ] = useState<Set<string>>(new Set());
    const mulesFoundCount = caughtNodeIds.size;

    // THE ROUND =======================================================================================================
    // One continuous round. It opens on the first pattern's intro, which is not on the clock.
    const [ phase, setPhase ] = useState<GamePhase>("intro");
    const [ timeLeft, setTimeLeft ] = useState(ROUND_DURATION);
    const [ unlockedPatterns, setUnlockedPatterns ] = useState(0);
    const [ introPatternIndex, setIntroPatternIndex ] = useState<number | null>(0);

    // ACCOUNTS ========================================================================================================
    const [ muleRoles, setMuleRoles ] = useState<Map<string, PatternBehaviour>>(new Map());
    const [ nodeBalances, setNodeBalances ] = useState<Map<string, number>>(new Map());

    // NETWORK =========================================================================================================
    const [ network, setNetwork ] = useState<Network | null>(null);

    // Optimized setters using useCallback for stable references
    const stableSetters = {
        setActiveTransactions      : useCallback(setActiveTransactions, []),
        setIsGridReady             : useCallback(setIsGridReady, []),
        setTotalMoneyInCirculation : useCallback(setTotalMoneyInCirculation, []),
        setMoneyLostToMules        : useCallback(setMoneyLostToMules, []),
        setActiveRipples           : useCallback(setActiveRipples, []),
        setPatternFlashes          : useCallback(setPatternFlashes, []),
        setLockedNodes             : useCallback(setLockedNodes, []),
        setShakingNodes            : useCallback(setShakingNodes, []),
        setBaseNodes               : useCallback(setBaseNodes, []),
        setCaughtNodeIds           : useCallback(setCaughtNodeIds, []),
        setGridDimensions          : useCallback(setGridDimensions, []),
        setTimeLeft                : useCallback(setTimeLeft, []),
        setPhase                   : useCallback(setPhase, []),
        setUnlockedPatterns        : useCallback(setUnlockedPatterns, []),
        setIntroPatternIndex       : useCallback(setIntroPatternIndex, []),
        setMuleRoles               : useCallback(setMuleRoles, []),
        setNodeBalances            : useCallback(setNodeBalances, []),
        setNetwork                 : useCallback(setNetwork, []),
    };

    return {
        activeTransactions,
        isGridReady,
        totalMoneyInCirculation,
        moneyLostToMules,
        activeRipples,
        patternFlashes,
        lockedNodes,
        shakingNodes,
        baseNodes,
        caughtNodeIds,
        mulesFoundCount,
        gridDimensions,
        timeLeft,
        phase,
        unlockedPatterns,
        introPatternIndex,
        muleRoles,
        nodeBalances,
        network,
        ...stableSetters,
    };
};
