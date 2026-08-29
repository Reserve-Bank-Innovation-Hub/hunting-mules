// REACT CORE ==========================================================================================================
import { useCallback, useRef } from "react";

// LIB =================================================================================================================
import { TransactionInstance } from "$lib/gameTypes";

// ASSETS ==============================================================================================================
import UncoveredSound from "../assets/sounds/uncovered.wav";
import WrongSound from "../assets/sounds/wrong.wav";

interface UseNodeInteractionsProps {
    lockedNodes           : Set<string>;
    activeTransactions    : TransactionInstance[];
    setLockedNodes        : (updater : (prev : Set<string>) => Set<string>) => void;
    setShakingNodes       : (updater : (prev : Set<string>) => Set<string>) => void;
    setMulesFoundCount    : (updater : (prev : number) => number) => void;
    setActiveTransactions : (updater : (prev : TransactionInstance[]) => TransactionInstance[]) => void;
}

export const useNodeInteractions = ({
    lockedNodes,
    activeTransactions,
    setLockedNodes,
    setShakingNodes,
    setMulesFoundCount,
    setActiveTransactions,
} : UseNodeInteractionsProps) => {
    // Mules already counted towards the score. Held in a ref so the de-dupe check happens
    // in the click handler itself, never inside a state updater — React may call an updater
    // more than once for the same click, which would count the same mule twice.
    const countedMules = useRef<Set<string>>(new Set());

    // Handle node clicks
    const handleNodeClick = useCallback((nodeId : string, isMule : boolean) => {
        if (isMule) {
            // Already found, so nothing to do
            if (countedMules.current.has(nodeId)) {
                return;
            }
            countedMules.current.add(nodeId);

            // Lock the node and score it — both updaters stay pure
            setLockedNodes(prev => new Set(prev).add(nodeId));
            setMulesFoundCount(count => count + 1);

            // Play uncovered sound
            const audio = new Audio(UncoveredSound);
            audio.play().catch((error) => {
                console.log("Audio playback failed:", error);
            });

            // Check for and reverse any mid-flight transactions to this mule
            const bouncedAt = Date.now();

            setActiveTransactions(transactions =>
                transactions.map(transaction => {
                    // If transaction is heading to this mule and not already bounced, reverse it
                    if (transaction.toNode.id === nodeId && !transaction.isBounced) {
                        return {
                            ...transaction,
                            isBounced: true,
                            // Swap the from and to nodes to reverse direction
                            fromNode: transaction.toNode,
                            toNode: transaction.fromNode,
                            startTime: bouncedAt, // Reset animation start time
                        };
                    }
                    return transaction;
                })
            );
        } else {
            // Shake normal account
            setShakingNodes(prev => new Set(prev).add(nodeId));

            // Play wrong sound
            const audio = new Audio(WrongSound);
            audio.play().catch((error) => {
                console.log("Audio playback failed:", error);
            });

            // Remove shake effect after animation
            setTimeout(() => {
                setShakingNodes(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(nodeId);
                    return newSet;
                });
            }, 600); // Match CSS animation duration
        }
    }, [ setLockedNodes, setShakingNodes, setMulesFoundCount, setActiveTransactions ]);

    return {
        handleNodeClick,
    };
};
