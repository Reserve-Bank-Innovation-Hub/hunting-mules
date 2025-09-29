import { useCallback } from "react";

interface UseNodeInteractionsProps {
    lockedNodes: Set<string>;
    setLockedNodes: (updater: (prev: Set<string>) => Set<string>) => void;
    setShakingNodes: (updater: (prev: Set<string>) => Set<string>) => void;
    setMulesFoundCount: (updater: (prev: number) => number) => void;
}

export const useNodeInteractions = ({
    lockedNodes,
    setLockedNodes,
    setShakingNodes,
    setMulesFoundCount,
}: UseNodeInteractionsProps) => {

    // Handle node clicks
    const handleNodeClick = useCallback((nodeId: string, isMule: boolean) => {
        if (isMule) {
            // Check if already locked before making any changes
            setLockedNodes(prev => {
                if (prev.has(nodeId)) {
                    return prev; // Already locked, no changes
                }

                // Not locked yet - increment counter and lock
                const newLockedNodes = new Set(prev).add(nodeId);
                setMulesFoundCount(count => count + 1);
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
    }, [setLockedNodes, setShakingNodes, setMulesFoundCount]);

    return {
        handleNodeClick,
    };
};