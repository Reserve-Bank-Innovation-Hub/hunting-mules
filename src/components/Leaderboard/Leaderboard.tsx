"use client";

// REACT CORE ==========================================================================================================
import React from "react";

// LIB =================================================================================================================
import { RankedEntry } from "$lib/leaderboard";

// STYLES ==============================================================================================================
import "./leaderboard.css";

interface LeaderboardProps {
    rows              : RankedEntry[];
    visibleRows       : number;            // How many of the top places to show
    isConnected       : boolean;
    // "strip" is the thin list that sits beside the catch count while the round is
    // running. "blocks" is the result screen: the same data as full-width rows.
    variant          ?: "strip" | "blocks";
    // Which place belongs to the player. During a round the live row knows itself;
    // once the run is saved it is an ordinary row, so the position is handed in.
    highlightPosition ?: number | null;
}

/**
 * The standings.
 *
 * Rows are keyed on the run rather than the position, so when the player overtakes
 * somebody the two rows slide past each other instead of their text swapping over
 * in place — the movement is the point.
 *
 * The player's own row is always shown. If they are not in the top places yet it is
 * pinned underneath, so they can see the gap they are closing.
 */
export const Leaderboard = ({
    rows,
    visibleRows,
    isConnected,
    variant = "strip",
    highlightPosition = null,
} : LeaderboardProps) => {
    const isMine = (row : RankedEntry) =>
        row.isLive || (highlightPosition !== null && row.position === highlightPosition);

    const isPanel = variant === "blocks";

    // Show the board around the player rather than the top of it with the player
    // stuck underneath. Pinning them to the bottom meant there was never anybody
    // below them — no sense of who they had just passed, or who was still within
    // reach. The window keeps at least one place below them wherever it can.
    const mineIndex = rows.findIndex(isMine);
    let start = 0;

    if (mineIndex >= 0) {
        const end = Math.min(rows.length, Math.max(mineIndex + 2, visibleRows));
        start = Math.max(0, end - visibleRows);
    }

    const shown = rows.slice(start, start + visibleRows);
    const hiddenAbove = start;
    const hiddenBelow = Math.max(0, rows.length - (start + shown.length));

    return (
        <div className={`leaderboard is-${variant}`}>
            {/* The result screen carries its own heading on the panel frame */}
            {!isPanel && (
                <span className="leaderboard-title">
                    <i className="leaderboard-cup" aria-hidden="true" />LEADERBOARD
                </span>
            )}

            {rows.length === 0 ? (
                <span className="leaderboard-empty">
                    {isConnected ? "No runs yet — this one is the first" : "Board unavailable"}
                </span>
            ) : (
                <>
                    {isPanel && (
                        <div className="leaderboard-headings" aria-hidden="true">
                            <span className="leaderboard-position">RANK</span>
                            <span className="leaderboard-name">PLAYER</span>
                            <span className="leaderboard-score">SCORE</span>
                        </div>
                    )}

                    <ol className="leaderboard-rows">
                        {/* Marks that the window is not the top of the board */}
                        {hiddenAbove > 0 && (
                            <li className="leaderboard-gap" aria-hidden="true">···</li>
                        )}

                        {shown.map(row => (
                            <LeaderboardRow key={`${row.name}-${row.at}`} row={row} isMine={isMine(row)} />
                        ))}

                        {hiddenBelow > 0 && (
                            <li className="leaderboard-gap" aria-hidden="true">···</li>
                        )}
                    </ol>
                </>
            )}
        </div>
    );
};

const LeaderboardRow = ({row, isMine} : { row : RankedEntry; isMine : boolean }) => (
    <li className={`leaderboard-row ${isMine ? "is-mine" : ""}`}>
        <span className="leaderboard-position">{row.position}</span>
        <span className="leaderboard-name">
            {row.name}
            {isMine && <span className="leaderboard-you">YOU</span>}
        </span>
        <span className="leaderboard-score">{row.score}</span>
    </li>
);
