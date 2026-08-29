"use client";

// REACT CORE ==========================================================================================================
import React from "react";
import Link from "next/link";

// UI ==================================================================================================================
import { Button } from "fictoan-react";

// STYLES ==============================================================================================================
import "./score-bar.css";

interface ScoreBarProps {
    mulesFoundCount         : number;
    totalMuleCount          : number;
    totalMoneyInCirculation : number;
    isFinished              : boolean;
    ranOutOfMoney           : boolean;
}

/**
 * Lives along the bottom 15% of the screen during play as a compact catch count,
 * then grows to fill the screen once the last pattern is done and becomes the result.
 */
export const ScoreBar = ({
    mulesFoundCount,
    totalMuleCount,
    totalMoneyInCirculation,
    isFinished,
    ranOutOfMoney,
} : ScoreBarProps) => {
    const noun = mulesFoundCount === 1 ? "MULE ACCOUNT" : "MULE ACCOUNTS";

    return (
        <div className={`score-bar ${isFinished ? "is-result" : ""}`}>
            {!isFinished ? (
                <div className="score-bar-live">
                    <span className="score-bar-label">CAUGHT</span>
                    <span className="score-bar-count">
                        {mulesFoundCount}<span className="score-bar-of">/{totalMuleCount}</span>
                    </span>
                    <span className="score-bar-label">MULE ACCOUNTS</span>
                </div>
            ) : (
                <div className="score-bar-result">
                    <span className="score-bar-result-lead">
                        {ranOutOfMoney ? "THE MONEY RAN OUT" : "TIME UP"}
                    </span>

                    <h1 className="score-bar-result-headline">
                        YOU CAUGHT {mulesFoundCount} {noun}
                    </h1>

                    <span className="score-bar-result-sub">
                        out of {totalMuleCount} planted · ₹{totalMoneyInCirculation.toLocaleString("en-IN")} still in circulation
                    </span>

                    <div className="score-bar-result-actions">
                        <Link href="/">
                            <Button className="eightbit-btn">PLAY AGAIN</Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};
