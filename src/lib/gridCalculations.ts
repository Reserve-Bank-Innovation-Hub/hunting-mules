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

    // Start with the ideal square grid for MAX_CELLS
    let targetCells = gridConfig.MAX_CELLS;
    let bestConfig = {rows : 0, columns : 0, totalCells : 0};

    // Try to find the best configuration that maximizes cells while fitting the space
    for (let testRows = maxPossibleRows; testRows >= 3; testRows--) {
        for (let testCols = maxPossibleCols; testCols >= 3; testCols--) {
            const totalCells = testRows * testCols;

            // Skip if this exceeds our maximum
            if (totalCells > targetCells) continue;

            // Check if this configuration would fit with proportional spacing
            const testSpacingX = (availableWidth - (testCols * gridConfig.CIRCLE_SIZE)) / (testCols - 1);
            const testSpacingY = (availableHeight - (testRows * gridConfig.CIRCLE_SIZE)) / (testRows - 1);

            // Ensure minimum spacing is maintained
            if (testSpacingX >= gridConfig.MIN_SPACING && testSpacingY >= gridConfig.MIN_SPACING) {
                // Prefer configurations closer to our target
                if (totalCells > bestConfig.totalCells) {
                    bestConfig = {
                        rows       : testRows,
                        columns    : testCols,
                        totalCells : totalCells,
                    };
                }
            }
        }
    }

    // If we didn't find a valid configuration, use a fallback
    if (bestConfig.totalCells === 0) {
        // Fallback to a minimal grid that definitely fits
        bestConfig.rows = Math.min(5, maxPossibleRows);
        bestConfig.columns = Math.min(5, maxPossibleCols);
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

    console.log(`Grid: ${bestConfig.rows}x${bestConfig.columns} (${bestConfig.totalCells} cells), Spacing: ${spacingX.toFixed(
        1)}x${spacingY.toFixed(1)}px`);

    return {
        rows     : bestConfig.rows,
        columns  : bestConfig.columns,
        spacingX : spacingX,
        spacingY : spacingY,
        startX   : startX,
        startY   : startY,
    };
};