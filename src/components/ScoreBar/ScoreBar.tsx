"use client";

// REACT CORE ==========================================================================================================
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

// UI ==================================================================================================================
import { Button } from "fictoan-react";

// LOCAL COMPONENTS ====================================================================================================
import { Leaderboard } from "$components/Leaderboard/Leaderboard";

// ASSETS ==============================================================================================================
// The success graphic the original game showed on its victory screen — a mule
// struck through. It was the reward for a clean run then, and it is the reward for
// finishing the eighty seconds now.
import MulesEliminatedImage from "../../assets/images/mules-eliminated.png";
// The two pixel icons, with their baked-in cream background cleared and the empty
// margin trimmed, so they sit on the result blocks rather than in a paler square
// The branch, for the verdicts the player gave on the field visits

// LIB =================================================================================================================
import { EDD_VISITS } from "$lib/gameConfig";
import { RankedEntry } from "$lib/leaderboard";

import { CaughtMark, PositionMark, VerdictMark } from "$components/ResultIcons/ResultIcons";

// STYLES ==============================================================================================================
import "./score-bar.css";

// 2nd on the left, 1st in the middle, 3rd on the right — the winner in the centre
// rather than at the end of a list
const PODIUM_ORDER = [ 1, 0, 2 ];

/**
 * The top three, given the space a result deserves before the rest of the board is
 * listed. The first place stands taller than the two beside it, and a place that
 * belongs to the player takes the amber the rest of the game uses for their things.
 */
const Podium = ({rows, highlightPosition} : {
    rows : RankedEntry[];
    highlightPosition : number | null;
}) => {
    const top = rows.slice(0, 3);

    if (top.length === 0) {
        return null;
    }

    // A board with one or two runs on it simply shows fewer plinths
    const slots = PODIUM_ORDER.map(index => top[index]).filter(Boolean);

    return (
        <ol className="score-bar-podium">
            {slots.map(row => {
                const isMine = row.isLive || row.position === highlightPosition;

                return (
                    <li
                        key={`${row.name}-${row.at}`}
                        className={[
                            "score-bar-podium-slot",
                            row.position === 1 ? "is-first" : "",
                            isMine ? "is-mine" : "",
                        ].filter(Boolean).join(" ")}
                    >
                        {/* No trophy — standing on a podium already says they placed,
                            and three of them said it three times over */}
                        <span className="score-bar-podium-label">RANK</span>
                        <span className="score-bar-podium-rank">
                            {String(row.position).padStart(2, "0")}
                        </span>
                        <span className="score-bar-podium-name">{row.name}</span>
                        <span className="score-bar-podium-score">{row.score}</span>
                    </li>
                );
            })}
        </ol>
    );
};

// Where the original game sent players who wanted to know more about mule accounts
const LEARN_MORE_URL = "https://www.figma.com/proto/hU8AxWIfkTIrNKKkqWxhh7/GFF?page-id=11%3A77&node-id=465-1225&viewport=-5%2C286%2C0.22&t=0gqj5u5AkwJ3TkMZ-8&scaling=scale-down&content-scaling=fixed&starting-point-node-id=465%3A1225&hide-ui=1";

interface ScoreBarProps {
    mulesFoundCount : number;
    isFinished      : boolean;
    eddCorrect      : number | null;   // Field-visit verdicts right. Null if the visits did not run.
    playAgainHref   : string;          // Back to the home screen, carrying the kiosk's settings with it
    playerName      : string;
    rows            : RankedEntry[];
    position        : number | null;
    isConnected     : boolean;
}

/**
 * The bottom band: the live catch count alongside the standings, growing to fill
 * the screen once the 80 seconds are up and becoming the result.
 *
 * One number, counting up. No target, no denominator, and nothing here ever
 * subtracts — a wrong call simply is not a catch. The leaderboard beside it
 * re-ranks on every catch, so the player watches themselves climb as they play.
 */
export const ScoreBar = ({
    mulesFoundCount,
    isFinished,
    eddCorrect,
    playAgainHref,
    playerName,
    rows,
    position,
    isConnected,
} : ScoreBarProps) => {
    // HOW MANY PLACES FIT ============================================================================================
    // The board was pinned at four rows on a screen with room for three times
    // that, so most of the panel was empty and the player could not see who else
    // was on it. Measured from the space the board is actually given.
    const boardRef = useRef<HTMLDivElement>(null);
    const [ boardRows, setBoardRows ] = useState(4);

    useEffect(() => {
        const frame = boardRef.current;
        if (!frame || typeof ResizeObserver === "undefined") {
            return;
        }
        const measure = () => {
            // Everything above the rows — the heading and the podium — has to come
            // off the top before the remainder can be divided into places.
            const used = Array.from(frame.children)
                .filter(child => !child.classList.contains("leaderboard"))
                .reduce((total, child) => total + (child as HTMLElement).offsetHeight, 0);
            const row  = frame.querySelector(".leaderboard-row") as HTMLElement | null;
            const step = (row?.offsetHeight ?? 46) + 6;
            const room = frame.clientHeight - used - 8;
            setBoardRows(Math.max(4, Math.min(16, Math.floor(room / step))));
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(frame);
        return () => observer.disconnect();
    }, [ rows.length ]);

    if (!isFinished) {
        return (
            <div className="score-bar">
                {/* Just the standings. The catch count was alongside them, saying the
                    same thing the player's own highlighted row already says. */}
                <div className="score-bar-playing">
                    <span className="score-bar-playing-title">
                        <i className="leaderboard-cup" aria-hidden="true" />LEADERBOARD
                    </span>

                    {/* The same tiles as the results screen, so the board a player
                        watches while playing is the board they end on */}
                    <Leaderboard
                        rows={rows}
                        visibleRows={4}
                        isConnected={isConnected}
                        variant="blocks"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="score-bar is-result">
            <div className="score-bar-result">

                {/* THE REWARD ///////////////////////////////////////////////////////////////////////////////// */}
                <img
                    className="score-bar-result-graphic"
                    src={MulesEliminatedImage.src}
                    alt="Mules eliminated"
                />

                {/* WHOSE SCORE THIS IS //////////////////////////////////////////////////////////////////////// */}
                {/* "Time's up" was said when the clock ran out, before the field
                    visits. By the time this screen rises, the case is closed. */}
                <span className="score-bar-result-lead">CASE CLOSED</span>

                {playerName && (
                    <h1
                        className="score-bar-result-name"
                        // Past about ten characters the name steps down in size rather
                        // than wrapping. A name on two lines stops reading as a name.
                        style={{"--name-scale" : Math.min(1, 10 / playerName.length)} as React.CSSProperties}
                    >
                        {playerName}
                    </h1>
                )}

                <span className="score-bar-result-sub">YOUR SCORE</span>

                {/* THE FIGURES //////////////////////////////////////////////////////////////////////////////// */}
                {/* Two facts, or three: how many were caught, where that placed them,
                    and, if the field visits ran, how many verdicts they got right. The
                    verdicts are deliberately not part of the score. Catching and
                    verifying are different skills, and the board ranks the first. */}
                <div className={`score-bar-result-figures ${eddCorrect !== null ? "has-verdicts" : ""}`}>
                    <div className="score-bar-figure">
                        <span className="score-bar-figure-label">MULES CAUGHT</span>
                        <div className="score-bar-figure-row">
                            <CaughtMark className="score-bar-figure-icon" />
                            <span className="score-bar-figure-value">{mulesFoundCount}</span>
                        </div>
                    </div>

                    <div className="score-bar-figure">
                        <span className="score-bar-figure-label">LEADERBOARD POSITION</span>
                        <div className="score-bar-figure-row">
                            <PositionMark className="score-bar-figure-icon" />
                            <span className="score-bar-figure-value">
                                {/* Only ever a real position — a dash rather than an
                                    invented number if the board could not be reached */}
                                {position !== null ? `#${position}` : "—"}
                            </span>
                        </div>
                    </div>

                    {/* Only when the visits ran. Skipped or switched off, the screen is
                        exactly as it was before the visits existed. */}
                    {eddCorrect !== null && (
                        <div className="score-bar-figure">
                            <span className="score-bar-figure-label">EDD VERDICTS</span>
                            <div className="score-bar-figure-row">
                                <VerdictMark className="score-bar-figure-icon" />
                                <span className="score-bar-figure-value">
                                    {eddCorrect}/{EDD_VISITS}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* THE ACTIONS //////////////////////////////////////////////////////////////////////////////// */}
                {/* Sitting on the background with nothing framing them — the pixel
                    buttons already carry their own edge */}
                <div className="score-bar-result-actions">
                    <Link href={playAgainHref}>
                        <Button className="toon-btn failure">PLAY AGAIN</Button>
                    </Link>

                    {/* The same destination the original game's result modals used */}
                    <a href={LEARN_MORE_URL} target="_blank" rel="noreferrer">
                        <Button className="toon-btn">LEARN MORE</Button>
                    </a>
                </div>

                {/* THE STANDINGS ////////////////////////////////////////////////////////////////////////////// */}
                {/* Framed the way the pattern tutorial cards are — dark ground, amber
                    edge — so it reads as another panel from the same game. The player's
                    position sits on the frame itself rather than in a block of its own,
                    which is what ties their result to the board underneath it. */}
                <div className="score-bar-board" ref={boardRef}>
                    <div className="score-bar-board-head">
                        <span className="score-bar-board-title">
                            <i className="leaderboard-cup" aria-hidden="true" />LEADERBOARD
                        </span>
                    </div>

                    <Podium rows={rows} highlightPosition={position} />

                    {/* Fourth place onward, still windowed so the player stays in view
                        with someone below them wherever possible */}
                    {rows.length > 3 && (
                        <Leaderboard
                            rows={rows.slice(3)}
                            visibleRows={boardRows}
                            isConnected={isConnected}
                            variant="blocks"
                            highlightPosition={position}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
