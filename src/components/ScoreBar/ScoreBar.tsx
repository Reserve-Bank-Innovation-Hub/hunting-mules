"use client";

// REACT CORE ==========================================================================================================
import React from "react";
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
import TargetIcon from "../../assets/images/icon-target.png";
import TrophyIcon from "../../assets/images/icon-trophy.png";

// LIB =================================================================================================================
import { RankedEntry } from "$lib/leaderboard";

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
    playerName,
    rows,
    position,
    isConnected,
} : ScoreBarProps) => {
    if (!isFinished) {
        return (
            <div className="score-bar">
                {/* Just the standings. The catch count was alongside them, saying the
                    same thing the player's own highlighted row already says. */}
                <div className="score-bar-playing">
                    <span className="score-bar-playing-title">LEADERBOARD</span>

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
                <span className="score-bar-result-lead">TIME&rsquo;S UP</span>

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
                {/* Two different facts: how many were caught, and where that placed
                    them. Showing the catch count twice — once as "caught" and again as
                    "score" — said nothing, because one catch is one point and the two
                    numbers could never differ. */}
                <div className="score-bar-result-figures">
                    <div className="score-bar-figure">
                        <span className="score-bar-figure-label">MULES CAUGHT</span>
                        <div className="score-bar-figure-row">
                            <img className="score-bar-figure-icon" src={TargetIcon.src} alt="" />
                            <span className="score-bar-figure-value">{mulesFoundCount}</span>
                        </div>
                    </div>

                    <div className="score-bar-figure">
                        <span className="score-bar-figure-label">LEADERBOARD POSITION</span>
                        <div className="score-bar-figure-row">
                            <img className="score-bar-figure-icon" src={TrophyIcon.src} alt="" />
                            <span className="score-bar-figure-value">
                                {/* Only ever a real position — a dash rather than an
                                    invented number if the board could not be reached */}
                                {position !== null ? `#${position}` : "—"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* THE ACTIONS //////////////////////////////////////////////////////////////////////////////// */}
                {/* Sitting on the background with nothing framing them — the pixel
                    buttons already carry their own edge */}
                <div className="score-bar-result-actions">
                    <Link href="/">
                        <Button className="eightbit-btn failure">PLAY AGAIN</Button>
                    </Link>

                    {/* The same destination the original game's result modals used */}
                    <a href={LEARN_MORE_URL} target="_blank" rel="noreferrer">
                        <Button className="eightbit-btn">LEARN MORE</Button>
                    </a>
                </div>

                {/* THE STANDINGS ////////////////////////////////////////////////////////////////////////////// */}
                {/* Framed the way the pattern tutorial cards are — dark ground, amber
                    edge — so it reads as another panel from the same game. The player's
                    position sits on the frame itself rather than in a block of its own,
                    which is what ties their result to the board underneath it. */}
                <div className="score-bar-board">
                    <div className="score-bar-board-head">
                        <span className="score-bar-board-title">LEADERBOARD</span>
                    </div>

                    <Podium rows={rows} highlightPosition={position} />

                    {/* Fourth place onward, still windowed so the player stays in view
                        with someone below them wherever possible */}
                    {rows.length > 3 && (
                        <Leaderboard
                            rows={rows.slice(3)}
                            visibleRows={4}
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
