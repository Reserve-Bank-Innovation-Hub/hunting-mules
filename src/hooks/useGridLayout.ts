// REACT CORE ==========================================================================================================
import React, { useRef } from "react";
import { Node } from "reactflow";

// LIB =================================================================================================================
import { calculateGridDimensions } from "$lib/gridCalculations";
import { getGridConfig, MULE_ACCOUNTS } from "$lib/gameConfig";

interface UseGridLayoutReturn {
        containerRef : React.RefObject<HTMLDivElement>;
        setupGrid    : (
                setGridDimensions : (dimensions : any) => void, setIsGridReady : (ready : boolean) => void, setBaseNodes : (nodes : Node[]) => void, setMuleIndices : (indices : Set<number>) => void, setActualMuleCount : (count : number) => void, muleIndices : Set<number> | null, gameOverModalShown : boolean, victoryModalShown : boolean,
        ) => void;
}

export const useGridLayout = () : UseGridLayoutReturn => {
    const containerRef = useRef<HTMLDivElement>(null);

    const setupGrid = (
        setGridDimensions : (dimensions : any) => void,
        setIsGridReady : (ready : boolean) => void,
        setBaseNodes : (nodes : Node[]) => void,
        setMuleIndices : (indices : Set<number>) => void,
        setActualMuleCount : (count : number) => void,
        muleIndices : Set<number> | null,
        gameOverModalShown : boolean,
        victoryModalShown : boolean,
    ) => {
        const calculateGrid = () => {
            if (!containerRef.current) {
                return;
            }

            const rect = containerRef.current.getBoundingClientRect();
            const dimensions = calculateGridDimensions(rect);
            setGridDimensions(dimensions);

            // Create grid nodes
            const gridNodes : Node[] = [];
            for (let row = 0; row < dimensions.rows; row++) {
                for (let col = 0; col < dimensions.columns; col++) {
                    const nodeId = `circle-${row}-${col}`;
                    const gridConfig = getGridConfig();
                    const xPosition = dimensions.startX + col * (gridConfig.CIRCLE_SIZE + dimensions.spacingX);
                    const yPosition = dimensions.startY + row * (gridConfig.CIRCLE_SIZE + dimensions.spacingY);

                    gridNodes.push({
                        id       : nodeId,
                        type     : "circle",
                        position : {x : xPosition, y : yPosition},
                        data     : {isMule : false},
                    });
                }
            }

            // Initialize mule indices only once
            if (!muleIndices) {
                const totalNodes = gridNodes.length;
                const muleCount = Math.min(MULE_ACCOUNTS, Math.floor(totalNodes * 0.25));
                const newMuleIndices = new Set<number>();

                while (newMuleIndices.size < muleCount) {
                    const randomIndex = Math.floor(Math.random() * totalNodes);
                    newMuleIndices.add(randomIndex);
                }

                setMuleIndices(newMuleIndices);
                setActualMuleCount(muleCount);

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
            // Don't recalculate grid if game has ended
            if (gameOverModalShown || victoryModalShown) {
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