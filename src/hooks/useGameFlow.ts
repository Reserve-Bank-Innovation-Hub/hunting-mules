// REACT CORE ==========================================================================================================
import { useEffect, useCallback } from "react";

// LIB =================================================================================================================
import { NodeRipple, PatternFlash, GamePhase } from "$lib/gameTypes";
import { PatternBehaviour, PATTERNS, TOTAL_PATTERNS } from "$lib/roundConfig";
import { ROUND_DURATION } from "$lib/gameConfig";
import { TransactionInstance } from "$lib/gameTypes";

// ASSETS ==============================================================================================================
import VictorySound from "../assets/sounds/victory.wav";

interface UseGameFlowProps {
    timeLeft             : number;
    phase                : GamePhase;
    unlockedPatterns      : number;
    introPatternIndex     : number | null;
    isGridReady           : boolean;
    setActiveRipples      : (updater : (prev : NodeRipple[]) => NodeRipple[]) => void;
    setPatternFlashes     : (updater : (prev : PatternFlash[]) => PatternFlash[]) => void;
    setActiveTransactions : (updater : (prev : TransactionInstance[]) => TransactionInstance[]) => void;
    setLockedNodes        : (updater : (prev : Set<string>) => Set<string>) => void;
    setShakingNodes       : (updater : (prev : Set<string>) => Set<string>) => void;
    setMuleRoles          : (updater : (prev : Map<string, PatternBehaviour>) => Map<string, PatternBehaviour>) => void;
    setNodeBalances       : (updater : (prev : Map<string, number>) => Map<string, number>) => void;
    setIsGridReady        : (ready : boolean) => void;
    setTimeLeft           : (updater : (prev : number) => number) => void;
    setPhase              : (phase : GamePhase) => void;
    setUnlockedPatterns   : (updater : (prev : number) => number) => void;
    setIntroPatternIndex  : (index : number | null) => void;
    setEddCorrect         : (correct : number | null) => void;
    // Whether the field visits run when the clock runs out, or the result rises at once
    isEddEnabled          : boolean;
}

export const useGameFlow = ({
    timeLeft,
    phase,
    unlockedPatterns,
    introPatternIndex,
    isGridReady,
    setActiveRipples,
    setPatternFlashes,
    setActiveTransactions,
    setLockedNodes,
    setShakingNodes,
    setMuleRoles,
    setNodeBalances,
    setIsGridReady,
    setTimeLeft,
    setPhase,
    setUnlockedPatterns,
    setIntroPatternIndex,
    setEddCorrect,
    isEddEnabled,
} : UseGameFlowProps) => {

    // Create ripple effect for a node
    const createRipple = useCallback((nodeId : string, x : number, y : number, isLocked : boolean = false, isMuleReceiving : boolean = false) => {
        const newRipple : NodeRipple = {
            id : `ripple-${Date.now()}-${Math.random()}`,
            nodeId,
            x,
            y,
            isLocked,
            isMuleReceiving,
        };
        setActiveRipples(prev => [ ...prev, newRipple ]);
    }, [ setActiveRipples ]);

    // Handle ripple completion
    const handleRippleComplete = useCallback((rippleId : string) => {
        setActiveRipples(prev => prev.filter(r => r.id !== rippleId));
    }, [ setActiveRipples ]);

    // A flash line clears itself the moment its animation ends, so none of them
    // outlive the transaction they were drawn for
    const handleFlashComplete = useCallback((flashId : string) => {
        setPatternFlashes(prev => prev.filter(flash => flash.id !== flashId));
    }, [ setPatternFlashes ]);

    /**
     * The player has read a pattern's intro and wants to carry on.
     *
     * Every pattern is its own round and gets a board of its own: the accounts are
     * dealt again from scratch, so the stamps from the last twenty seconds are
     * cleared along with them. Nothing else resets — the clock picks up where it
     * paused, and the caught count carries straight through to the end.
     */
    const dismissIntro = useCallback(() => {
        if (introPatternIndex === null) {
            return;
        }

        // The opening pattern plays on the board built while its intro was up; every
        // one after that clears the table first. The grid rebuilds itself off the
        // round index, and deals fresh mules and balances as it goes.
        if (introPatternIndex > 0) {
            setIsGridReady(false);
            setLockedNodes(() => new Set());
            setShakingNodes(() => new Set());
            setActiveTransactions(() => []);
            setActiveRipples(() => []);
            setPatternFlashes(() => []);
            setMuleRoles(() => new Map());
            setNodeBalances(() => new Map());
        }

        setUnlockedPatterns(() => introPatternIndex + 1);
        setIntroPatternIndex(null);
        setPhase("playing");
    }, [
        introPatternIndex, setIsGridReady, setLockedNodes, setShakingNodes,
        setActiveTransactions, setActiveRipples, setPatternFlashes, setMuleRoles,
        setNodeBalances, setUnlockedPatterns, setIntroPatternIndex, setPhase,
    ]);

    // THE CLOCK =======================================================================================================
    // One continuous 80 seconds across all four patterns. A pattern intro takes the
    // phase out of "playing", which stops the clock, so reading an intro never costs
    // the player time — and neither does the moment it takes to deal the next board.
    useEffect(() => {
        if (phase !== "playing" || !isGridReady) {
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [ phase, isGridReady, setTimeLeft ]);

    // PATTERN UNLOCKS =================================================================================================
    // Each pattern joins at its own point in the round, announced by its intro
    useEffect(() => {
        if (phase !== "playing" || unlockedPatterns >= TOTAL_PATTERNS) {
            return;
        }

        const elapsed = ROUND_DURATION - timeLeft;
        const next = PATTERNS[unlockedPatterns];

        if (elapsed >= next.unlockAt) {
            setIntroPatternIndex(unlockedPatterns);
            setPhase("intro");
        }
    }, [ phase, timeLeft, unlockedPatterns, setIntroPatternIndex, setPhase ]);

    // THE END =========================================================================================================
    // The result rises, the score is written, and the reward sound plays with it
    const finishRound = useCallback(() => {
        setPhase("finished");

        const audio = new Audio(VictorySound);
        audio.play().catch((error) => {
            console.log("Audio playback failed:", error);
        });
    }, [ setPhase ]);

    // The round ends when the clock does, and only then. With the field visits on, it
    // does not go straight to the result: the accounts the player froze go to the
    // branch first, and the score is only written once those are done. With them
    // off, the result rises at once, exactly as it did before the visits existed.
    useEffect(() => {
        if (phase !== "playing" || timeLeft > 0) {
            return;
        }

        // Let whatever is mid-flight land before the next screen takes over
        const timeoutId = setTimeout(() => {
            if (isEddEnabled) {
                setPhase("edd");
            } else {
                finishRound();
            }
        }, 700);

        return () => clearTimeout(timeoutId);
    }, [ phase, timeLeft, isEddEnabled, setPhase, finishRound ]);

    // The visits are done. The verdict count is kept, and now the result can rise.
    const finishEdd = useCallback((correct : number) => {
        setEddCorrect(correct);
        finishRound();
    }, [ setEddCorrect, finishRound ]);

    // The player would rather not. Nothing is recorded, so the result shows no
    // verdicts figure, and nothing else about the run changes.
    const skipEdd = finishRound;

    return {
        createRipple,
        handleRippleComplete,
        handleFlashComplete,
        dismissIntro,
        finishEdd,
        skipEdd,
    };
};
