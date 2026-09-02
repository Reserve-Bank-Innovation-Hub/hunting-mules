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
    // Held as the accounts caught, not as a running total. The score is how many
    // there are, so a catch that somehow registers twice — a double-fired click, an
    // updater React chose to run again — still counts once, because adding an id
    // already present changes nothing. A `count + 1` cannot make that promise.
    //
    // Each catch is kept with the pattern the account was running at the time, so
    // the field visits after the round can say what an account was frozen for.
    //
    // Node ids carry their round, so an account caught in round two can never be
    // confused with the one standing in the same place in round three. The map is
    // never cleared: the score runs the whole eighty seconds.
    const [ caughtMules, setCaughtMules ] = useState<Map<string, PatternBehaviour>>(new Map());
    const mulesFoundCount = caughtMules.size;

    // THE ROUND =======================================================================================================
    // One continuous round. It opens on the first pattern's intro, which is not on the clock.
    const [ phase, setPhase ] = useState<GamePhase>("intro");
    const [ timeLeft, setTimeLeft ] = useState(ROUND_DURATION);
    const [ unlockedPatterns, setUnlockedPatterns ] = useState(0);
    const [ introPatternIndex, setIntroPatternIndex ] = useState<number | null>(0);

    // THE FIELD VISITS ================================================================================================
    // How many verdicts the player got right. Kept apart from the score on purpose:
    // catching and verifying are different skills, and the leaderboard ranks the first.
    const [ eddCorrect, setEddCorrect ] = useState<number | null>(null);

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
        setCaughtMules             : useCallback(setCaughtMules, []),
        setEddCorrect              : useCallback(setEddCorrect, []),
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
        caughtMules,
        mulesFoundCount,
        eddCorrect,
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
