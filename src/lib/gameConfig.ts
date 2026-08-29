// Per-round tweaks to how the grid is built. A round may want bigger, sparser
// nodes (the low-balance round needs room for a readable balance under each one).
export interface GridOverrides {
    CIRCLE_SIZE     ? : { desktop : number; mobile : number };
    MIN_SPACING     ? : { desktop : number; mobile : number };
    ACCOUNT_DENSITY ? : number;
    MIN_CELLS       ? : number;
    TARGET_CELLS    ? : number;   // Ask for a flat number of accounts instead of a share of the screen
}

// The grid helpers are called from deep inside node/ripple/transaction components
// that have no idea which round is running, so the active round parks its
// overrides here when it starts.
let activeGridOverrides : GridOverrides = {};

export const setActiveGridOverrides = (overrides : GridOverrides) => {
    activeGridOverrides = overrides;
};

export const getGridConfig = () => {
    const isMobile = window.innerWidth < 768;
    const pick = (override : { desktop : number; mobile : number } | undefined, fallback : number) =>
        override ? (isMobile ? override.mobile : override.desktop) : fallback;

    return {
        CIRCLE_SIZE            : pick(activeGridOverrides.CIRCLE_SIZE, isMobile ? 48 : 64),
        MIN_SPACING            : pick(activeGridOverrides.MIN_SPACING, isMobile ? 32 : 15),
        PADDING                : isMobile ? 32 : 50,
        MAX_CELLS              : 100,                 // Maximum total cells the screen may hold at full density
        ACCOUNT_DENSITY        : activeGridOverrides.ACCOUNT_DENSITY ?? 0.3,
        MIN_CELLS              : activeGridOverrides.MIN_CELLS ?? 12,
        TARGET_CELLS           : activeGridOverrides.TARGET_CELLS,
        SHAPE_TOLERANCE        : 0.9,                 // Allow this fraction of the target to buy a better-shaped grid
        TARGET_MULE_PERCENTAGE : 0.25,                // Fallback share of cells that are mules
        MAX_MULE_PERCENTAGE    : 0.3,                 // A round may never ask for more mules than this share of cells
    };
};

export const MULE_ACCOUNTS = 25;

export const TRANSACTION_CONFIG = {
    STARTING_AMOUNT         : 10000000,  // ₹1,00,00,000
    TRANSACTIONS_PER_SECOND : 2,         // Number of new transactions per second
    SCALE_TIME_MS           : 300,       // Time to scale up/down in milliseconds
    TRANSACTION_TIME_MS     : 1100,      // Time to fly between nodes in milliseconds
    MAX_CONCURRENT          : 20,        // Maximum concurrent transactions for performance
};

// Every account starts here in the low-balance round, and should end up back here
export const LOW_BALANCE_CONFIG = {
    RESTING_BALANCE   : 500,      // The few hundred rupees a real account idles at
    INFLOW_MIN        : 40000,    // A "large amount" lands...
    INFLOW_MAX        : 90000,
    HOLD_MS           : 1400,     // ...sits for barely a moment...
    JITTER            : 220,      // Small noise so resting balances are not identical
};

// One transaction's full scale-up, flight and scale-down
export const FLIGHT_MS =
    TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS;
