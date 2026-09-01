// OTHER ===============================================================================================================
import { GridDimensions } from "./gameTypes";
import { getGridConfig } from "./gameConfig";

export const calculateGridDimensions = (containerRect : DOMRect) : GridDimensions => {
    const gridConfig = getGridConfig();
    const availableWidth = containerRect.width - (gridConfig.PADDING * 2);
    const availableHeight = containerRect.height - (gridConfig.PADDING * 2);

    // Calculate maximum possible cells that could fit with minimum spacing
    const maxPossibleCols = Math.floor((availableWidth + gridConfig.MIN_SPACING) /
        (gridConfig.CIRCLE_SIZE + gridConfig.MIN_SPACING));
    const maxPossibleRows = Math.floor((availableHeight + gridConfig.MIN_SPACING) /
        (gridConfig.CIRCLE_SIZE + gridConfig.MIN_SPACING));

    // How many accounts this screen could hold if it were packed full
    const fullCapacity = Math.min(
        gridConfig.MAX_CELLS,
        Math.max(0, maxPossibleRows) * Math.max(0, maxPossibleCols),
    );

    // ...then aim for the configured account count, capped by what actually fits.
    const targetCells = Math.max(
        gridConfig.MIN_CELLS,
        Math.min(gridConfig.TARGET_CELLS, fullCapacity),
    );

    // A grid slightly under the target is fine if it sits better on the screen
    const minAcceptableCells = Math.max(
        gridConfig.MIN_CELLS,
        Math.ceil(targetCells * gridConfig.SHAPE_TOLERANCE),
    );

    let bestConfig = {rows : 0, columns : 0, totalCells : 0};
    let bestEvenness = Infinity;
    // Fullest grid seen, used only if nothing lands inside the acceptable range
    let fullestConfig = {rows : 0, columns : 0, totalCells : 0};

    // Find the configuration that spreads the circles most evenly across the space
    for (let testRows = maxPossibleRows; testRows >= 3; testRows--) {
        for (let testCols = maxPossibleCols; testCols >= 3; testCols--) {
            const totalCells = testRows * testCols;

            // Skip if this exceeds the number of accounts we want on screen
            if (totalCells > targetCells) continue;

            // Check if this configuration would fit with proportional spacing
            const testSpacingX = (availableWidth - (testCols * gridConfig.CIRCLE_SIZE)) / Math.max(1, testCols - 1);
            const testSpacingY = (availableHeight - (testRows * gridConfig.CIRCLE_SIZE)) / Math.max(1, testRows - 1);

            // Ensure minimum spacing is maintained
            if (testSpacingX < gridConfig.MIN_SPACING || testSpacingY < gridConfig.MIN_SPACING) continue;

            if (totalCells > fullestConfig.totalCells) {
                fullestConfig = {rows : testRows, columns : testCols, totalCells : totalCells};
            }

            // Too sparse to be worth considering on its shape alone
            if (totalCells < minAcceptableCells) continue;

            // How lopsided the gaps are — 1 means the horizontal and vertical gaps match
            const evenness = Math.max(testSpacingX, testSpacingY) / Math.min(testSpacingX, testSpacingY);

            // Prefer the most even spread, and among equals the fuller grid
            if (evenness < bestEvenness ||
                (evenness === bestEvenness && totalCells > bestConfig.totalCells)) {
                bestConfig = {rows : testRows, columns : testCols, totalCells : totalCells};
                bestEvenness = evenness;
            }
        }
    }

    // Nothing hit the acceptable range, so take the fullest grid that fits at all
    if (bestConfig.totalCells === 0) {
        bestConfig = fullestConfig;
    }

    // If we didn't find a valid configuration, use a fallback
    if (bestConfig.totalCells === 0) {
        // Fallback to a minimal grid that definitely fits
        bestConfig.rows = Math.max(1, Math.min(3, maxPossibleRows));
        bestConfig.columns = Math.max(1, Math.min(3, maxPossibleCols));
        bestConfig.totalCells = bestConfig.rows * bestConfig.columns;
    }

    // Calculate proportional spacing to fill the available space
    const spacingX = Math.max(
        gridConfig.MIN_SPACING,
        (availableWidth - (bestConfig.columns * gridConfig.CIRCLE_SIZE)) / Math.max(1, bestConfig.columns - 1),
    );
    const spacingY = Math.max(
        gridConfig.MIN_SPACING,
        (availableHeight - (bestConfig.rows * gridConfig.CIRCLE_SIZE)) / Math.max(1, bestConfig.rows - 1),
    );

    // Calculate the actual grid dimensions
    const totalGridWidth = bestConfig.columns * gridConfig.CIRCLE_SIZE + (bestConfig.columns - 1) * spacingX;
    const totalGridHeight = bestConfig.rows * gridConfig.CIRCLE_SIZE + (bestConfig.rows - 1) * spacingY;

    // Center the grid in the available space
    const startX = gridConfig.PADDING + (availableWidth - totalGridWidth) / 2;
    const startY = gridConfig.PADDING + (availableHeight - totalGridHeight) / 2;

    return {
        rows     : bestConfig.rows,
        columns  : bestConfig.columns,
        spacingX : spacingX,
        spacingY : spacingY,
        startX   : startX,
        startY   : startY,
    };
};
