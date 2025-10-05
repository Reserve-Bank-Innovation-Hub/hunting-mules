// REACT CORE ==========================================================================================================
import { useEffect, useCallback } from "react";

// UI ==================================================================================================================
import { showModal } from "fictoan-react";

// LIB =================================================================================================================
import { NodeRipple } from "$lib/gameTypes";

// ASSETS ==============================================================================================================
import LoseSound from "../assets/sounds/lose.wav";
import VictorySound from "../assets/sounds/victory.wav";

interface UseGameFlowProps {
    totalMoneyInCirculation : number;
    mulesFoundCount         : number;
    actualMuleCount         : number;
    gameOverModalShown      : boolean;
    victoryModalShown       : boolean;
    timeLeft                : number;
    setGameOverModalShown   : (shown : boolean) => void;
    setVictoryModalShown    : (shown : boolean) => void;
    setActiveRipples        : (updater : (prev : NodeRipple[]) => NodeRipple[]) => void;
    setTimeLeft             : (updater : (prev : number) => number) => void;
}

export const useGameFlow = ({
    totalMoneyInCirculation,
    mulesFoundCount,
    actualMuleCount,
    gameOverModalShown,
    victoryModalShown,
    timeLeft,
    setGameOverModalShown,
    setVictoryModalShown,
    setActiveRipples,
    setTimeLeft,
} : UseGameFlowProps) => {

    // Create ripple effect for a node
    const createRipple = useCallback((nodeId : string, x : number, y : number, isLocked : boolean = false) => {
        const newRipple : NodeRipple = {
            id : `ripple-${Date.now()}-${Math.random()}`,
            nodeId,
            x,
            y,
            isLocked,
        };
        setActiveRipples(prev => [ ...prev, newRipple ]);
    }, [ setActiveRipples ]);

    // Handle ripple completion
    const handleRippleComplete = useCallback((rippleId : string) => {
        setActiveRipples(prev => prev.filter(r => r.id !== rippleId));
    }, [ setActiveRipples ]);

    // Show game over modal when money reaches 0
    useEffect(() => {
        if (totalMoneyInCirculation <= 0 && !gameOverModalShown) {
            setTimeout(() => {
                // Play lose sound
                const audio = new Audio(LoseSound);
                audio.play().catch((error) => {
                    console.log("Audio playback failed:", error);
                });

                showModal("game-over-modal");
                setGameOverModalShown(true);
            }, 1000); // Small delay to let the last transaction complete
        }
    }, [ totalMoneyInCirculation, gameOverModalShown, setGameOverModalShown ]);

    // Show victory modal when all mules are found
    useEffect(() => {
        if (mulesFoundCount === actualMuleCount && actualMuleCount > 0 && !victoryModalShown) {
            setTimeout(() => {
                // Play victory sound
                const audio = new Audio(VictorySound);
                audio.play().catch((error) => {
                    console.log("Audio playback failed:", error);
                });

                showModal("victory-modal");
                setVictoryModalShown(true);
            }, 500); // Small delay for better UX
        }
    }, [ mulesFoundCount, actualMuleCount, victoryModalShown, setVictoryModalShown ]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0 || victoryModalShown || gameOverModalShown) {
            return; // Stop countdown if time is up or game ended
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [ timeLeft, victoryModalShown, gameOverModalShown, setTimeLeft ]);

    // Handle timer end - show victory modal with partial results
    useEffect(() => {
        if (timeLeft === 0 && !victoryModalShown && !gameOverModalShown && actualMuleCount > 0) {
            setTimeout(() => {
                // Play victory sound
                const audio = new Audio(VictorySound);
                audio.play().catch((error) => {
                    console.log("Audio playback failed:", error);
                });

                showModal("victory-modal");
                setVictoryModalShown(true);
            }, 500);
        }
    }, [ timeLeft, victoryModalShown, gameOverModalShown, actualMuleCount, setVictoryModalShown ]);

    return {
        createRipple,
        handleRippleComplete,
    };
};