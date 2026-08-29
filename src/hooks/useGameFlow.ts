// REACT CORE ==========================================================================================================
import { useEffect, useCallback } from "react";

// LIB =================================================================================================================
import { NodeRipple, TransactionInstance, GamePhase } from "$lib/gameTypes";
import { ROUNDS, TOTAL_ROUNDS } from "$lib/roundConfig";

// ASSETS ==============================================================================================================
import LoseSound from "../assets/sounds/lose.wav";
import VictorySound from "../assets/sounds/victory.wav";

interface UseGameFlowProps {
    totalMoneyInCirculation : number;
    actualMuleCount         : number;
    lockedNodes             : Set<string>;
    gameOverModalShown      : boolean;
    victoryModalShown       : boolean;
    roundTimeLeft           : number;
    phase                   : GamePhase;
    roundIndex              : number;
    setGameOverModalShown   : (shown : boolean) => void;
    setVictoryModalShown    : (shown : boolean) => void;
    setActiveRipples        : (updater : (prev : NodeRipple[]) => NodeRipple[]) => void;
    setRoundTimeLeft        : (updater : (prev : number) => number) => void;
    setGameOverReason       : (reason : "money" | "time" | null) => void;
    setPhase                : (phase : GamePhase) => void;
    setRoundIndex           : (updater : (prev : number) => number) => void;
    setLockedNodes          : (updater : (prev : Set<string>) => Set<string>) => void;
    setShakingNodes         : (updater : (prev : Set<string>) => Set<string>) => void;
    setActiveTransactions   : (updater : (prev : TransactionInstance[]) => TransactionInstance[]) => void;
    setMuleIndices          : (indices : Set<number> | null) => void;
    setSurgingNodes         : (updater : (prev : Set<string>) => Set<string>) => void;
    setIsGridReady          : (ready : boolean) => void;
}

export const useGameFlow = ({
    totalMoneyInCirculation,
    actualMuleCount,
    lockedNodes,
    gameOverModalShown,
    victoryModalShown,
    roundTimeLeft,
    phase,
    roundIndex,
    setGameOverModalShown,
    setVictoryModalShown,
    setActiveRipples,
    setRoundTimeLeft,
    setGameOverReason,
    setPhase,
    setRoundIndex,
    setLockedNodes,
    setShakingNodes,
    setActiveTransactions,
    setMuleIndices,
    setSurgingNodes,
    setIsGridReady,
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

    // Wipe the board so the next round starts clean. Node ids are round-scoped, so
    // this is about clearing visuals rather than correctness.
    const clearBoard = useCallback(() => {
        setLockedNodes(() => new Set());
        setShakingNodes(() => new Set());
        setSurgingNodes(() => new Set());
        setActiveTransactions(() => []);
        setActiveRipples(() => []);
        setMuleIndices(null);
        setIsGridReady(false);
    }, [ setLockedNodes, setShakingNodes, setSurgingNodes, setActiveTransactions, setActiveRipples, setMuleIndices, setIsGridReady ]);

    // Player has read the intro card and wants to play
    const startRound = useCallback(() => {
        setRoundTimeLeft(() => ROUNDS[roundIndex].duration);
        setPhase("playing");
    }, [ roundIndex, setRoundTimeLeft, setPhase ]);

    // Count down the current round. One interval per round, so it never drifts.
    useEffect(() => {
        if (phase !== "playing") {
            return;
        }

        const interval = setInterval(() => {
            setRoundTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [ phase, roundIndex, setRoundTimeLeft ]);

    // A round ends when its time runs out, or when every mule in it has been caught
    useEffect(() => {
        if (phase !== "playing" || gameOverModalShown) {
            return;
        }

        const roundCleared = actualMuleCount > 0 && lockedNodes.size >= actualMuleCount;
        if (roundTimeLeft > 0 && !roundCleared) {
            return;
        }

        // Let the last transaction land before moving on
        const timeoutId = setTimeout(() => {
            if (roundIndex + 1 < TOTAL_ROUNDS) {
                clearBoard();
                setRoundIndex(prev => prev + 1);
                setPhase("intro");
            } else {
                // Last pattern done — hand over to the result panel
                setPhase("finished");

                const audio = new Audio(VictorySound);
                audio.play().catch((error) => {
                    console.log("Audio playback failed:", error);
                });

                setVictoryModalShown(true);
            }
        }, roundCleared ? 700 : 400);

        return () => clearTimeout(timeoutId);
    }, [
        phase, roundTimeLeft, actualMuleCount, lockedNodes.size, roundIndex, gameOverModalShown,
        clearBoard, setRoundIndex, setPhase, setVictoryModalShown,
    ]);

    // Losing the whole pot ends the game outright, whichever round we are in
    useEffect(() => {
        if (totalMoneyInCirculation > 0 || gameOverModalShown || victoryModalShown) {
            return;
        }

        const timeoutId = setTimeout(() => {
            const audio = new Audio(LoseSound);
            audio.play().catch((error) => {
                console.log("Audio playback failed:", error);
            });

            setGameOverReason("money");
            setPhase("finished");
            setGameOverModalShown(true);
        }, 1000); // Small delay to let the last transaction complete

        return () => clearTimeout(timeoutId);
    }, [ totalMoneyInCirculation, gameOverModalShown, victoryModalShown, setGameOverModalShown, setGameOverReason, setPhase ]);

    return {
        createRipple,
        handleRippleComplete,
        startRound,
    };
};
