// Everything the round is tuned by lives here. Nothing below should be re-declared
// at a call site — if a number matters to gameplay, it belongs in this file.

// THE ROUND ===========================================================================================================
export const ROUND_DURATION = 80;          // Seconds of play. Pattern intros are not on the clock.
export const ACCOUNT_COUNT  = 40;          // Accounts the board aims for, subject to what the screen can hold
export const ACTIVE_MULES   = 8;           // Mules running at any one moment, topped back up as they are caught

// A caught account is shut down and stays shut down: stamped, frozen and out of
// play for the rest of its round. Each pattern is its own round, and every round
// deals a fresh board, so the stamps only ever have to last twenty seconds — long
// enough to read as a record of what you caught, short enough that the board never
// runs out of accounts to catch.
//
// A mule still needs ordinary accounts around it to pay and be paid by, so no new
// one is recruited once the untouched pool falls this low. With a fresh board every
// twenty seconds this is a backstop rather than something a round normally reaches.
export const MIN_ORDINARY_ACCOUNTS = 4;

// THE FIELD VISITS ====================================================================================================
// After the clock runs out, this many of the player's frozen accounts go to the
// branch for enhanced due diligence, and this many of those turn out to be innocent.
// Three is the fewest that lets one false positive hide among confirmed cases; two
// would make the innocent one a coin toss. This is a kiosk with a queue behind it.
//
// EDD_ENABLED is the default for the kiosk. Opening any screen with ?edd=off (or
// ?edd=on) overrides it for that session without a rebuild, and a player can always
// skip from the brief. See eddMode.ts.
export const EDD_ENABLED  = true;
export const EDD_VISITS   = 3;
export const EDD_RELEASES = 1;

// TRANSACTION VOLUME ==================================================================================================
export const TRANSACTION_CONFIG = {
    STARTING_AMOUNT         : 10000000,  // ₹1,00,00,000
    TRANSACTIONS_PER_SECOND : 2,         // Baseline ordinary payments per second, before the ramp below
    SCALE_TIME_MS           : 300,       // Time to scale up/down in milliseconds
    TRANSACTION_TIME_MS     : 1100,      // Time to fly between nodes in milliseconds
    MAX_CONCURRENT          : 28,        // Cap on background traffic, so the board never turns to soup
};

// One transaction's full scale-up, flight and scale-down
export const FLIGHT_MS =
    TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS;

// Across the board, this version runs busier than the last one
export const TRANSACTION_DENSITY_INCREASE = 0.15;

// ...and on top of that, each stage of the round is busier than the one before it.
// Indexed by how many patterns are unlocked, so it rises as the player learns more.
export const STAGE_DENSITY = [ 1, 1, 1.12, 1.26, 1.42 ];

export const densityAtStage = (unlockedPatterns : number) =>
    (STAGE_DENSITY[unlockedPatterns] ?? 1) * (1 + TRANSACTION_DENSITY_INCREASE);

// How often a wave of routines goes out, before the density ramp is applied
export const BASE_BURST_INTERVAL = 2600;

// How many mules set off at the same moment, indexed by patterns unlocked.
//
// Several routines overlap deliberately: one at a time reads as a queue of tidy
// demonstrations, and the player learns to watch whichever corner is lit rather
// than to recognise a pattern. With two or three running at once they have to scan
// the board and tell them apart, which is the actual skill. The wave prefers a
// different pattern for each mule, so what overlaps is usually two kinds of
// behaviour rather than the same one twice.
export const SIMULTANEOUS_BURSTS = [ 0, 1, 2, 2, 3 ];

export const burstsAtStage = (unlockedPatterns : number) =>
    SIMULTANEOUS_BURSTS[unlockedPatterns] ?? 1;

// How often a plausible-but-innocent decoy plays out
export const BASE_DECOY_INTERVAL = 3400;

// PATTERN CUES ========================================================================================================
// A pattern transaction gets a line that travels its route. Ordinary traffic and
// decoys never get one — the cue is what marks a movement as part of a pattern.
//
// The cue now sets off when the card does, rather than waiting until it is halfway
// across. Starting late left only half the flight to draw the whole route in, which
// is why the line shot across too fast to follow — it had to cover the same distance
// in a fraction of the time.
export const PATTERN_FLASH_DELAY = TRANSACTION_CONFIG.SCALE_TIME_MS;

// Long enough that the line travels at roughly the pace of the money it is tracing
// rather than outrunning it. The route is fully drawn by 1277ms and the line has
// faded out by 1450ms — the money lands at 1400ms, so the fade overlaps the arrival
// and the cue reads as dissolving with it rather than lingering after it.
export const PATTERN_FLASH_DURATION = 1150;

// The reminder strip is always on screen. Roughly this often its instruction text
// pulses — just the text, never the strip itself, which stays put.
export const PATTERN_REMINDER_INTERVAL = 4000;

// ACCOUNT BALANCES ====================================================================================================
// Every account carries a balance for the whole round. The spread matters: without
// genuinely rich accounts on the board, "low balance" would mean nothing, and a big
// number would be enough to give a mule away on its own.
export const BALANCE_PROFILE = {
    LOW  : {min : 250,    max : 1900,   share : 0.45},
    MID  : {min : 9000,   max : 70000,  share : 0.30},
    HIGH : {min : 140000, max : 900000, share : 0.25},
};

// The low-balance pattern itself. A few hundred rupees handles a sum a hundred
// times its size, and passes almost all of it straight on.
export const LOW_BALANCE_CONFIG = {
    RESTING_MIN : 250,
    RESTING_MAX : 1400,
    INFLOW_MIN  : 60000,
    INFLOW_MAX  : 180000,
    HOLD_MIN_MS : 1100,     // How long the money sits before it moves on again
    HOLD_MAX_MS : 1900,
    RETAIN_MIN  : 0.02,     // The slice the mule keeps, so the outflow is slightly smaller
    RETAIN_MAX  : 0.10,
    // An account only runs this pattern while it is genuinely sitting on very little.
    // A well-funded account taking in a lakh and passing it on is ordinary business —
    // it is the mismatch that makes the pattern, so there is nothing to show without it.
    MAX_TO_RUN  : 9000,
};

// A decoy account that took in a large sum gives it back to where it came from
// after this long — far too slow, and to the wrong account, to be the pattern
export const DECOY_SETTLE_MS = 4600;

// THE GRID ============================================================================================================
export const getGridConfig = () => {
    const isMobile = window.innerWidth < 768;

    return {
        CIRCLE_SIZE            : isMobile ? 48 : 64,
        // Room under every account for its balance chip, at any screen size
        MIN_SPACING            : isMobile ? 34 : 42,
        PADDING                : isMobile ? 28 : 46,
        MAX_CELLS              : 100,                 // Maximum total cells the screen may hold at full density
        MIN_CELLS              : 12,
        TARGET_CELLS           : ACCOUNT_COUNT,
        SHAPE_TOLERANCE        : 0.9,                 // Allow this fraction of the target to buy a better-shaped grid
        MAX_MULE_PERCENTAGE    : 0.3,                 // Never more mules than this share of the board
    };
};
