// REACT CORE ==========================================================================================================
import { useCallback } from "react";

// LIB =================================================================================================================
import { TransactionInstance } from "$lib/gameTypes";

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

    // Handle node clicks
    const handleNodeClick = useCallback((nodeId : string, isMule : boolean) => {
        if (isMule) {
            // Check if already locked before making any changes
            setLockedNodes(prev => {
                if (prev.has(nodeId)) {
                    return prev; // Already locked, no changes
                }

                // Not locked yet - increment counter and lock
                const newLockedNodes = new Set(prev).add(nodeId);
                setMulesFoundCount(count => count + 1);

                // Check for and reverse any mid-flight transactions to this mule
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
                                startTime: Date.now(), // Reset animation start time
                            };
                        }
                        return transaction;
                    })
                );

                return newLockedNodes;
            });
        } else {
            // Shake normal account
            setShakingNodes(prev => new Set(prev).add(nodeId));

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