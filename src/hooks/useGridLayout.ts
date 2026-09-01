// REACT CORE ==========================================================================================================
import React, { useRef } from "react";
import { Node } from "reactflow";

// LIB =================================================================================================================
import { calculateGridDimensions } from "$lib/gridCalculations";
import { getGridConfig, ACTIVE_MULES } from "$lib/gameConfig";
import { GridDimensions } from "$lib/gameTypes";
import { PatternBehaviour } from "$lib/roundConfig";
import { buildNetwork, clampToBoard, Network } from "$lib/network";
import { dealOpeningBalances, distributeRoles, restingBalance } from "$lib/behaviours";

interface SetupGridOptions {
    roundIndex                : number;   // Scopes the node ids to this pattern's board
    // Read live, so a resize is judged on the state as it is at that moment
    shouldRecalculateOnResize : () => boolean;
    currentRoles              : () => Map<string, PatternBehaviour>;
    currentBalances           : () => Map<string, number>;
    unlockedBehaviours        : () => PatternBehaviour[];
    setGridDimensions         : (dimensions : GridDimensions | null) => void;
    setIsGridReady            : (ready : boolean) => void;
    setBaseNodes              : (nodes : Node[]) => void;
    setMuleRoles              : (updater : (prev : Map<string, PatternBehaviour>) => Map<string, PatternBehaviour>) => void;
    setNodeBalances           : (updater : (prev : Map<string, number>) => Map<string, number>) => void;
    setNetwork                : (network : Network | null) => void;
}

interface UseGridLayoutReturn {
    containerRef : React.RefObject<HTMLDivElement>;
    setupGrid    : (options : SetupGridOptions) => (() => void) | void;
}

export const useGridLayout = () : UseGridLayoutReturn => {
    const containerRef = useRef<HTMLDivElement>(null);

    const setupGrid = ({
        roundIndex,
        shouldRecalculateOnResize,
        currentRoles,
        currentBalances,
        unlockedBehaviours,
        setGridDimensions,
        setIsGridReady,
        setBaseNodes,
        setMuleRoles,
        setNodeBalances,
        setNetwork,
    } : SetupGridOptions) => {

        const calculateGrid = () => {
            if (!containerRef.current) {
                return;
            }

            const rect = containerRef.current.getBoundingClientRect();
            const dimensions = calculateGridDimensions(rect);
            const gridConfig = getGridConfig();
            setGridDimensions(dimensions);

            // Ids carry the round, so nothing from the previous pattern's board — a
            // stamp, a role, a balance — can be mistaken for an account on this one.
            // Within a round they are position-based and survive a resize.
            const gridNodes : Node[] = [];
            for (let row = 0; row < dimensions.rows; row++) {
                for (let col = 0; col < dimensions.columns; col++) {
                    const latticeX = dimensions.startX + col * (gridConfig.CIRCLE_SIZE + dimensions.spacingX);
                    const latticeY = dimensions.startY + row * (gridConfig.CIRCLE_SIZE + dimensions.spacingY);

                    // Straight onto the lattice — accounts line up in rows and columns
                    const position = clampToBoard(
                        latticeX, latticeY,
                        {width : rect.width, height : rect.height, nodeSize : gridConfig.CIRCLE_SIZE},
                    );

                    gridNodes.push({
                        id       : `r${roundIndex}-acct-${row}-${col}`,
                        type     : "circle",
                        position,
                        data     : {isMule : false},
                    });
                }
            }

            // Never crowd the board, however many mules the config asks for
            const muleCount = Math.max(1, Math.min(
                ACTIVE_MULES,
                Math.floor(gridNodes.length * gridConfig.MAX_MULE_PERCENTAGE),
            ));

            // Keep whichever mules survive a resize, then top back up to the target.
            // A first build has nothing to keep, so this deals a fresh set.
            const existing = currentRoles();
            const behaviours = unlockedBehaviours();
            const survivors = gridNodes.filter(node => existing.has(node.id)).map(node => node.id);
            const vacancies = Math.max(0, muleCount - survivors.length);

            const recruits = gridNodes
                .filter(node => !existing.has(node.id))
                .sort(() => Math.random() - 0.5)
                .slice(0, vacancies)
                .map(node => node.id);

            const roles = new Map<string, PatternBehaviour>();
            survivors.forEach(id => roles.set(id, existing.get(id)!));
            distributeRoles(recruits, behaviours, currentBalances())
                .forEach((behaviour, id) => roles.set(id, behaviour));

            // Every account is dealt an opening balance, and keeps it on its node for
            // the whole round. An account that has been a mule and been cleaned up
            // returns to this figure rather than to a fresh roll of the dice — on a
            // board of twenty, re-rolling on every catch would let the spread of small
            // and rich accounts wander off over eighty seconds, and both the
            // low-balance pattern and the decoys are read against that spread.
            const openings = dealOpeningBalances(gridNodes.map(node => node.id));
            roles.forEach((behaviour, id) => {
                if (behaviour === "low-balance") {
                    openings.set(id, restingBalance());
                }
            });

            gridNodes.forEach(node => {
                node.data = {
                    isMule         : roles.has(node.id),
                    openingBalance : openings.get(node.id),
                };
            });

            setMuleRoles(() => roles);

            // Balances survive a resize — only accounts new to the board are dealt one
            setNodeBalances(prev => {
                const balances = new Map(prev);
                gridNodes.forEach(node => {
                    if (!balances.has(node.id)) {
                        balances.set(node.id, openings.get(node.id)!);
                    }
                    // A low-balance mule has to actually be sitting on a few hundred
                    // rupees, or the pattern it runs makes no sense to look at
                    if (roles.get(node.id) === "low-balance" && balances.get(node.id)! > 5000) {
                        balances.set(node.id, restingBalance());
                    }
                });
                return balances;
            });

            // Draw the relationships. Every transaction later travels one of these lines.
            setNetwork(buildNetwork(gridNodes));

            setBaseNodes(gridNodes);
            // Small delay to show loading state
            setTimeout(() => {
                setIsGridReady(true);
            }, 300);
        };

        // The board is laid out from a measurement of the play area, so it must not be
        // measured until the play area actually has its size. A fixed delay was doing
        // exactly that: on a slower first paint the measurement landed while the
        // container was still a couple of hundred pixels tall, and the board was built
        // to fit that — one row of accounts stranded at the top of an empty screen.
        //
        // Watching the element instead means the first real size triggers the build,
        // whenever it arrives, and any later change rebuilds it the same way.
        let built : { width : number; height : number } | null = null;
        let settle : ReturnType<typeof setTimeout>;

        // Below this the container cannot have been laid out yet — no usable board is
        // this small, so there is nothing to be gained by measuring it
        const SMALLEST_USABLE = 160;

        const considerSize = (width : number, height : number) => {
            if (width < SMALLEST_USABLE || height < SMALLEST_USABLE) {
                return;
            }

            // Ignore the pixel-level noise a resize observer reports constantly
            if (built
                && Math.abs(width - built.width) < 8
                && Math.abs(height - built.height) < 8) {
                return;
            }

            // Don't rebuild the board once the round is over
            if (built && !shouldRecalculateOnResize()) {
                return;
            }

            built = {width, height};

            clearTimeout(settle);
            settle = setTimeout(calculateGrid, 60);
        };

        const observer = new ResizeObserver(entries => {
            const box = entries[0]?.contentRect;
            if (box) {
                considerSize(box.width, box.height);
            }
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
            const rect = containerRef.current.getBoundingClientRect();
            considerSize(rect.width, rect.height);
        }

        return () => {
            observer.disconnect();
            clearTimeout(settle);
        };
    };

    return {
        containerRef,
        setupGrid,
    };
};
