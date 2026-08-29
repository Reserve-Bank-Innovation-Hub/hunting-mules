// REACT CORE ==========================================================================================================
import React, { useRef } from "react";
import { Node } from "reactflow";

// LIB =================================================================================================================
import { calculateGridDimensions } from "$lib/gridCalculations";
import { getGridConfig, setActiveGridOverrides, LOW_BALANCE_CONFIG } from "$lib/gameConfig";
import { ROUNDS } from "$lib/roundConfig";
import { GridDimensions } from "$lib/gameTypes";
import { buildNetwork, scatterPosition, Network } from "$lib/network";

interface SetupGridOptions {
    roundIndex         : number;
    muleIndices        : Set<number> | null;
    shouldRecalculateOnResize : () => boolean;   // Read live, so resize is judged on the current phase
    setGridDimensions  : (dimensions : GridDimensions | null) => void;
    setIsGridReady     : (ready : boolean) => void;
    setBaseNodes       : (nodes : Node[]) => void;
    setMuleIndices     : (indices : Set<number>) => void;
    setActualMuleCount : (count : number) => void;
    setTotalMuleCount  : (updater : (prev : number) => number) => void;
    setNodeBalances    : (updater : (prev : Map<string, number>) => Map<string, number>) => void;
    setNetwork         : (network : Network | null) => void;
}

interface UseGridLayoutReturn {
    containerRef : React.RefObject<HTMLDivElement>;
    setupGrid    : (options : SetupGridOptions) => (() => void) | void;
}

export const useGridLayout = () : UseGridLayoutReturn => {
    const containerRef = useRef<HTMLDivElement>(null);

    const setupGrid = ({
        roundIndex,
        muleIndices,
        shouldRecalculateOnResize,
        setGridDimensions,
        setIsGridReady,
        setBaseNodes,
        setMuleIndices,
        setActualMuleCount,
        setTotalMuleCount,
        setNodeBalances,
        setNetwork,
    } : SetupGridOptions) => {
        const round = ROUNDS[roundIndex];
        if (!round) return;

        const calculateGrid = () => {
            if (!containerRef.current) {
                return;
            }

            // Each round may want its own node size and density, and the node/ripple
            // components read this globally, so it has to be in place before we measure
            setActiveGridOverrides(round.gridOverrides);

            const rect = containerRef.current.getBoundingClientRect();
            const dimensions = calculateGridDimensions(rect);
            const gridConfig = getGridConfig();
            setGridDimensions(dimensions);

            // Create grid nodes. Ids carry the round so a node from a previous round can
            // never be mistaken for this one's — locks and found-mules are keyed on id.
            const gridNodes : Node[] = [];
            for (let row = 0; row < dimensions.rows; row++) {
                for (let col = 0; col < dimensions.columns; col++) {
                    const nodeId = `r${roundIndex}-circle-${row}-${col}`;
                    const latticeX = dimensions.startX + col * (gridConfig.CIRCLE_SIZE + dimensions.spacingX);
                    const latticeY = dimensions.startY + row * (gridConfig.CIRCLE_SIZE + dimensions.spacingY);

                    // Nudge off the lattice so the board reads as a network, not a spreadsheet
                    const position = scatterPosition(
                        latticeX, latticeY, dimensions.spacingX, dimensions.spacingY,
                        {width : rect.width, height : rect.height, nodeSize : gridConfig.CIRCLE_SIZE},
                    );

                    gridNodes.push({
                        id       : nodeId,
                        type     : "circle",
                        position,
                        data     : {isMule : false},
                    });
                }
            }

            // Initialize mule indices only once per round
            if (!muleIndices) {
                const totalNodes = gridNodes.length;
                // Honour the round's mule count, but never crowd the board
                const muleCount = Math.max(1, Math.min(
                    round.muleCount,
                    Math.floor(totalNodes * gridConfig.MAX_MULE_PERCENTAGE),
                ));
                const newMuleIndices = new Set<number>();

                while (newMuleIndices.size < muleCount) {
                    const randomIndex = Math.floor(Math.random() * totalNodes);
                    newMuleIndices.add(randomIndex);
                }

                setMuleIndices(newMuleIndices);
                setActualMuleCount(muleCount);
                // The scorecard denominator grows as each round is dealt in
                setTotalMuleCount(prev => prev + muleCount);

                // Mark selected nodes as mule accounts
                newMuleIndices.forEach(index => {
                    if (gridNodes[index]) {
                        gridNodes[index].data = {isMule : true};
                    }
                });
            } else {
                // Use existing mule indices
                muleIndices.forEach(index => {
                    if (gridNodes[index]) {
                        gridNodes[index].data = {isMule : true};
                    }
                });
            }

            // The low-balance round needs every account to start at its resting few hundred
            if (round.behaviour === "low-balance") {
                setNodeBalances(() => {
                    const balances = new Map<string, number>();
                    gridNodes.forEach(node => {
                        const jitter = Math.floor(Math.random() * LOW_BALANCE_CONFIG.JITTER);
                        balances.set(node.id, LOW_BALANCE_CONFIG.RESTING_BALANCE + jitter);
                    });
                    return balances;
                });
            }

            // Draw the relationships. Every transaction later travels one of these lines.
            setNetwork(buildNetwork(gridNodes));

            setBaseNodes(gridNodes);
            // Small delay to show loading state
            setTimeout(() => {
                setIsGridReady(true);
            }, 300);
        };

        // Wait for next frame to ensure container is rendered
        const timeoutId = setTimeout(calculateGrid, 100);

        // Add resize listener for responsive updates
        const handleResize = () => {
            // Don't recalculate grid between rounds or once the game has ended
            if (!shouldRecalculateOnResize()) {
                return;
            }
            setIsGridReady(false);
            calculateGrid();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("resize", handleResize);
        };
    };

    return {
        containerRef,
        setupGrid,
    };
};
