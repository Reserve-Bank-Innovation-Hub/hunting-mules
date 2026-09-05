// SECTION 3 — the figures on the results panel.

/**
 * The three marks beside the closing figures.
 *
 * One family: a 24-unit box, 1.9 stroke, round caps and joins, drawn in
 * `currentColor` — the same construction as the icons in the top bar and the cup
 * beside the leaderboard heading, so the results screen does not arrive in a
 * different hand from the game that led to it.
 *
 * They replace three PNGs: two pixel-art icons left over from last year's game,
 * and a bank facade that was standing in for "verdicts" and meant nothing there.
 */

const box = {
    viewBox      : "0 0 24 24",
    fill         : "none",
    stroke       : "currentColor",
    strokeWidth  : 1.9,
    strokeLinecap  : "round" as const,
    strokeLinejoin : "round" as const,
};

/** MULES CAUGHT — a target with a mark in the centre. */
export const CaughtMark = ({className} : { className ? : string }) => (
    <svg className={className} {...box} aria-hidden="true">
        <circle cx="12" cy="12" r="8.6" />
        <circle cx="12" cy="12" r="4.4" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
);

/** LEADERBOARD POSITION — a cup, the same one the board heading carries. */
export const PositionMark = ({className} : { className ? : string }) => (
    <svg className={className} {...box} aria-hidden="true">
        <path d="M6.6 3.2h10.8v5.4a5.4 5.4 0 0 1-10.8 0Z" />
        <path d="M6.6 4.6H3.9v1.9a3.2 3.2 0 0 0 2.9 3.2" />
        <path d="M17.4 4.6h2.7v1.9a3.2 3.2 0 0 1-2.9 3.2" />
        <path d="M12 14v3.6" />
        <path d="M8.4 20.8h7.2l-.9-3.2H9.3Z" />
    </svg>
);

/** EDD VERDICTS — a file with a call made on it. */
export const VerdictMark = ({className} : { className ? : string }) => (
    <svg className={className} {...box} aria-hidden="true">
        <path d="M8.4 3.4h7.2a1.6 1.6 0 0 1 1.6 1.6v1.2H6.8V5a1.6 1.6 0 0 1 1.6-1.6Z" />
        <path d="M6.8 5.6H5.4a1.6 1.6 0 0 0-1.6 1.6v12a1.6 1.6 0 0 0 1.6 1.6h13.2a1.6 1.6 0 0 0 1.6-1.6v-12a1.6 1.6 0 0 0-1.6-1.6h-1.4" />
        <path d="m8.6 13.4 2.4 2.4 4.6-4.8" />
    </svg>
);
