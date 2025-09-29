import { useEffect, useCallback } from "react";
import { showModal } from "fictoan-react";
import { NodeRipple } from "../lib/gameTypes";

interface UseGameFlowProps {
    totalMoneyInCirculation: number;
    mulesFoundCount: number;
    actualMuleCount: number;
    gameOverModalShown: boolean;
    victoryModalShown: boolean;
    setGameOverModalShown: (shown: boolean) => void;
    setVictoryModalShown: (shown: boolean) => void;
    setActiveRipples: (updater: (prev: NodeRipple[]) => NodeRipple[]) => void;
}

export const useGameFlow = ({
    totalMoneyInCirculation,
    mulesFoundCount,
    actualMuleCount,
    gameOverModalShown,
    victoryModalShown,
    setGameOverModalShown,
    setVictoryModalShown,
    setActiveRipples,
}: UseGameFlowProps) => {

    // Create ripple effect for a node
    const createRipple = useCallback((nodeId: string, x: number, y: number, isLocked: boolean = false) => {
        const newRipple: NodeRipple = {
            id: `ripple-${Date.now()}-${Math.random()}`,
            nodeId,
            x,
            y,
            isLocked,
        };
        setActiveRipples(prev => [...prev, newRipple]);
    }, [setActiveRipples]);

    // Handle ripple completion
    const handleRippleComplete = useCallback((rippleId: string) => {
        setActiveRipples(prev => prev.filter(r => r.id !== rippleId));
    }, [setActiveRipples]);

    // Show game over modal when money reaches 0
    useEffect(() => {
        if (totalMoneyInCirculation <= 0 && !gameOverModalShown) {
            setTimeout(() => {
                showModal("game-over-modal");
                setGameOverModalShown(true);
            }, 1000); // Small delay to let the last transaction complete
        }
    }, [totalMoneyInCirculation, gameOverModalShown, setGameOverModalShown]);

    // Show victory modal when all mules are found
    useEffect(() => {
        if (mulesFoundCount === actualMuleCount && actualMuleCount > 0 && !victoryModalShown) {
            setTimeout(() => {
                showModal("victory-modal");
                setVictoryModalShown(true);
            }, 500); // Small delay for better UX
        }
    }, [mulesFoundCount, actualMuleCount, victoryModalShown, setVictoryModalShown]);

    return {
        createRipple,
        handleRippleComplete,
    };
};