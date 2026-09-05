"use client";

// SECTION 3 — 4 PATTERN IDENTIFICATION: the hint bar along the bottom of the board.

// LIB =================================================================================================================
import { PatternConfig } from "$lib/roundConfig";

// STYLES ==============================================================================================================
import "./board-hints.css";

interface BoardHintsProps {
    pattern : PatternConfig;
}

/**
 * Three reminders across the foot of the board: what to do, what this pattern
 * looks like, and how to act on it.
 *
 * It is there for the whole round because the tutorial card is not — a player
 * who has dismissed it and then loses the thread has nowhere else to look. The
 * middle cell is the only one that changes, and it changes with the pattern.
 *
 * Only that middle cell is red. Looking and tapping are ordinary things to be
 * doing; the shape in the middle is the suspicious thing being hunted, and red
 * has to keep meaning that.
 */
export const BoardHints = ({pattern} : BoardHintsProps) => (
    <div className="board-hints" role="note">
        <span className="board-hint">
            <i className="board-hint-icon is-watch" aria-hidden="true" />
            <span className="board-hint-copy">
                Spot the flow
                <br />Track the money
            </span>
        </span>

        <span className="board-hint is-shape">
            <i className="board-hint-icon is-alert" aria-hidden="true" />
            <span className="board-hint-copy">
                {pattern.shape[0]}
                <br />{pattern.shape[1]}
            </span>
        </span>

        <span className="board-hint">
            <i className="board-hint-icon is-tap" aria-hidden="true" />
            <span className="board-hint-copy">
                Tap to catch
                <br />the pattern
            </span>
        </span>
    </div>
);
